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

  // Trading
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
};

export const RANKING_LIMIT = 5;
