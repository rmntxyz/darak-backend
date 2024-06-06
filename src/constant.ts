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
};

export const RANKING_LIMIT = 10;

export const TRADE_ITEM_LIMIT = 5;

export const DAILY_DRAW_LIMIT = 5;

export const AVAILABLE_MULTIPLY = [1, 2, 3, 5, 10 /*, 20*/];

export const ITEM_PROBABILITY = {
  common: 1,
  uncommon: 0.3,
  rare: 0.08,
  unique: 0.015,
  secret: 0.005,
};
