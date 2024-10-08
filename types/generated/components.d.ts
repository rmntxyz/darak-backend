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

export interface CharacterTag extends Schema.Component {
  collectionName: 'components_character_tags';
  info: {
    displayName: 'tag';
    icon: 'priceTag';
  };
  attributes: {
    tag: Attribute.Enumeration<['S1']>;
  };
}

export interface CreatorTag extends Schema.Component {
  collectionName: 'components_creator_tags';
  info: {
    displayName: 'tag';
    icon: 'priceTag';
  };
  attributes: {
    tag: Attribute.Enumeration<['S1']>;
  };
}

export interface DailyQuestDays extends Schema.Component {
  collectionName: 'components_daily_quest_days';
  info: {
    displayName: 'days';
    icon: 'clock';
  };
  attributes: {};
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

export interface EffectDetail extends Schema.Component {
  collectionName: 'components_effect_details';
  info: {
    displayName: 'detail';
    icon: 'plus';
    description: '';
  };
  attributes: {
    type: Attribute.Enumeration<
      ['star_reduction', 'exp_reduction', 'coin_penalty', 'star_cost_up']
    >;
    value: Attribute.JSON;
    for_stack: Attribute.Integer;
    desc: Attribute.Text;
  };
}

export interface EffectName extends Schema.Component {
  collectionName: 'components_effect_names';
  info: {
    displayName: 'name';
    icon: 'link';
  };
  attributes: {};
}

export interface HistoryFreeGiftHistory extends Schema.Component {
  collectionName: 'components_history_free_gift_histories';
  info: {
    displayName: 'free_gift_history';
    icon: 'bulletList';
  };
  attributes: {
    rewards: Attribute.Component<'reward.with-amount', true>;
    claim_date: Attribute.DateTime;
  };
}

export interface HistoryRelayRewards extends Schema.Component {
  collectionName: 'components_history_relay_rewards';
  info: {
    displayName: 'relay_rewards';
    icon: 'bulletList';
  };
  attributes: {
    type: Attribute.Enumeration<
      ['freebie', 'star_point', 'item', 'trading_credit', 'wheel_spin', 'exp']
    >;
    amount: Attribute.Integer;
  };
}

export interface HistoryRelay extends Schema.Component {
  collectionName: 'components_history_relays';
  info: {
    displayName: 'relay';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    score: Attribute.Integer;
    date: Attribute.DateTime;
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

export interface LevelClaimLog extends Schema.Component {
  collectionName: 'components_level_claim_logs';
  info: {
    displayName: 'claim log';
    icon: 'cube';
    description: '';
  };
  attributes: {
    date: Attribute.DateTime;
    level: Attribute.Integer;
  };
}

export interface LevelTable extends Schema.Component {
  collectionName: 'components_level_tables';
  info: {
    displayName: 'table';
    icon: 'arrowUp';
  };
  attributes: {
    rewards: Attribute.Component<'reward.with-amount', true>;
    level: Attribute.Integer;
    exp: Attribute.Integer;
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
    probability: Attribute.Float;
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

export interface RewardStreakRewards extends Schema.Component {
  collectionName: 'components_reward_streak_rewards';
  info: {
    displayName: 'streak rewards';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    rewards: Attribute.Component<'reward.with-amount', true>;
    day: Attribute.Integer;
  };
}

export interface RewardWithAmount extends Schema.Component {
  collectionName: 'components_reward_with_amounts';
  info: {
    displayName: 'with_amount';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    type: Attribute.Enumeration<
      [
        'freebie',
        'star_point',
        'item',
        'item_common',
        'item_uncommon',
        'item_rare',
        'item_unique',
        'item_secret',
        'trading_credit',
        'wheel_spin',
        'exp',
        'relay_token',
        'ranking_relay_token',
        'shield',
        'attack',
        'steal'
      ]
    >;
    amount: Attribute.Integer;
    tier: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 1;
        max: 4;
      }>;
  };
}

export interface RoomTag extends Schema.Component {
  collectionName: 'components_room_tags';
  info: {
    displayName: 'tag';
    icon: 'priceTag';
    description: '';
  };
  attributes: {
    tag: Attribute.Enumeration<
      [
        'S1',
        'S2',
        'L1',
        'L2',
        'L3',
        'L4',
        'Romance',
        'Action',
        'Comedy',
        'Drama',
        'Fantasy',
        'Sci-Fi',
        'Mystery',
        'Thriller',
        'Suspense',
        'Horror',
        'Slice of Life',
        'Adventure',
        'Supernatural',
        'Historical',
        'Sports',
        'Martial Arts',
        'Crime',
        'Psychological',
        'School Life',
        'Mecha',
        'BL',
        'GL',
        'Tragedy',
        'Isekai',
        'Cooking',
        'Survival'
      ]
    >;
  };
}

declare module '@strapi/strapi' {
  export module Shared {
    export interface Components {
      'activity.test': ActivityTest;
      'character.tag': CharacterTag;
      'creator.tag': CreatorTag;
      'daily-quest.days': DailyQuestDays;
      'decoration.deco-item': DecorationDecoItem;
      'decoration.item': DecorationItem;
      'decoration.line': DecorationLine;
      'decoration.text': DecorationText;
      'effect.detail': EffectDetail;
      'effect.name': EffectName;
      'history.free-gift-history': HistoryFreeGiftHistory;
      'history.relay-rewards': HistoryRelayRewards;
      'history.relay': HistoryRelay;
      'history.trade-history': HistoryTradeHistory;
      'history.trading': HistoryTrading;
      'history.wheel-spin': HistoryWheelSpin;
      'leaderboard.leaderboard-record': LeaderboardLeaderboardRecord;
      'level.claim-log': LevelClaimLog;
      'level.table': LevelTable;
      'relay.token': RelayToken;
      'reward.gacha-reward': RewardGachaReward;
      'reward.relay-ranking': RewardRelayRanking;
      'reward.relay': RewardRelay;
      'reward.reward': RewardReward;
      'reward.streak-rewards': RewardStreakRewards;
      'reward.with-amount': RewardWithAmount;
      'room.tag': RoomTag;
    }
  }
}
