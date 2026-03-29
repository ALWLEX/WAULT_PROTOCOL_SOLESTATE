import { PublicKey } from "@solana/web3.js";

// Program ID — replace after deployment
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
);

// RPC endpoint
export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

// USDC Mint on devnet (use your mock mint or circle's devnet USDC)
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" // devnet USDC
);

// PDA seeds
export const PLATFORM_SEEDS = "platform";
export const ASSET_SEEDS = "asset";
export const FRACTION_MINT_SEEDS = "fraction_mint";
export const FRACTION_VAULT_SEEDS = "fraction_vault";
export const PAYMENT_VAULT_SEEDS = "payment_vault";
export const REVENUE_VAULT_SEEDS = "revenue_vault";
export const HOLDER_SEEDS = "holder";
export const LISTING_SEEDS = "listing";
export const ESCROW_SEEDS = "escrow";

// Platform config
export const PLATFORM_FEE_BPS = 250; // 2.5%
export const FRACTION_DECIMALS = 6;

// UI constants
export const ASSET_TYPE_ICONS: Record<string, string> = {
  realEstate: "🏢",
  bond: "📜",
  commodity: "⚡",
  energy: "🔋",
  art: "🎨",
  other: "📦",
  RealEstate: "🏢",
  Bond: "📜",
  Commodity: "⚡",
  Energy: "🔋",
  Art: "🎨",
  Other: "📦",
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  realEstate: "Real Estate",
  bond: "Bond",
  commodity: "Commodity",
  energy: "Energy",
  art: "Art",
  other: "Other",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  pendingVerification: "bg-yellow-500/20 text-yellow-400",
  active: "bg-blue-500/20 text-blue-400",
  saleOpen: "bg-green-500/20 text-green-400",
  soldOut: "bg-purple-500/20 text-purple-400",
  paused: "bg-orange-500/20 text-orange-400",
  closed: "bg-red-500/20 text-red-400",
};

// Explorer URLs
export const EXPLORER_BASE = "https://explorer.solana.com";
export const CLUSTER = "devnet";

export function getExplorerUrl(
  type: "tx" | "address" | "token",
  value: string
): string {
  return `${EXPLORER_BASE}/${type}/${value}?cluster=${CLUSTER}`;
}