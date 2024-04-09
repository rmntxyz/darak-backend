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

export interface HistoryTradeHistory extends Schema.Component {
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

export interface HistoryTrading extends Schema.Component {
  collectionName: 'components_history_tradings';
  info: {
    displayName: 'TradingCredit';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    date: Attribute.DateTime;
    detail: Attribute.Enumeration<['trade_success', 'gacha_result']>;
    change: Attribute.Integer;
    remaining: Attribute.Integer;
  };
}

export interface HistoryWheelSpin extends Schema.Component {
  collectionName: 'components_history_wheel_spins';
  info: {
    displayName: 'WheelSpin';
    icon: 'bulletList';
  };
  attributes: {
    date: Attribute.DateTime;
    detail: Attribute.Enumeration<['wheeling', 'gacha_result']>;
    change: Attribute.Integer;
    remaining: Attribute.Integer;
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

export interface RelayToken extends Schema.Component {
  collectionName: 'components_relay_tokens';
  info: {
    displayName: 'token';
    icon: 'database';
  };
  attributes: {};
}

export interface RewardGachaReward extends Schema.Component {
  collectionName: 'components_reward_gacha_rewards';
  info: {
    displayName: 'GachaReward';
    icon: 'cube';
    description: '';
  };
  attributes: {
    probability: Attribute.Decimal;
    rewards: Attribute.Component<'reward.with-amount', true>;
  };
}

export interface RewardRelayRanking extends Schema.Component {
  collectionName: 'components_reward_relay_rankings';
  info: {
    displayName: 'relay_ranking';
    icon: 'bulletList';
  };
  attributes: {
    rewards: Attribute.Component<'reward.with-amount', true>;
    ranking: Attribute.Integer;
  };
}

export interface RewardRelay extends Schema.Component {
  collectionName: 'components_reward_relays';
  info: {
    displayName: 'relay';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    rewards: Attribute.Component<'reward.with-amount', true>;
    score: Attribute.Integer;
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

export interface RewardWithAmount extends Schema.Component {
  collectionName: 'components_reward_with_amounts';
  info: {
    displayName: 'with_amount';
    icon: 'bulletList';
  };
  attributes: {
    type: Attribute.Enumeration<
      ['freebie', 'star_point', 'item', 'trading_credit', 'wheel_spin', 'exp']
    >;
    amount: Attribute.Integer;
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
      'history.trade-history': HistoryTradeHistory;
      'history.trading': HistoryTrading;
      'history.wheel-spin': HistoryWheelSpin;
      'leaderboard.leaderboard-record': LeaderboardLeaderboardRecord;
      'relay.token': RelayToken;
      'reward.gacha-reward': RewardGachaReward;
      'reward.relay-ranking': RewardRelayRanking;
      'reward.relay': RewardRelay;
      'reward.reward': RewardReward;
      'reward.with-amount': RewardWithAmount;
    }
  }
}
