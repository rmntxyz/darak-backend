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
