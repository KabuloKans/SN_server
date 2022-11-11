/* istanbul ignore file */
import {
  DomainEventService,
  DropboxBackupFailedEvent,
  DuplicateItemSyncedEvent,
  EmailArchiveExtensionSyncedEvent,
  EmailBackupAttachmentCreatedEvent,
  GoogleDriveBackupFailedEvent,
  ItemsSyncedEvent,
  OneDriveBackupFailedEvent,
  UserContentSizeRecalculationRequestedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  createUserContentSizeRecalculationRequestedEvent(userUuid: string): UserContentSizeRecalculationRequestedEvent {
    return {
      type: 'USER_CONTENT_SIZE_RECALCULATION_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        userUuid,
      },
    }
  }

  createDuplicateItemSyncedEvent(itemUuid: string, userUuid: string): DuplicateItemSyncedEvent {
    return {
      type: 'DUPLICATE_ITEM_SYNCED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        itemUuid,
        userUuid,
      },
    }
  }

  createDropboxBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): DropboxBackupFailedEvent {
    return {
      type: 'DROPBOX_BACKUP_FAILED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        muteCloudEmailsSettingUuid,
        email,
      },
    }
  }

  createGoogleDriveBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): GoogleDriveBackupFailedEvent {
    return {
      type: 'GOOGLE_DRIVE_BACKUP_FAILED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        muteCloudEmailsSettingUuid,
        email,
      },
    }
  }

  createOneDriveBackupFailedEvent(muteCloudEmailsSettingUuid: string, email: string): OneDriveBackupFailedEvent {
    return {
      type: 'ONE_DRIVE_BACKUP_FAILED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: email,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        muteCloudEmailsSettingUuid,
        email,
      },
    }
  }

  createItemsSyncedEvent(dto: {
    userUuid: string
    extensionUrl: string
    extensionId: string
    itemUuids: Array<string>
    forceMute: boolean
    skipFileBackup: boolean
    source: 'account-deletion' | 'realtime-extensions-sync'
  }): ItemsSyncedEvent {
    return {
      type: 'ITEMS_SYNCED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }

  createEmailArchiveExtensionSyncedEvent(userUuid: string, extensionId: string): EmailArchiveExtensionSyncedEvent {
    return {
      type: 'EMAIL_ARCHIVE_EXTENSION_SYNCED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userUuid,
          userIdentifierType: 'uuid',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: {
        userUuid,
        extensionId,
      },
    }
  }

  createEmailBackupAttachmentCreatedEvent(dto: {
    backupFileName: string
    backupFileIndex: number
    backupFilesTotal: number
    email: string
  }): EmailBackupAttachmentCreatedEvent {
    return {
      type: 'EMAIL_BACKUP_ATTACHMENT_CREATED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.email,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.SyncingServer,
      },
      payload: dto,
    }
  }
}
