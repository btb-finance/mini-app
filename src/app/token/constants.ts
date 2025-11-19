import { base } from 'viem/chains';

export const BTB_TOKEN_ADDRESS = "0x888e85C95c84CA41eEf3E4C8C89e8dcE03e41488" as const;
export const BONDING_CURVE_ADDRESS = "0x88888E2Dbd96cC16BD8f52D1de0eCCF2252562d6" as const;
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

export const DEFAULT_CHAIN = base;

export const TABS = [
    { id: 'buy', label: 'Buy' },
    { id: 'sell', label: 'Sell' },
] as const;

export type TabId = typeof TABS[number]['id'];
