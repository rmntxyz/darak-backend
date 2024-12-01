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
  NOT_ENOUGH_STAR_POINT: {
    code: 7002,
    message: "Not enough star points",
  },
  EFFECT_NOT_ACTIVE: {
    code: 7003,
    message: "Effect is not active",
  },
  INVALID_STATUS_EFFECT: {
    code: 7004,
    message: "Invalid status effect",
  },
  TARGET_STACK_EXCEEDED: {
    code: 7005,
    message: "Target's stack is already at max",
  },
  INVALID_DRAW_TYPE: {
    code: 7006,
    message: "Invalid draw type",
  },
  NOT_OWNER_OF_DRAW_HISTORY: {
    code: 7007,
    message: "User is not the owner of the draw history",
  },
  ALREADY_REVIEWED: {
    code: 7008,
    message: "Draw history already reviewed",
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
  NO_REWARDS: {
    code: 8005,
    message: "No rewards to redeem",
  },
  INVALID_USERNAME: {
    code: 8006,
    message: "Invalid username",
  },

  // friend
  FRIEND_ID_REQUIRED: {
    code: 9001,
    message: "FriendId is required",
  },
  FRIEND_ALREADY_EXIST: {
    code: 9002,
    message: "Friend already exist",
  },
  MAX_FRIENDS_REACHED: {
    code: 9003,
    message: "Max friends reached",
  },
  FRIEND_MAX_FRIENDS_REACHED: {
    code: 9004,
    message: "Max friends reached",
  },
  FRIEND_REQUEST_ALREADY_EXIST: {
    code: 9005,
    message: "Friend request already exist",
  },
  CANNOT_ADD_YOURSELF: {
    code: 9006,
    message: "You cannot add yourself as a friend",
  },
};

export const REACTIVATION_PERIOD = 15 * 24 * 60 * 60 * 1000; // 15 days

export const ONE_DAY = 86400000;

export const RESET_HOUR = 21; // 0 ~ 23

export const RESET_DAY = 1; // 1 ~ 31

export const MAX_FRIENDS = 50;

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
  blocked: [
    {
      type: "star_point",
      amount: 40,
    },
    {
      type: "exp",
      amount: 12,
    },
  ],
  success: [
    {
      type: "star_point",
      amount: 100,
    },
    {
      type: "exp",
      amount: 30,
    },
  ],
};

export const REPAIR_COST = {
  stack1: {
    amount: 500,
  },
  stack2: {
    amount: 1000,
  },
};

export const GROUP_DIVIDER = 4;

// deprecated
export const DAILY_DRAW_LIMIT = 5;
export const RANKING_LIMIT = 10;

export const ACCOUNT_DELETION_GRACE_PERIOD = 15; // 15 days

export const LINK_PAGE = {
  en: {
    og_title: "roomix: collect your world",
    og_description:
      "Join the fun in roomix! Discover and collect lovely characters. Play now!",
    og_locale: "en_US",
    twitter_title: "roomix: collect your world",
    twitter_description:
      "Join the fun in roomix! Discover and collect lovely characters. Play now!",
    title: "Redirecting to roomix",
    h1: "Redirecting...",
    p: "If the app does not open automatically, <a id='store-link' href='#'>click here</a>.",
  },
  ko: {
    og_title: "roomix: collect your world",
    og_description:
      "roomix와 함께 즐거운 시간을! 사랑스러운 캐릭터들을 발견하고 모아보세요. 지금 바로 플레이하세요!",
    og_locale: "ko_KR",
    twitter_title: "roomix: collect your world",
    twitter_description:
      "roomix와 함께 즐거운 시간을! 사랑스러운 캐릭터들을 발견하고 모아보세요. 지금 바로 플레이하세요!",
    title: "roomix로 리디렉션 중",
    h1: "리디렉션 중...",
    p: "앱이 자동으로 열리지 않으면 <a id='store-link' href='#'>여기</a>를 클릭하세요.",
  },
  ja: {
    og_title: "roomix: collect your world",
    og_description:
      "roomixで楽しい時間を過ごしましょう！かわいらしいキャラクターを見つけて集めてください。今すぐプレイ！",
    og_locale: "ja_JP",
    twitter_title: "roomix: collect your world",
    twitter_description:
      "roomixで楽しい時間を過ごしましょう！かわいらしいキャラクターを見つけて集めてください。今すぐプレイ！",
    title: "roomixにリダイレクト中",
    h1: "リダイレクト中...",
    p: "アプリが自動的に開きませんでしたら、<a id='store-link' href='#'>こちら</a>をクリックしてください。",
  },
};

export const TRADE_NOTIFICATIONS = {
  trade_proposed: {
    title: {
      en: "You’ve received a trade request!",
      ko: "트레이드 요청을 받았어요!",
      ja: "トレードリクエストをいただきました！",
    },
    body: {
      en: "${username} requested a trade!",
      ko: "${username}님이 트레이드를 신청했어요!",
      ja: "${username}さんがトレードを申請しました！",
    },
  },
  trade_accepted: {
    title: {
      en: "Trade successful!",
      ko: "트레이드 성공!",
      ja: "トレード成功！",
    },
    body: {
      en: "${username} accepted your trade request!",
      ko: "${username}님과 트레이드를 성공적으로 완료했습니다!",
      ja: "${username}さんとのトレードが成功しました！",
    },
  },
  trade_rejected: {
    title: {
      en: "${username} rejected your trade request.",
      ko: "${username}님이 트레이드를 거절했습니다.",
      ja: "${username}さんがトレードを拒否しました。",
    },
    body: {
      en: "The requested trade was unsuccessful 🥲 How about looking for other users with the same item?",
      ko: "요청한 트레이드가 성공하지 못했어요. 🥲 같은 아이템을 가진 다른 유저를 찾아보는건 어떨까요?",
      ja: "リクエストしたトレードは成功しませんでした 🥲 同じアイテムを持っている他のユーザーを探してみませんか？",
    },
  },
  trade_canceled: {
    title: {
      en: "The trade was canceled.",
      ko: "트레이드가 취소되었어요.",
      ja: "トレードがキャンセルされました。",
    },
    body: {
      en: "${username} canceled the trade.",
      ko: "${username}님이 트레이드를 취소했어요.",
      ja: "${username}さんがトレードをキャンセルしました。",
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

export const ATTACK_NOTIFICATIONS = {
  blocked: {
    title: {
      en: "You lost your shield!",
      ko: "방패가 사라졌습니다.",
      ja: "シールドが破壊されました！",
    },
    body: {
      en: "${username} broke your shield!🛡️ Get revenge now!",
      ko: "${username}님이 방패를 부셨어요!🛡️ 지금 바로 복수하러 가요!",
      ja: "${username}があなたのシールドを壊しました！🛡️ 今すぐリベンジしましょう！",
    },
  },
  success: {
    title: {
      en: "You are attacked!",
      ko: "공격 당했습니다!",
      ja: "アタックされました！",
    },
    body: {
      en: "${username} broke your machine!🔨 Fix it now!",
      ko: "${username}님의 공격으로 머신이 망가졌어요!🔨 얼른 수리하세요!",
      ja: "${username}があなたのマシンを壊しました！🔨 今すぐ修理してください！",
    },
  },
};

export const BYPASS_VALUE = (v) => v;
