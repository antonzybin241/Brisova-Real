import {
  mainnet,
  polygon,
  base,
  arbitrum,
  optimism,
  bsc,
  avalanche,
} from "viem/chains";

/** Primary network is Ethereum mainnet; L2s remain selectable. */
export const SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  base,
  arbitrum,
  optimism,
  bsc,
  avalanche,
];

export const DEFAULT_CHAIN_ID = mainnet.id;

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((c) => c.id);

export const CHAIN_META = {
  [mainnet.id]: { name: "Ethereum", explorer: "https://etherscan.io", symbol: "ETH" },
  [polygon.id]: { name: "Polygon", explorer: "https://polygonscan.com", symbol: "MATIC" },
  [base.id]: { name: "Base", explorer: "https://basescan.org", symbol: "ETH" },
  [arbitrum.id]: { name: "Arbitrum", explorer: "https://arbiscan.io", symbol: "ETH" },
  [optimism.id]: { name: "Optimism", explorer: "https://optimistic.etherscan.io", symbol: "ETH" },
  [bsc.id]: { name: "BNB Chain", explorer: "https://bscscan.com", symbol: "BNB" },
  [avalanche.id]: { name: "Avalanche", explorer: "https://snowtrace.io", symbol: "AVAX" },
};

export const USER_ROLES = [
  "GUEST",
  "INVESTOR",
  "PROPERTY_OWNER",
  "BROKER",
  "AGENCY",
  "ADMIN",
  "COMPLIANCE_OFFICER",
];
