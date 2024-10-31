export type TODO = any;

export const REQUEST_TYPE = {
  CREATE_USER: "CREATE_USER",
  GET_USER: "GET_USER",
  CREATE_SYMBOL: "CREATE_SYMBOL",
  VIEW_ORDERBOOK: "VIEW_ORDERBOOK",
  GET_ORDERBOOK_BY_STOCK_SYMBOL: "GET_ORDERBOOK_BY_STOCK_SYMBOL",
  BUY_ORDER: "BUY_ORDER",
  SELL_ORDER: "SELL_ORDER",
  MINT_TOKENS: "MINT_TOKENS",
  GET_INR_BALANCES: "GET_INR_BALANCES",
  GET_STOCK_BALANCES: "GET_STOCK_BALANCES",
  GET_USER_STOCK_BALANCE: "GET_USER_STOCK_BALANCE",
  GET_USER_STOCK_BALANCE_BY_STOCK_SYMBOL: "GET_USER_STOCK_BALANCE_BY_STOCK_SYMBOL",
  GET_USER_BALANCE: "GET_USER_BALANCE",
  ONRAMP_USER_BALANCE: "ONRAMP_USER_BALANCE",
  RESET_STATES: "RESET_STATES",
  CRASH_SERVER: "CRASH_SERVER",
  RESTORE_SERVER_STATE: "RESTORE_SERVER_STATE",
  GET_ALL_STOCK_SYMBOLS: "GET_ALL_STOCK_SYMBOLS",
} as const;

export enum STATUS_TYPE {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}