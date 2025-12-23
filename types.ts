
export interface User {
  fullName: string;
  mobileNumber: string;
  email: string;
  currency: string;
  pinCode: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'REINVEST' | 'PROFIT' | 'TRADE' | 'REBALANCE';
  amount: number;
  currency: string;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  allocation: number;
}

export enum RiskTolerance {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE'
}

export interface RiskSettings {
  stopLossPercentage: number;
  riskTolerance: RiskTolerance;
  autoRebalance: boolean;
  diversificationThreshold: number;
}

export interface Portfolio {
  balance: number;
  totalProfit: number;
  reinvestEnabled: boolean;
  riskSettings: RiskSettings;
}

export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  TRADING_BOT = 'TRADING_BOT',
  WALLET = 'WALLET',
  ANALYTICS = 'ANALYTICS',
  RISK_CONTROLS = 'RISK_CONTROLS'
}
