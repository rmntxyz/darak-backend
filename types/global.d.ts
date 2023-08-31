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
  current_streak: number;
  longest_streak: number;
  last_login_date: Date;
};

type User = {
  id: number;
  freebie: Freebie;
  streak: Streak;
  daily_quest_progresses: DailyQuestProgress[];
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
  desc: string;
  level_requirement: number;
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
  // room: Room;
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
