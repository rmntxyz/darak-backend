type Freebie = {
  id: number;
  current: number;
  max: number;
  last_charged_at: number;
  charge_interval: number;
  charge_amount: number;
};

type FreebieData = Partial<Freebie>;

type Streak = {
  id: number;
  current_login: number;
  longest_login: number;
  last_login_date: Date;
  streak_count: number;
  reward_claimed: boolean;

  current_draw: number;
  longest_draw: number;
  last_draw_date: Date;
};

type StreakReward = {
  reward_table: {
    rewards: Reward[];
    day: number;
  }[];
  type: "default" | string;
};

type User = {
  id: number;
  username: string;
  star_point: StarPoint;
  freebie: Freebie;
  streak: Streak;
  daily_quest_progresses: DailyQuestProgress[];
};

type Creator = {};

type WebToon = {};

type Room = {
  id: number;
  name: string;
  desc: string;
  users: User[];
  rid: string;
  draws: Draw[];
  creator: Creator[];
  items: Item[];
  image_empty: { url: string };
  image_complete: { url: string };
  start_date: Date;
  end_date: Date;
  webtoon: WebToon;
  user_rooms: UserRoom[];
  key_scenes: { url: string }[];
};

type StarPoint = {
  id: number;
  amount: number;
  star_point_histories: StarPointHistory[];
};

type StarPointHistory = {
  id: number;
  change: number;
  remaining: number;
  star_point: StarPoint;
  detail: StarPointChangeDetail;
  inventories: Inventory[];
};

type StarPointChangeDetail =
  // -
  | "item_draw"
  | "gacha"
  | "room_unlock"
  // +
  | "item_sale"
  | "gacha_result"
  | "spin_result"
  | "relay_reward"
  | "relay_ranking_reward"
  | "achievement_reward"
  | "daily_quest_reward"
  | "level_up"
  | "check_in"
  | "free_gift"
  | "room_complete";

type WheelSpinChangeDetail =
  // -
  | "spin"
  // +
  | "gacha_result"
  | "level_up"
  | "check_in"
  | "relay_reward"
  | "relay_ranking_reward"
  | "achievement_reward"
  | "daily_quest_reward"
  | "free_gift"
  | "room_complete";

type ItemAcquisitionType =
  // +
  | "gacha_result"
  | "spin_result"
  | "level_up"
  | "check_in"
  | "daily_quest_reward"
  | "relay_reward"
  | "relay_ranking_reward"
  | "trade"
  | "free_gift"
  | "room_complete";

type TradingCreditChangeDetail = "trade";

type TradingCredit = {
  id: number;
  current: number;
  max: number;
  last_charged_at: number;
  charge_interval: number;
  charge_amount: number;
};

type ExpRank = {
  rank: number;
  user: Partial<User>;
  exp: number;
  level: number;
};

type RewardType =
  | "freebie"
  | "star_point"
  | "item"
  | "item_common"
  | "item_uncommon"
  | "item_rare"
  | "item_unique"
  | "item_secret"
  | "exp"
  | "trading_credit"
  | "wheel_spin"
  | "relay_token"
  | "ranking_relay_token"
  | "event_token";

type RewardDetail = {
  type: RewardType;
  amount?: number;
  detail?: Partial<Item>;
  exp?: number;
};

type CapsuleResult = {
  rewards: RewardDetail[];
  events?: {
    type: "relay";
    amount: number;
    total: number;
    rewards: RewardDetail[];
    relay: Relay;
  }[];
  multiply: number;
};

type DailyQuestProgress = {
  id: number;
  daily_quest: DailyQuest;
  progress: number;
  is_reward_claimed: boolean;
  is_completed: boolean;
  completed_date: Date;
  user_permissions_user: User;
};

type DailyQuest = {
  name: string;
  daily_quest_progresses: DailyQuestProgress[];
  total_progress: number;
  qid: string;
  rewards: Reward[];
  days: string;
};

type Reward = {
  type: RewardType;
  amount: number;
  detail?: Item;
  exp?: number;
};

type Item = {
  id: number;
  name: string;
  desc: string;
  image: { url: string };
  thumbnail: { url: string };
  additional_image: { url: string };
  rarity: "common" | "uncommon" | "rare" | "unique" | "secret";
  category: "built-in" | "decoration";
  price: number;
  current_serial_number: number;
  room: Room;
  // inventory: Inventory;
  item_code: number;
  attribute: JSON;
};

type Draw = {
  id: number;
  cost: number;
  currency_type: string;
  draws_per_cost: number;
  draw_info: DrawInfo;
  room?: any;
};

type RarityData = {
  items: number[];
  probability: number;
};

type DrawInfo = {
  common: RarityData;
  uncommon: RarityData;
  rare: RarityData;
  unique: RarityData;
  secret: RarityData;
};

type Inventory = {
  id: number;
  serial_number: number;
  item: Item;
  status: UserItemStatus;
  users_permissions_user: User;
  updatedAt: Date;
};

type RelayConditionType = "probaility" | "reward_related";

type RelayType = "relay_only" | "with_group_ranking";

type Relay = {
  id: number;
  condition: RelayConditionType;
  type: RelayType;
  title: string;
  reward_table: RelayReward[];
  start_date: Date;
  end_date: Date;
  detail: RelayDetail;
  group_size: number;
  banner: { url: string };
  token_image: { url: string };
  relay_groups: RelayGroup[];
  ranking_reward: RelayRankingReward[];
};

type RelayReward = {
  rewards: { type: string; amount: number }[];
  score: number;
};

type RelayDetail = {
  conditions: {
    amount: number;
    probability?: number;
    reward_type?: RewardType;
    rarity?: "common" | "uncommon" | "rare" | "unique" | "secret" | "variant";
  }[];
};

type RelayGroup = {
  id: number;
  tokens: RelayToken[];
  relay: Relay;
};

type RelayToken = {
  id: number;
  user: User;
  amount: number;
  history: RelayTokenHistory[];
  relay_group: RelayGroup;
};

type RelayTokenHistory = {
  id: number;
  score: number;
  date: Date;
  rewards: { type: string; amount: number }[];
};

type RelayRankingReward = {
  ranking: number;
  rewards: { type: string; amount: number }[];
};

type WheelInfo = {
  reward_table: {
    probability: number;
    rewards: Reward[];
  }[];
  cost: number;
};

type UserItemStatus = null | "owned" | "trading" | "auctioning";

type TradeStatus =
  | "proposed"
  | "counter_proposed"
  | "canceled"
  | "rejected"
  | "success"
  | "failed"
  | "expired";

type TradeHistory = {
  id: number;
  status: TradeStatus;
  date: Date;
};

type Trade = {
  id: number;
  proposer: User;
  partner: User;
  proposer_items: Inventory[];
  partner_items: Inventory[];
  proposer_read: boolean;
  partner_read: boolean;
  expires: Date;
  status: TradeStatus;
  history: TradeHistory[];
};

type UserRoom = {
  id: number;
  start_time: Date;
  completion_time: Date;
  duration: number;
  completed: boolean;
  completion_rate: number;
  owned_items: { [key: number]: number };
  room: Room;
  user: User;
};

type Ranking = {
  id: number;
  username: string;
  duration?: number;
  completion_count: number;
  items_count: number;
  rank?: number;
}[];

type CollectionStatus = {
  id: number;
  username: string;
  completion_count: number;
  items_count: number;
};

type CollectionStatusByUser = {
  [id: number]: CollectionStatus;
};

type Leaderboard = {
  id: number;
  name: string;
  ranking: Ranking[];
  date: Date;
  records: {
    ranking: Ranking;
    date: Date;
  }[];
  criteria: CollectionStatusByUser;
  ref_date: Date;
};

type Badge = {
  id: number;
  name: string;
  desc: string;
  image: { url: string };
  achievement: Achievement;
};

type Achievement = {
  id: number;
  title: string;
  desc: string;
  aid: string;
  goal: number;
  badge: Badge;
  type: "general" | "milestone" | "sub";
  milestones: Achievement[];
  rewards: Reward[];
};

type AchievementProgress = {
  id: number;
  achievement: Achievement;
  progress: number;
  reward_claimed: boolean;
  reward_claim_date: Date;
  completed: boolean;
  completion_date: Date;
  user: User;
  milestone_progresses: AchievementProgress[];
  belongs_to: AchievementProgress;
};

interface ExtendedStrapi extends Strapi {
  notification: {
    subscribeTopic: (token: string, topic: string) => Promise<Messaging>;
    unsubscribeTopic: (token: string, topic: string) => Promise<Messaging>;
    sendNotificationToTopic: (topic: string, data: any) => Promise<Messaging>;
    sendNotification: (token: string, data: any) => Promise<Messaging>;
    sendEachNotification: (messages: Message[]) => Promise<Messaging>;
    sendMulticastNotification: (
      tokens: string[],
      data: any
    ) => Promise<Messaging>;
  };
}
