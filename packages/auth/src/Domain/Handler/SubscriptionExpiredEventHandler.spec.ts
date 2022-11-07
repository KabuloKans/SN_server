import 'reflect-metadata'

import { RoleName, SubscriptionName } from '@standardnotes/common'
import { SubscriptionExpiredEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import * as dayjs from 'dayjs'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SubscriptionExpiredEventHandler } from './SubscriptionExpiredEventHandler'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { AnalyticsStoreInterface, StatisticsStoreInterface } from '@standardnotes/analytics'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

describe('SubscriptionExpiredEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let logger: Logger
  let user: User
  let event: SubscriptionExpiredEvent
  let timestamp: number
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface

  const createHandler = () =>
    new SubscriptionExpiredEventHandler(
      userRepository,
      userSubscriptionRepository,
      offlineUserSubscriptionRepository,
      roleService,
      getUserAnalyticsId,
      analyticsStore,
      statisticsStore,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.ProUser,
        },
      ]),
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
    userRepository.save = jest.fn().mockReturnValue(user)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.updateEndsAt = jest.fn()
    userSubscriptionRepository.countActiveSubscriptions = jest.fn().mockReturnValue(13)
    userSubscriptionRepository.findBySubscriptionId = jest
      .fn()
      .mockReturnValue([{ user: Promise.resolve(user) } as jest.Mocked<UserSubscription>])

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.updateEndsAt = jest.fn()

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.removeUserRole = jest.fn()

    timestamp = dayjs.utc().valueOf()

    event = {} as jest.Mocked<SubscriptionExpiredEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.PlusPlan,
      timestamp,
      offline: false,
      totalActiveSubscriptionsCount: 123,
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.setMeasure = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should update the user role', async () => {
    await createHandler().handle(event)

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com')
    expect(roleService.removeUserRole).toHaveBeenCalledWith(user, SubscriptionName.PlusPlan)
  })

  it('should update subscription ends at', async () => {
    await createHandler().handle(event)

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com')
    expect(userSubscriptionRepository.updateEndsAt).toHaveBeenCalledWith(1, timestamp, timestamp)
  })

  it('should update offline subscription ends at', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.updateEndsAt).toHaveBeenCalledWith(1, timestamp, timestamp)
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(roleService.removeUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.updateEndsAt).not.toHaveBeenCalled()
  })
})
