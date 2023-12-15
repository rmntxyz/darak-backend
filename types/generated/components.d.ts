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
      'leaderboard.leaderboard-record': LeaderboardLeaderboardRecord;
      'reward.reward': RewardReward;
      'trade-history.trade-history': TradeHistoryTradeHistory;
    }
  }
}
