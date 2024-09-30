export const ErrorCode = {
  /* HTTP errors */

  INVALID_REQUEST: {
    code: 400,
    message: "Invalid request",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized",
  },
  FORBIDDEN: {
    code: 403,
    message: "Forbidden",
  },
  NOT_FOUND: {
    code: 404,
    message: "Not found",
  },
  LOCKED: {
    code: 423,
    message: "Locked",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "Internal server error",
  },
  BAD_GATEWAY: {
    code: 502,
    message: "Bad gateway",
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    message: "Service unavailable",
  },
  GATEWAY_TIMEOUT: {
    code: 504,
    message: "Gateway timeout",
  },

  /* Custom errors */

  // Trade
  TRADE_EXPIRED: {
    code: 1001,
    message: "Trade expired",
  },
  TRADE_NOT_FOUND: {
    code: 1002,
    message: "Trade not found",
  },
  INVALID_TRADE_STATUS: {
    code: 1003,
    message: "Invalid trade status",
  },
  INVALID_TRADE_ITEMS: {
    code: 1004,
    message: "Items are either empty or invalid",
  },
  DAILY_TRADE_LIMIT_EXCEEDED: {
    code: 1005,
    message: "Daily trade limit exceeded",
  },
  PROPOSER_ITEMS_NOT_FOUND: {
    code: 1006,
    message: "Trade proposed item not found",
  },
  PARTNER_ITEMS_NOT_FOUND: {
    code: 1007,
    message: "Trade partner item not found",
  },
  ONLY_PARTNER_CAN_COUNTER_PROPOSE: {
    code: 1008,
    message: "Only partner can counter propose",
  },
  NOT_PARTICIPANT: {
    code: 1009,
    message: "Not participant",
  },
  ONLY_PARTNER_CAN_ACCEPT_PROPOSAL: {
    code: 1010,
    message: "Only partner can accept proposal",
  },
  ONLY_PROPOSER_CAN_ACCEPT_COUNTER_PROPOSAL: {
    code: 1011,
    message: "Only proposer can accept counter proposal",
  },
  TRADE_ITEM_LIMIT_EXCEEDED: {
    code: 1012,
    message: "Item limit exceeded",
  },
  NOT_ENOUGH_TRADING_CREDITS: {
    code: 1013,
    message: "Not enough trading credits",
  },
  NOT_ENOUGH_PROPOSER_ITEMS: {
    code: 1014,
    message: "not enough proposer items",
  },
  NOT_ENOUGH_PARTNER_ITEMS: {
    code: 1015,
    message: "not enough partner items",
  },
  DEVICE_TOKEN_NOT_FOUND: {
    code: 1016,
    message: "Device token not found",
  },

  // Inventory Management
  INVALID_ITEMS_STATUS: {
    code: 2001,
    message: "Invalid user item's status",
  },
  ITEM_NOT_OWNED: {
    code: 2002,
    message: "Item not owned",
  },
  NON_NUMERIC_INPUT: {
    code: 2003,
    message: "Invalid input, numeric value expected",
  },
  NOT_ENOUGH_ITEMS: {
    code: 2004,
    message: "Not enough items",
  },

  // Draw
  NOT_ENOUGH_FREEBIES: {
    code: 3001,
    message: "Not enough freebies",
  },
  NOT_ENOUGH_STAR_POINTS: {
    code: 3002,
    message: "Not enough star points",
  },
  DAILY_DRAW_LIMIT_EXCEEDED: {
    code: 3003,
    message: "Daily draw limit exceeded",
  },
  DRAW_NOT_FOUND: {
    code: 3004,
    message: "Draw not found",
  },
  DRAW_NOT_STARTED: {
    code: 3005,
    message: "Draw not started",
  },
  DRAW_ENDED: {
    code: 3006,
    message: "Draw ended",
  },
  INVALID_MULTIPLY: {
    code: 3007,
    message: "Invalid multiply",
  },

  // wheel spins
  NOT_ENOUGH_WHEEL_SPINS: {
    code: 4001,
    message: "Not enough wheel spins",
  },

  // get random items
  NOT_FOUND_ITEM_LIST: {
    code: 5001,
    message: "Not found item list",
  },

  // shield
  NOT_ENOUGH_SHIELDS: {
    code: 6001,
    message: "Not enough shield",
  },

  // attack
  UNAUTHORIZED_ATTACK: {
    code: 7001,
    message: "Unauthorized attack",
  },
  // not enough star points
  NOT_ENOUGH_STAR_POINT: {
    code: 7002,
    message: "Not enough star points",
  },
  // effect not active
  EFFECT_NOT_ACTIVE: {
    code: 7003,
    message: "Effect is not active",
  },
  INVALID_STATUS_EFFECT: {
    code: 7004,
    message: "Invalid status effect",
  },

  // event-coupon
  COUPON_CODE_NOT_FOUND: {
    code: 8001,
    message: "Coupon not found",
  },
  COUPON_ALREADY_REDEEMED: {
    code: 8002,
    message: "Coupon already redeemed",
  },
  COUPON_NOT_STARTED: {
    code: 8003,
    message: "Coupon not started",
  },
  COUPON_EXPIRED: {
    code: 8004,
    message: "Coupon expired",
  },
};

export const REACTIVATION_PERIOD = 15 * 24 * 60 * 60 * 1000; // 15 days

export const ONE_DAY = 86400000;

export const RESET_HOUR = 21; // 0 ~ 23

export const RESET_DAY = 1; // 1 ~ 31

export const REF_DATE = new Date(
  `June 16, 2024, ${RESET_HOUR}:00:00`
).getTime();

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CHECK_IN_RESET_DAYS = 7;

export const TRADE_ITEM_LIMIT = 3;

export const AVAILABLE_MULTIPLY = [1, 2, 3, 5, 10 /*, 20*/];

export const COUNTING_RARITIES = ["common", "uncommon", "rare", "unique"];

export const EXP_BY_RARITY = {
  common: 30,
  uncommon: 50,
  rare: 100,
  unique: 300,
  secret: 1000,
};

export const EXP_MULT_FOR_DUPLICATE = 0.1;

export const ITEM_PROBABILITY = {
  common: 0.45,
  uncommon: 0.35,
  rare: 0.16,
  unique: 0.03,
  secret: 0.01,
};

export const ATTACK_REWARDS = {
  blocked: {
    type: "star_point",
    amount: 3000,
  },
  success: {
    type: "star_point",
    amount: 1000,
  },
};

export const REPAIR_COST = {
  stack1: {
    amount: 500,
  },
  stack2: {
    amount: 1000,
  },
};

// deprecated
export const DAILY_DRAW_LIMIT = 5;
export const RANKING_LIMIT = 10;

export const ACCOUNT_DELETION_GRACE_PERIOD = 15; // 15 days

export const TRADE_NOTIFICATIONS = {
  trade_proposed: {
    title: {
      en: "Trade proposed",
      ko: "거래 제안됨",
      ja: "取引提案",
    },
    body: {
      en: "${username} has proposed a trade.",
      ko: "${username}님이 거래를 제안했습니다.",
      ja: "${username}さんが取引を提案しました。",
    },
  },
  trade_accepted: {
    title: {
      en: "Trade accepted",
      ko: "거래 수락됨",
      ja: "取引承諾",
    },
    body: {
      en: "${username} has accepted the trade.",
      ko: "${username}님이 거래를 수락했습니다.",
      ja: "${username}さんが取引を承諾しました。",
    },
  },
  trade_rejected: {
    title: {
      en: "Trade rejected",
      ko: "거래 거부됨",
      ja: "取引拒否",
    },
    body: {
      en: "${username} has rejected the trade.",
      ko: "${username}님이 거래를 거부했습니다.",
      ja: "${username}さんが取引を拒否しました。",
    },
  },
  trade_canceled: {
    title: {
      en: "Trade canceled",
      ko: "거래 취소됨",
      ja: "取引キャンセル",
    },
    body: {
      en: "${username} has canceled the trade.",
      ko: "${username}님이 거래를 취소했습니다.",
      ja: "${username}さんが取引をキャンセルしました。",
    },
  },
  // trade_expired: {
  //   title: {
  //     en: "Trade expired",
  //     ko: "거래 만료됨",
  //     ja: "取引期限切れ",
  //   },
  //   body: {
  //     en: "The trade with ${username} has expired.",
  //     ko: "${username}님과의 거래가 만료되었습니다.",
  //     ja: "${username}さんとの取引が期限切れになりました。",
  //   },
  // },
};

export const BYPASS_VALUE = (v) => v;
