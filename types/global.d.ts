type Freebie = {
  id: number;
  current: number;
  max: number;
  last_charged_at: number;
  charge_interval: number;
};

type FreebieData = Partial<Freebie>;

type Streak = {
  id: number;
  current_login: number;
  longest_login: number;
  last_login_date: Date;
  current_draw: number;
  longest_draw: number;
  last_draw_date: Date;
};

type User = {
  id: number;
  star_point: StarPoint;
  freebie: Freebie;
  streak: Streak;
  daily_quest_progresses: DailyQuestProgress[];
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
  | "item_sale"
  | "item_draw"
  | "archivement_reward"
  | "quest_reward";

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
  desc: string;
  level_requirement: number;
  qid: string;
  streak_rewards: [
    {
      id: number;
      rewards: Reward[];
    }
  ];
};

type Reward = {
  type: "freebie" | "star" | "item" | "exp" | "point";
  amount: number;
  item?: Item;
};

type Item = {
  id: number;
  name: string;
  desc: string;
  image: { url: string };
  thumbnail: { url: string };
  additional_image: { url: string };
  rarity: "common" | "uncommon" | "rare" | "super_rare" | "unique";
  category: "built-in" | "decoration";
  price: number;
  current_serial_number: number;
  room: Room;
  // inventory: Inventory;
  item_code: number;
  attribute: JSON;
};

type Draw = {
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
  super_rare: RarityData;
  unique: RarityData;
};

type Inventory = {
  id: number;
  serial_number: number;
  item: Item;
  status: UserItemStatus;
  users_permissions_user: User;
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
  duration: number;
  completion_count: number;
  rank?: number;
}[];
