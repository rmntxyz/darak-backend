import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginPublisherAction extends Schema.CollectionType {
  collectionName: 'actions';
  info: {
    singularName: 'action';
    pluralName: 'actions';
    displayName: 'actions';
  };
  options: {
    draftAndPublish: false;
    comment: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    executeAt: Attribute.DateTime;
    mode: Attribute.String;
    entityId: Attribute.Integer;
    entitySlug: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::publisher.action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::publisher.action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<{
        min: 1;
        max: 50;
      }>;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    freebie: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::freebie.freebie'
    >;
    quest_progresses: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::quest-progress.quest-progress'
    >;
    rooms: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::room.room'
    >;
    inventory: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::inventory.inventory'
    >;
    daily_quest_progresses: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::daily-quest-progress.daily-quest-progress'
    >;
    streak: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::streak.streak'
    >;
    followings: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::creator.creator'
    >;
    age_range: Attribute.String;
    gender: Attribute.String;
    user_rooms: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::user-room.user-room'
    >;
    activities: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::activity.activity'
    >;
    star_point: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::star-point.star-point'
    >;
    achievement_progresses: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::achievement-progress.achievement-progress'
    >;
    deco_items: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::deco-item.deco-item'
    >;
    device_token: Attribute.String;
    user_decorations: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::user-decoration.user-decoration'
    >;
    wheel_spin: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::wheel-spin.wheel-spin'
    >;
    trading_credit: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::trading-credit.trading-credit'
    >;
    language: Attribute.Enumeration<['ko', 'en', 'ja']>;
    status: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::status.status'
    >;
    free_gift: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::free-gift.free-gift'
    >;
    deactivated: Attribute.Boolean;
    deactivated_at: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAchievementAchievement extends Schema.CollectionType {
  collectionName: 'achievements';
  info: {
    singularName: 'achievement';
    pluralName: 'achievements';
    displayName: 'Achievement';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    title: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    type: Attribute.Enumeration<['general', 'milestone', 'sub']> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    aid: Attribute.UID;
    goal: Attribute.Integer &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    desc: Attribute.Text &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    milestones: Attribute.Relation<
      'api::achievement.achievement',
      'oneToMany',
      'api::achievement.achievement'
    >;
    parent: Attribute.Relation<
      'api::achievement.achievement',
      'manyToOne',
      'api::achievement.achievement'
    >;
    rewards: Attribute.Relation<
      'api::achievement.achievement',
      'oneToMany',
      'api::reward.reward'
    >;
    badge: Attribute.Relation<
      'api::achievement.achievement',
      'oneToOne',
      'api::badge.badge'
    >;
    achievement_progresses: Attribute.Relation<
      'api::achievement.achievement',
      'oneToMany',
      'api::achievement-progress.achievement-progress'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::achievement.achievement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::achievement.achievement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::achievement.achievement',
      'oneToMany',
      'api::achievement.achievement'
    >;
    locale: Attribute.String;
  };
}

export interface ApiAchievementProgressAchievementProgress
  extends Schema.CollectionType {
  collectionName: 'achievement_progresses';
  info: {
    singularName: 'achievement-progress';
    pluralName: 'achievement-progresses';
    displayName: 'AchievementProgress';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    achievement: Attribute.Relation<
      'api::achievement-progress.achievement-progress',
      'manyToOne',
      'api::achievement.achievement'
    >;
    user: Attribute.Relation<
      'api::achievement-progress.achievement-progress',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    progress: Attribute.Integer;
    reward_claimed: Attribute.Boolean;
    completed: Attribute.Boolean;
    completion_date: Attribute.DateTime;
    milestone_progresses: Attribute.Relation<
      'api::achievement-progress.achievement-progress',
      'oneToMany',
      'api::achievement-progress.achievement-progress'
    >;
    belongs_to: Attribute.Relation<
      'api::achievement-progress.achievement-progress',
      'manyToOne',
      'api::achievement-progress.achievement-progress'
    >;
    reward_claim_date: Attribute.DateTime;
    read: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::achievement-progress.achievement-progress',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::achievement-progress.achievement-progress',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiActivityActivity extends Schema.CollectionType {
  collectionName: 'activities';
  info: {
    singularName: 'activity';
    pluralName: 'activities';
    displayName: 'Activity';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    user: Attribute.Relation<
      'api::activity.activity',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    room: Attribute.Relation<
      'api::activity.activity',
      'oneToOne',
      'api::room.room'
    >;
    category: Attribute.Enumeration<['platform', 'room', 'user']>;
    detail: Attribute.JSON;
    type: Attribute.Enumeration<
      [
        'room_completion',
        'rank_up',
        'newcomer',
        'high_rarity_item_#1',
        'unique_item',
        'item_#1',
        'level_up'
      ]
    >;
    item: Attribute.Relation<
      'api::activity.activity',
      'oneToOne',
      'api::item.item'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::activity.activity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::activity.activity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBadgeBadge extends Schema.CollectionType {
  collectionName: 'badges';
  info: {
    singularName: 'badge';
    pluralName: 'badges';
    displayName: 'Badge';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    desc: Attribute.Text &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    image: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    achievement: Attribute.Relation<
      'api::badge.badge',
      'oneToOne',
      'api::achievement.achievement'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::badge.badge',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::badge.badge',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::badge.badge',
      'oneToMany',
      'api::badge.badge'
    >;
    locale: Attribute.String;
  };
}

export interface ApiCharacterCharacter extends Schema.CollectionType {
  collectionName: 'characters';
  info: {
    singularName: 'character';
    pluralName: 'characters';
    displayName: 'Character';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    desc: Attribute.RichText &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    image: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    items: Attribute.Relation<
      'api::character.character',
      'oneToMany',
      'api::item.item'
    >;
    creator: Attribute.Relation<
      'api::character.character',
      'manyToOne',
      'api::creator.creator'
    >;
    rooms: Attribute.Relation<
      'api::character.character',
      'manyToMany',
      'api::room.room'
    >;
    tags: Attribute.Component<'character.tag', true> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::character.character',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::character.character',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::character.character',
      'oneToMany',
      'api::character.character'
    >;
    locale: Attribute.String;
  };
}

export interface ApiCreatorCreator extends Schema.CollectionType {
  collectionName: 'creators';
  info: {
    singularName: 'creator';
    pluralName: 'creators';
    displayName: 'Creator';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    desc: Attribute.Text &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    twitter: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    instagram: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    email: Attribute.Email &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    profile_image: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    rooms: Attribute.Relation<
      'api::creator.creator',
      'oneToMany',
      'api::room.room'
    >;
    cover_image: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    cid: Attribute.UID;
    followers: Attribute.Relation<
      'api::creator.creator',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    webtoons: Attribute.Relation<
      'api::creator.creator',
      'oneToMany',
      'api::webtoon.webtoon'
    >;
    characters: Attribute.Relation<
      'api::creator.creator',
      'oneToMany',
      'api::character.character'
    >;
    tags: Attribute.Component<'creator.tag', true> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::creator.creator',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::creator.creator',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::creator.creator',
      'oneToMany',
      'api::creator.creator'
    >;
    locale: Attribute.String;
  };
}

export interface ApiDailyQuestDailyQuest extends Schema.CollectionType {
  collectionName: 'daily_quests';
  info: {
    singularName: 'daily-quest';
    pluralName: 'daily-quests';
    displayName: 'DailyQuest';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    daily_quest_progresses: Attribute.Relation<
      'api::daily-quest.daily-quest',
      'oneToMany',
      'api::daily-quest-progress.daily-quest-progress'
    >;
    name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    total_progress: Attribute.Integer &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    qid: Attribute.UID;
    rewards: Attribute.Component<'reward.with-amount', true> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    days: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::daily-quest.daily-quest',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::daily-quest.daily-quest',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::daily-quest.daily-quest',
      'oneToMany',
      'api::daily-quest.daily-quest'
    >;
    locale: Attribute.String;
  };
}

export interface ApiDailyQuestProgressDailyQuestProgress
  extends Schema.CollectionType {
  collectionName: 'daily_quest_progresses';
  info: {
    singularName: 'daily-quest-progress';
    pluralName: 'daily-quest-progresses';
    displayName: 'DailyQuestProgress';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    progress: Attribute.Integer;
    is_reward_claimed: Attribute.Boolean & Attribute.DefaultTo<false>;
    completed_date: Attribute.DateTime;
    is_completed: Attribute.Boolean & Attribute.DefaultTo<false>;
    users_permissions_user: Attribute.Relation<
      'api::daily-quest-progress.daily-quest-progress',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    daily_quest: Attribute.Relation<
      'api::daily-quest-progress.daily-quest-progress',
      'manyToOne',
      'api::daily-quest.daily-quest'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::daily-quest-progress.daily-quest-progress',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::daily-quest-progress.daily-quest-progress',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDecoItemDecoItem extends Schema.CollectionType {
  collectionName: 'deco_items';
  info: {
    singularName: 'deco-item';
    pluralName: 'deco-items';
    displayName: 'DecoItem';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    image: Attribute.Media;
    name: Attribute.String;
    uploader: Attribute.Relation<
      'api::deco-item.deco-item',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    desc: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::deco-item.deco-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::deco-item.deco-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDrawDraw extends Schema.CollectionType {
  collectionName: 'draws';
  info: {
    singularName: 'draw';
    pluralName: 'draws';
    displayName: 'Draw';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    currency_type: Attribute.Enumeration<['freebie', 'star_point']>;
    cost: Attribute.Integer;
    draw_info: Attribute.JSON;
    room: Attribute.Relation<'api::draw.draw', 'manyToOne', 'api::room.room'>;
    draws_per_cost: Attribute.Integer & Attribute.DefaultTo<1>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::draw.draw', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::draw.draw', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiDrawHistoryDrawHistory extends Schema.CollectionType {
  collectionName: 'draw_histories';
  info: {
    singularName: 'draw-history';
    pluralName: 'draw-histories';
    displayName: 'DrawHistory';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    draw: Attribute.Relation<
      'api::draw-history.draw-history',
      'oneToOne',
      'api::draw.draw'
    >;
    users_permissions_user: Attribute.Relation<
      'api::draw-history.draw-history',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    draw_result: Attribute.JSON;
    user_items: Attribute.Relation<
      'api::draw-history.draw-history',
      'oneToMany',
      'api::inventory.inventory'
    >;
    multiply: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::draw-history.draw-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::draw-history.draw-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEpisodeEpisode extends Schema.CollectionType {
  collectionName: 'episodes';
  info: {
    singularName: 'episode';
    pluralName: 'episodes';
    displayName: 'Episode';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    title: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    episode_number: Attribute.Integer &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    episode_id: Attribute.UID;
    thumbnail: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    images: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    webtoon: Attribute.Relation<
      'api::episode.episode',
      'manyToOne',
      'api::webtoon.webtoon'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::episode.episode',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::episode.episode',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::episode.episode',
      'oneToMany',
      'api::episode.episode'
    >;
    locale: Attribute.String;
  };
}

export interface ApiEventCouponEventCoupon extends Schema.CollectionType {
  collectionName: 'event_coupons';
  info: {
    singularName: 'event-coupon';
    pluralName: 'event-coupons';
    displayName: 'EventCoupon';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.UID;
    start_date: Attribute.DateTime;
    end_date: Attribute.DateTime;
    rewards: Attribute.Component<'reward.with-amount', true>;
    users: Attribute.Relation<
      'api::event-coupon.event-coupon',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::event-coupon.event-coupon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::event-coupon.event-coupon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiExperienceTableExperienceTable
  extends Schema.CollectionType {
  collectionName: 'experience_tables';
  info: {
    singularName: 'experience-table';
    pluralName: 'experience-tables';
    displayName: 'ExperienceTable';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    exp_table: Attribute.Component<'level.table', true>;
    for: Attribute.UID;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::experience-table.experience-table',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::experience-table.experience-table',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFreeGiftFreeGift extends Schema.CollectionType {
  collectionName: 'free_gifts';
  info: {
    singularName: 'free-gift';
    pluralName: 'free-gifts';
    displayName: 'FreeGift';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    claim_count: Attribute.Integer;
    last_claimed_at: Attribute.Integer;
    interval: Attribute.Integer;
    user: Attribute.Relation<
      'api::free-gift.free-gift',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::free-gift.free-gift',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::free-gift.free-gift',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFreeGiftRewardFreeGiftReward extends Schema.CollectionType {
  collectionName: 'free_gift_rewards';
  info: {
    singularName: 'free-gift-reward';
    pluralName: 'free-gift-rewards';
    displayName: 'FreeGiftReward';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    rewards: Attribute.Component<'reward.with-amount', true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::free-gift-reward.free-gift-reward',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::free-gift-reward.free-gift-reward',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFreebieFreebie extends Schema.CollectionType {
  collectionName: 'freebies';
  info: {
    singularName: 'freebie';
    pluralName: 'freebies';
    displayName: 'Freebie';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    current: Attribute.Integer & Attribute.DefaultTo<5>;
    max: Attribute.Integer & Attribute.DefaultTo<5>;
    last_charged_at: Attribute.Integer;
    users_permissions_user: Attribute.Relation<
      'api::freebie.freebie',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    charge_interval: Attribute.Integer & Attribute.DefaultTo<3600>;
    charge_amount: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::freebie.freebie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::freebie.freebie',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGachaInfoGachaInfo extends Schema.CollectionType {
  collectionName: 'gacha_infos';
  info: {
    singularName: 'gacha-info';
    pluralName: 'gacha-infos';
    displayName: 'GachaInfo';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    probability: Attribute.Decimal;
    reward_table: Attribute.Component<'reward.gacha-reward', true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::gacha-info.gacha-info',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::gacha-info.gacha-info',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiInventoryInventory extends Schema.CollectionType {
  collectionName: 'inventories';
  info: {
    singularName: 'inventory';
    pluralName: 'inventories';
    displayName: 'Inventory';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    serial_number: Attribute.Integer;
    placed_in_room: Attribute.Boolean & Attribute.DefaultTo<false>;
    users_permissions_user: Attribute.Relation<
      'api::inventory.inventory',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    item: Attribute.Relation<
      'api::inventory.inventory',
      'manyToOne',
      'api::item.item'
    >;
    status: Attribute.Enumeration<
      ['owned', 'trading', 'auctioning', 'decorated']
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::inventory.inventory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::inventory.inventory',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiItemItem extends Schema.CollectionType {
  collectionName: 'items';
  info: {
    singularName: 'item';
    pluralName: 'items';
    displayName: 'Item';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    desc: Attribute.Text &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    item_code: Attribute.Integer &
      Attribute.Unique &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.DefaultTo<-1>;
    category: Attribute.Enumeration<['decoration', 'built-in']> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    rarity: Attribute.Enumeration<
      ['none', 'common', 'uncommon', 'rare', 'unique', 'secret']
    > &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.DefaultTo<'none'>;
    price: Attribute.Integer &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    inventories: Attribute.Relation<
      'api::item.item',
      'oneToMany',
      'api::inventory.inventory'
    >;
    image: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    current_serial_number: Attribute.Integer &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    thumbnail: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    room: Attribute.Relation<'api::item.item', 'manyToOne', 'api::room.room'>;
    attribute: Attribute.JSON &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    additional_images: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    character: Attribute.Relation<
      'api::item.item',
      'manyToOne',
      'api::character.character'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::item.item', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::item.item', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::item.item',
      'oneToMany',
      'api::item.item'
    >;
    locale: Attribute.String;
  };
}

export interface ApiItemAcquisitionHistoryItemAcquisitionHistory
  extends Schema.CollectionType {
  collectionName: 'item_acquisition_histories';
  info: {
    singularName: 'item-acquisition-history';
    pluralName: 'item-acquisition-histories';
    displayName: 'ItemAcquisitionHistory';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    type: Attribute.Enumeration<
      [
        'gacha_result',
        'spin_result',
        'level_up',
        'check_in',
        'daily_quest_reward',
        'relay_reward',
        'relay_ranking_reward',
        'trade',
        'free_gift',
        'room_complete'
      ]
    >;
    items: Attribute.Relation<
      'api::item-acquisition-history.item-acquisition-history',
      'oneToMany',
      'api::item.item'
    >;
    inventories: Attribute.Relation<
      'api::item-acquisition-history.item-acquisition-history',
      'oneToMany',
      'api::inventory.inventory'
    >;
    user: Attribute.Relation<
      'api::item-acquisition-history.item-acquisition-history',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    draw: Attribute.Relation<
      'api::item-acquisition-history.item-acquisition-history',
      'oneToOne',
      'api::draw.draw'
    >;
    multiply: Attribute.Integer;
    exp: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::item-acquisition-history.item-acquisition-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::item-acquisition-history.item-acquisition-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLeaderboardLeaderboard extends Schema.CollectionType {
  collectionName: 'leaderboards';
  info: {
    singularName: 'leaderboard';
    pluralName: 'leaderboards';
    displayName: 'Leaderboard';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.UID;
    records: Attribute.Component<'leaderboard.leaderboard-record', true>;
    ranking: Attribute.JSON;
    date: Attribute.DateTime;
    criteria: Attribute.JSON;
    ref_date: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::leaderboard.leaderboard',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::leaderboard.leaderboard',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiQuestQuest extends Schema.CollectionType {
  collectionName: 'quests';
  info: {
    singularName: 'quest';
    pluralName: 'quests';
    displayName: 'Quest';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String;
    desc: Attribute.RichText;
    level_requirement: Attribute.Integer & Attribute.DefaultTo<1>;
    quest_progress: Attribute.Relation<
      'api::quest.quest',
      'oneToOne',
      'api::quest-progress.quest-progress'
    >;
    rewards: Attribute.Relation<
      'api::quest.quest',
      'oneToMany',
      'api::reward.reward'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::quest.quest',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::quest.quest',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiQuestProgressQuestProgress extends Schema.CollectionType {
  collectionName: 'quest_progresses';
  info: {
    singularName: 'quest-progress';
    pluralName: 'quest-progresses';
    displayName: 'QuestProgress';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    completed_date: Attribute.DateTime;
    progress: Attribute.Integer;
    quest: Attribute.Relation<
      'api::quest-progress.quest-progress',
      'oneToOne',
      'api::quest.quest'
    >;
    users_permissions_user: Attribute.Relation<
      'api::quest-progress.quest-progress',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    is_reward_claimed: Attribute.Boolean & Attribute.DefaultTo<false>;
    is_completed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::quest-progress.quest-progress',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::quest-progress.quest-progress',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRelayRelay extends Schema.CollectionType {
  collectionName: 'relays';
  info: {
    singularName: 'relay';
    pluralName: 'relays';
    displayName: 'Relay';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String;
    reward_table: Attribute.Component<'reward.relay', true>;
    start_date: Attribute.DateTime;
    end_date: Attribute.DateTime;
    banner: Attribute.Media;
    token_image: Attribute.Media;
    group_size: Attribute.Integer;
    ranking_rewards: Attribute.Component<'reward.relay-ranking', true>;
    relay_groups: Attribute.Relation<
      'api::relay.relay',
      'oneToMany',
      'api::relay-group.relay-group'
    >;
    detail: Attribute.JSON;
    condition: Attribute.Enumeration<['probability', 'reward_related']>;
    user_relay_tokens: Attribute.Relation<
      'api::relay.relay',
      'oneToMany',
      'api::user-relay-token.user-relay-token'
    >;
    type: Attribute.Enumeration<['relay_only', 'with_group_ranking']>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::relay.relay',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::relay.relay',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRelayGroupRelayGroup extends Schema.CollectionType {
  collectionName: 'relay_groups';
  info: {
    singularName: 'relay-group';
    pluralName: 'relay-groups';
    displayName: 'RelayGroup';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    relay: Attribute.Relation<
      'api::relay-group.relay-group',
      'manyToOne',
      'api::relay.relay'
    >;
    num_members: Attribute.Integer;
    tokens: Attribute.Relation<
      'api::relay-group.relay-group',
      'oneToMany',
      'api::user-relay-token.user-relay-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::relay-group.relay-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::relay-group.relay-group',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRewardReward extends Schema.CollectionType {
  collectionName: 'rewards';
  info: {
    singularName: 'reward';
    pluralName: 'rewards';
    displayName: 'Reward';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    type: Attribute.Enumeration<
      ['freebie', 'star_point', 'item', 'trading_credit', 'wheel_spin', 'exp']
    >;
    amount: Attribute.Integer;
    item: Attribute.Relation<
      'api::reward.reward',
      'oneToOne',
      'api::item.item'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::reward.reward',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::reward.reward',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiRoomRoom extends Schema.CollectionType {
  collectionName: 'rooms';
  info: {
    singularName: 'room';
    pluralName: 'rooms';
    displayName: 'Room';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    desc: Attribute.Text &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    users: Attribute.Relation<
      'api::room.room',
      'manyToMany',
      'plugin::users-permissions.user'
    >;
    rid: Attribute.UID<'api::room.room', 'name'>;
    draws: Attribute.Relation<'api::room.room', 'oneToMany', 'api::draw.draw'>;
    creator: Attribute.Relation<
      'api::room.room',
      'manyToOne',
      'api::creator.creator'
    >;
    items: Attribute.Relation<'api::room.room', 'oneToMany', 'api::item.item'>;
    image_empty: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    image_complete: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    start_date: Attribute.DateTime &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    end_date: Attribute.DateTime &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    webtoon: Attribute.Relation<
      'api::room.room',
      'manyToOne',
      'api::webtoon.webtoon'
    >;
    display_order: Attribute.Integer &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    user_rooms: Attribute.Relation<
      'api::room.room',
      'oneToMany',
      'api::user-room.user-room'
    >;
    key_scenes: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    items_sprite_image: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    items_sprite_json: Attribute.JSON &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    unlock_conditions: Attribute.JSON &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    characters: Attribute.Relation<
      'api::room.room',
      'manyToMany',
      'api::character.character'
    >;
    tags: Attribute.Component<'room.tag', true> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    complete_rewards: Attribute.Component<'reward.with-amount', true> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::room.room', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::room.room', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::room.room',
      'oneToMany',
      'api::room.room'
    >;
    locale: Attribute.String;
  };
}

export interface ApiStarPointStarPoint extends Schema.CollectionType {
  collectionName: 'star_points';
  info: {
    singularName: 'star-point';
    pluralName: 'star-points';
    displayName: 'StarPoint';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    amount: Attribute.Integer;
    user: Attribute.Relation<
      'api::star-point.star-point',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    star_point_histories: Attribute.Relation<
      'api::star-point.star-point',
      'oneToMany',
      'api::star-point-history.star-point-history'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::star-point.star-point',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::star-point.star-point',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStarPointHistoryStarPointHistory
  extends Schema.CollectionType {
  collectionName: 'star_point_histories';
  info: {
    singularName: 'star-point-history';
    pluralName: 'star-point-histories';
    displayName: 'StarPointHistory';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    change: Attribute.Integer;
    star_point: Attribute.Relation<
      'api::star-point-history.star-point-history',
      'manyToOne',
      'api::star-point.star-point'
    >;
    detail: Attribute.Enumeration<
      [
        'item_draw',
        'item_sale',
        'gacha',
        'gacha_result',
        'spin_result',
        'relay_reward',
        'relay_ranking_reward',
        'achievement_reward',
        'daily_quest_reward',
        'level_up',
        'check_in',
        'free_gift',
        'room_unlock',
        'room_complete'
      ]
    >;
    inventories: Attribute.Relation<
      'api::star-point-history.star-point-history',
      'oneToMany',
      'api::inventory.inventory'
    >;
    remaining: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::star-point-history.star-point-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::star-point-history.star-point-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStatusStatus extends Schema.CollectionType {
  collectionName: 'statuses';
  info: {
    singularName: 'status';
    pluralName: 'statuses';
    displayName: 'Status';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    user: Attribute.Relation<
      'api::status.status',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    level: Attribute.Integer;
    exp: Attribute.Integer;
    level_up_reward_claim_history: Attribute.Component<'level.claim-log', true>;
    level_up_reward_claimed: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::status.status',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::status.status',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStreakStreak extends Schema.CollectionType {
  collectionName: 'streaks';
  info: {
    singularName: 'streak';
    pluralName: 'streaks';
    displayName: 'Streak';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    current_login: Attribute.Integer;
    longest_login: Attribute.Integer;
    last_login_date: Attribute.DateTime &
      Attribute.DefaultTo<'1969-12-31T15:00:00.000Z'>;
    users_permissions_user: Attribute.Relation<
      'api::streak.streak',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    current_draw: Attribute.Integer;
    longest_draw: Attribute.Integer;
    last_draw_date: Attribute.DateTime;
    reward_claimed: Attribute.Boolean;
    streak_count: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::streak.streak',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::streak.streak',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStreakRewardStreakReward extends Schema.CollectionType {
  collectionName: 'streak_rewards';
  info: {
    singularName: 'streak-reward';
    pluralName: 'streak-rewards';
    displayName: 'StreakReward';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    reward_table: Attribute.Component<'reward.streak-rewards', true>;
    type: Attribute.UID;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::streak-reward.streak-reward',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::streak-reward.streak-reward',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTradeTrade extends Schema.CollectionType {
  collectionName: 'trades';
  info: {
    singularName: 'trade';
    pluralName: 'trades';
    displayName: 'Trade';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    expires: Attribute.DateTime;
    status: Attribute.Enumeration<
      [
        'proposed',
        'counter_proposed',
        'success',
        'failed',
        'canceled',
        'rejected',
        'expired'
      ]
    >;
    history: Attribute.Component<'history.trade-history', true>;
    proposer_items: Attribute.Relation<
      'api::trade.trade',
      'oneToMany',
      'api::inventory.inventory'
    >;
    partner_items: Attribute.Relation<
      'api::trade.trade',
      'oneToMany',
      'api::inventory.inventory'
    >;
    proposer: Attribute.Relation<
      'api::trade.trade',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    partner: Attribute.Relation<
      'api::trade.trade',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    proposer_read: Attribute.Boolean;
    partner_read: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::trade.trade',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::trade.trade',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTradingCreditTradingCredit extends Schema.CollectionType {
  collectionName: 'trading_credits';
  info: {
    singularName: 'trading-credit';
    pluralName: 'trading-credits';
    displayName: 'TradingCredit';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    current: Attribute.Integer;
    user: Attribute.Relation<
      'api::trading-credit.trading-credit',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    histories: Attribute.Relation<
      'api::trading-credit.trading-credit',
      'oneToMany',
      'api::trading-credit-history.trading-credit-history'
    >;
    max: Attribute.Integer;
    charge_amount: Attribute.Integer;
    charge_interval: Attribute.Integer;
    last_charged_at: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::trading-credit.trading-credit',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::trading-credit.trading-credit',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTradingCreditHistoryTradingCreditHistory
  extends Schema.CollectionType {
  collectionName: 'trading_credit_histories';
  info: {
    singularName: 'trading-credit-history';
    pluralName: 'trading-credit-histories';
    displayName: 'TradingCreditHistory';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    detail: Attribute.Enumeration<
      [
        'gacha_result',
        'trade',
        'spin_result',
        'relay_reward',
        'relay_ranking_reward',
        'achievement_reward',
        'daily_quest_reward'
      ]
    >;
    date: Attribute.DateTime;
    change: Attribute.Integer;
    result: Attribute.Integer;
    trading_credit: Attribute.Relation<
      'api::trading-credit-history.trading-credit-history',
      'manyToOne',
      'api::trading-credit.trading-credit'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::trading-credit-history.trading-credit-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::trading-credit-history.trading-credit-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserDecorationUserDecoration extends Schema.CollectionType {
  collectionName: 'user_decorations';
  info: {
    singularName: 'user-decoration';
    pluralName: 'user-decorations';
    displayName: 'UserDecoration';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    user_items: Attribute.Component<'decoration.item', true>;
    deco_items: Attribute.Component<'decoration.deco-item', true>;
    texts: Attribute.Component<'decoration.text', true>;
    lines: Attribute.Component<'decoration.line', true>;
    user: Attribute.Relation<
      'api::user-decoration.user-decoration',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    snapshot: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-decoration.user-decoration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::user-decoration.user-decoration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserRelayTokenUserRelayToken extends Schema.CollectionType {
  collectionName: 'user_relay_tokens';
  info: {
    singularName: 'user-relay-token';
    pluralName: 'user-relay-tokens';
    displayName: 'UserRelayToken';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    user: Attribute.Relation<
      'api::user-relay-token.user-relay-token',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    amount: Attribute.Integer;
    relay_group: Attribute.Relation<
      'api::user-relay-token.user-relay-token',
      'manyToOne',
      'api::relay-group.relay-group'
    >;
    history: Attribute.Component<'history.relay', true>;
    relay: Attribute.Relation<
      'api::user-relay-token.user-relay-token',
      'manyToOne',
      'api::relay.relay'
    >;
    result_settled: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-relay-token.user-relay-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::user-relay-token.user-relay-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserRoomUserRoom extends Schema.CollectionType {
  collectionName: 'user_rooms';
  info: {
    singularName: 'user-room';
    pluralName: 'user-rooms';
    displayName: 'UserRoom';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    start_time: Attribute.DateTime;
    completion_time: Attribute.DateTime;
    room: Attribute.Relation<
      'api::user-room.user-room',
      'manyToOne',
      'api::room.room'
    >;
    user: Attribute.Relation<
      'api::user-room.user-room',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    completed: Attribute.Boolean & Attribute.DefaultTo<false>;
    completion_rate: Attribute.Integer;
    duration: Attribute.BigInteger;
    owned_items: Attribute.JSON;
    initial_completion_checked: Attribute.Boolean & Attribute.DefaultTo<false>;
    unlocked: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-room.user-room',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::user-room.user-room',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWebtoonWebtoon extends Schema.CollectionType {
  collectionName: 'webtoons';
  info: {
    singularName: 'webtoon';
    pluralName: 'webtoons';
    displayName: 'Webtoon';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    title: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    episodes: Attribute.Relation<
      'api::webtoon.webtoon',
      'oneToMany',
      'api::episode.episode'
    >;
    webtoon_id: Attribute.UID;
    cover_image: Attribute.Media &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    volume: Attribute.Integer &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    desc: Attribute.RichText &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    release_date: Attribute.DateTime &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    creator: Attribute.Relation<
      'api::webtoon.webtoon',
      'manyToOne',
      'api::creator.creator'
    >;
    rooms: Attribute.Relation<
      'api::webtoon.webtoon',
      'oneToMany',
      'api::room.room'
    >;
    webtoon_outlinks: Attribute.Relation<
      'api::webtoon.webtoon',
      'manyToMany',
      'api::webtoon-outlink.webtoon-outlink'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::webtoon.webtoon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::webtoon.webtoon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    localizations: Attribute.Relation<
      'api::webtoon.webtoon',
      'oneToMany',
      'api::webtoon.webtoon'
    >;
    locale: Attribute.String;
  };
}

export interface ApiWebtoonOutlinkWebtoonOutlink extends Schema.CollectionType {
  collectionName: 'webtoon_outlinks';
  info: {
    singularName: 'webtoon-outlink';
    pluralName: 'webtoon-outlinks';
    displayName: 'WebtoonOutlink';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    platform: Attribute.Enumeration<
      [
        'instagram',
        'twitter',
        'facebook',
        'naver_webtoon',
        'kakao_webtoon',
        'kakao_page',
        'naver_series',
        'lezhin_comics',
        'toptoon',
        'bomtoon',
        'anytoon',
        'ridi_webtoon',
        'toomics',
        'etc'
      ]
    >;
    url: Attribute.String;
    webtoons: Attribute.Relation<
      'api::webtoon-outlink.webtoon-outlink',
      'manyToMany',
      'api::webtoon.webtoon'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::webtoon-outlink.webtoon-outlink',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::webtoon-outlink.webtoon-outlink',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWheelInfoWheelInfo extends Schema.CollectionType {
  collectionName: 'wheel_infos';
  info: {
    singularName: 'wheel-info';
    pluralName: 'wheel-infos';
    displayName: 'WheelInfo';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    reward_table: Attribute.Component<'reward.gacha-reward', true>;
    cost: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::wheel-info.wheel-info',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::wheel-info.wheel-info',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWheelSpinWheelSpin extends Schema.CollectionType {
  collectionName: 'wheel_spins';
  info: {
    singularName: 'wheel-spin';
    pluralName: 'wheel-spins';
    displayName: 'WheelSpin';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    amount: Attribute.Integer;
    user: Attribute.Relation<
      'api::wheel-spin.wheel-spin',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    histories: Attribute.Relation<
      'api::wheel-spin.wheel-spin',
      'oneToMany',
      'api::wheel-spin-history.wheel-spin-history'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::wheel-spin.wheel-spin',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::wheel-spin.wheel-spin',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWheelSpinHistoryWheelSpinHistory
  extends Schema.CollectionType {
  collectionName: 'wheel_spin_histories';
  info: {
    singularName: 'wheel-spin-history';
    pluralName: 'wheel-spin-histories';
    displayName: 'WheelSpinHistory';
    description: '';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    detail: Attribute.Enumeration<
      [
        'gacha_result',
        'spin',
        'relay_reward',
        'relay_ranking_reward',
        'achievement_reward',
        'daily_quest_reward',
        'level_up',
        'free_gift',
        'check_in',
        'room_complete'
      ]
    >;
    date: Attribute.DateTime;
    change: Attribute.Integer;
    result: Attribute.Integer;
    wheel_spin: Attribute.Relation<
      'api::wheel-spin-history.wheel-spin-history',
      'manyToOne',
      'api::wheel-spin.wheel-spin'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::wheel-spin-history.wheel-spin-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::wheel-spin-history.wheel-spin-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/strapi' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::publisher.action': PluginPublisherAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::achievement.achievement': ApiAchievementAchievement;
      'api::achievement-progress.achievement-progress': ApiAchievementProgressAchievementProgress;
      'api::activity.activity': ApiActivityActivity;
      'api::badge.badge': ApiBadgeBadge;
      'api::character.character': ApiCharacterCharacter;
      'api::creator.creator': ApiCreatorCreator;
      'api::daily-quest.daily-quest': ApiDailyQuestDailyQuest;
      'api::daily-quest-progress.daily-quest-progress': ApiDailyQuestProgressDailyQuestProgress;
      'api::deco-item.deco-item': ApiDecoItemDecoItem;
      'api::draw.draw': ApiDrawDraw;
      'api::draw-history.draw-history': ApiDrawHistoryDrawHistory;
      'api::episode.episode': ApiEpisodeEpisode;
      'api::event-coupon.event-coupon': ApiEventCouponEventCoupon;
      'api::experience-table.experience-table': ApiExperienceTableExperienceTable;
      'api::free-gift.free-gift': ApiFreeGiftFreeGift;
      'api::free-gift-reward.free-gift-reward': ApiFreeGiftRewardFreeGiftReward;
      'api::freebie.freebie': ApiFreebieFreebie;
      'api::gacha-info.gacha-info': ApiGachaInfoGachaInfo;
      'api::inventory.inventory': ApiInventoryInventory;
      'api::item.item': ApiItemItem;
      'api::item-acquisition-history.item-acquisition-history': ApiItemAcquisitionHistoryItemAcquisitionHistory;
      'api::leaderboard.leaderboard': ApiLeaderboardLeaderboard;
      'api::quest.quest': ApiQuestQuest;
      'api::quest-progress.quest-progress': ApiQuestProgressQuestProgress;
      'api::relay.relay': ApiRelayRelay;
      'api::relay-group.relay-group': ApiRelayGroupRelayGroup;
      'api::reward.reward': ApiRewardReward;
      'api::room.room': ApiRoomRoom;
      'api::star-point.star-point': ApiStarPointStarPoint;
      'api::star-point-history.star-point-history': ApiStarPointHistoryStarPointHistory;
      'api::status.status': ApiStatusStatus;
      'api::streak.streak': ApiStreakStreak;
      'api::streak-reward.streak-reward': ApiStreakRewardStreakReward;
      'api::trade.trade': ApiTradeTrade;
      'api::trading-credit.trading-credit': ApiTradingCreditTradingCredit;
      'api::trading-credit-history.trading-credit-history': ApiTradingCreditHistoryTradingCreditHistory;
      'api::user-decoration.user-decoration': ApiUserDecorationUserDecoration;
      'api::user-relay-token.user-relay-token': ApiUserRelayTokenUserRelayToken;
      'api::user-room.user-room': ApiUserRoomUserRoom;
      'api::webtoon.webtoon': ApiWebtoonWebtoon;
      'api::webtoon-outlink.webtoon-outlink': ApiWebtoonOutlinkWebtoonOutlink;
      'api::wheel-info.wheel-info': ApiWheelInfoWheelInfo;
      'api::wheel-spin.wheel-spin': ApiWheelSpinWheelSpin;
      'api::wheel-spin-history.wheel-spin-history': ApiWheelSpinHistoryWheelSpinHistory;
    }
  }
}
