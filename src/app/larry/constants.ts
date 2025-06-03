import { base } from 'viem/chains';

export const LARRY_CONTRACT_ADDRESS = '0x888d81e3ea5E8362B5f69188CBCF34Fa8da4b888' as const;

export const LARRY_DECIMALS = 18;

export const FEE_BASE = 10000;

export const DEFAULT_CHAIN = base;

export const MIN_TRADE_AMOUNT = 1000;

export const MAX_BORROW_DAYS = 365;

export const LEVERAGE_TABS = [
  { id: 'buy', label: 'Buy' },
  { id: 'sell', label: 'Sell' },
  { id: 'leverage', label: 'Leverage' },
  { id: 'borrow', label: 'Borrow' },
  { id: 'positions', label: 'My Positions' }
] as const;

export type LeverageTabId = typeof LEVERAGE_TABS[number]['id'];

export const formatLarry = (amount: bigint): string => {
  const formatted = (Number(amount) / 10 ** LARRY_DECIMALS).toFixed(4);
  return parseFloat(formatted).toLocaleString();
};

export const formatEth = (amount: bigint): string => {
  const formatted = (Number(amount) / 10 ** 18).toFixed(6);
  return parseFloat(formatted).toLocaleString();
};

export const parseEth = (amount: string): bigint => {
  return BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
};

export const parseLarry = (amount: string): bigint => {
  return BigInt(Math.floor(parseFloat(amount) * 10 ** LARRY_DECIMALS));
};

export const formatPrice = (price: bigint): string => {
  const priceNum = Number(price) / 10**18;
  
  // If price is 0, return "0"
  if (priceNum === 0) return '0';
  
  // If price is greater than 0.01, show normally with 2-6 decimals
  if (priceNum >= 0.01) {
    return priceNum.toFixed(6).replace(/\.?0+$/, '');
  }
  
  // For small prices, create a compact format
  const priceStr = priceNum.toString();
  const match = priceStr.match(/^0\.(0*)([1-9]\d*)/);
  
  if (match) {
    const zeros = match[1].length;
    const significantDigits = match[2];
    
    // Take first 6 significant digits
    const displayDigits = significantDigits.substring(0, 6);
    
    if (zeros === 0) {
      return `0.${displayDigits}`;
    }
    
    // Return format like "0.0{5}1234" for 0.000001234
    // This shows there are 5 zeros after decimal point
    return `0.0{${zeros}}${displayDigits}`;
  }
  
  // Fallback
  return priceNum.toFixed(12).replace(/\.?0+$/, '');
};