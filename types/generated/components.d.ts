import type { Schema, Attribute } from '@strapi/strapi';

export interface ActivityTest extends Schema.Component {
  collectionName: 'components_activity_tests';
  info: {
    displayName: 'test';
    icon: 'file';
  };
  attributes: {
    from: Attribute.Integer;
  };
}

export interface DecorationDecoItem extends Schema.Component {
  collectionName: 'components_decoration_deco_items';
  info: {
    displayName: 'deco_item';
    icon: 'emotionHappy';
    description: '';
  };
  attributes: {
    deco_item: Attribute.Relation<
      'decoration.deco-item',
      'oneToOne',
      'api::deco-item.deco-item'
    >;
    attribute: Attribute.JSON;
  };
}

export interface DecorationItem extends Schema.Component {
  collectionName: 'components_decoration_items';
  info: {
    displayName: 'User_item';
    icon: 'cube';
    description: '';
  };
  attributes: {
    user_item: Attribute.Relation<
      'decoration.item',
      'oneToOne',
      'api::inventory.inventory'
    >;
    attribute: Attribute.JSON;
  };
}

export interface DecorationLine extends Schema.Component {
  collectionName: 'components_decoration_lines';
  info: {
    displayName: 'line';
    icon: 'pencil';
  };
  attributes: {
    attribute: Attribute.JSON;
  };
}

export interface DecorationText extends Schema.Component {
  collectionName: 'components_decoration_texts';
  info: {
    displayName: 'text';
    icon: 'strikeThrough';
  };
  attributes: {
    text: Attribute.String;
    attribute: Attribute.JSON;
  };
}

export interface LeaderboardLeaderboardRecord extends Schema.Component {
  collectionName: 'components_record_leaderboard_records';
  info: {
    displayName: 'record';
    icon: 'server';
    description: '';
  };
  attributes: {
    ranking: Attribute.JSON;
    date: Attribute.DateTime;
  };
}

export interface RewardReward extends Schema.Component {
  collectionName: 'components_reward_rewards';
  info: {
    displayName: 'reward';
    icon: 'oneToMany';
    description: '';
  };
  attributes: {
    rewards: Attribute.Relation<
      'reward.reward',
      'oneToMany',
      'api::reward.reward'
    >;
  };
}

export interface TradeHistoryTradeHistory extends Schema.Component {
  collectionName: 'components_trade_history_trade_histories';
  info: {
    displayName: 'trade_history';
    icon: 'rotate';
    description: '';
  };
  attributes: {
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
    date: Attribute.DateTime;
  };
}

declare module '@strapi/strapi' {
  export module Shared {
    export interface Components {
      'activity.test': ActivityTest;
      'decoration.deco-item': DecorationDecoItem;
      'decoration.item': DecorationItem;
      'decoration.line': DecorationLine;
      'decoration.text': DecorationText;
      'leaderboard.leaderboard-record': LeaderboardLeaderboardRecord;
      'reward.reward': RewardReward;
      'trade-history.trade-history': TradeHistoryTradeHistory;
    }
  }
}
