import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// ===== On-chain Account Types =====

export interface AssetAccount {
  platform: PublicKey;
  creator: PublicKey;
  fractionMint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  description: string;
  assetType: AssetTypeEnum;
  location: string;
  totalValuation: BN;
  pricePerFraction: BN;
  totalSupply: BN;
  fractionsSold: BN;
  status: AssetStatusEnum;
  isVerified: boolean;
  verificationHash: number[];
  verifiedAt: BN;
  totalRevenueAccumulated: BN;
  revenuePerTokenCumulative: BN;
  lastRevenueDistribution: BN;
  oracleValuation: BN;
  oracleMonthlyRevenue: BN;
  oracleLastUpdate: BN;
  oracleDataHash: number[];
  createdAt: BN;
  saleStart: BN;
  saleEnd: BN;
  paymentVault: PublicKey;
  revenueVault: PublicKey;
  bump: number;
  index: BN;
}

export interface FractionHolderAccount {
  asset: PublicKey;
  owner: PublicKey;
  fractionsHeld: BN;
  revenuePerTokenSnapshot: BN;
  totalClaimed: BN;
  unclaimedRevenue: BN;
  firstPurchase: BN;
  lastClaim: BN;
  bump: number;
}

export interface ListingAccount {
  asset: PublicKey;
  seller: PublicKey;
  sellerTokenAccount: PublicKey;
  escrowTokenAccount: PublicKey;
  amount: BN;
  amountRemaining: BN;
  pricePerToken: BN;
  isActive: boolean;
  createdAt: BN;
  bump: number;
  listingIndex: BN;
}

export interface PlatformAccount {
  authority: PublicKey;
  treasury: PublicKey;
  feeBps: number;
  totalAssets: BN;
  totalVolume: BN;
  totalRevenueDistributed: BN;
  bump: number;
  oracleAuthority: PublicKey;
}

// ===== Enum types =====

export type AssetTypeEnum =
  | { realEstate: {} }
  | { bond: {} }
  | { commodity: {} }
  | { energy: {} }
  | { art: {} }
  | { other: {} };

export type AssetStatusEnum =
  | { draft: {} }
  | { pendingVerification: {} }
  | { active: {} }
  | { saleOpen: {} }
  | { soldOut: {} }
  | { paused: {} }
  | { closed: {} };

// ===== Display Types (parsed for frontend) =====

export interface AssetDisplay {
  publicKey: string;
  name: string;
  symbol: string;
  uri: string;
  description: string;
  assetType: string;
  location: string;
  totalValuation: number;
  pricePerFraction: number;
  fractionsSold: number;
  totalSupply: number;
  apy: number;
  isVerified: boolean;
  status: string;
  oracleValuation: number;
  oracleMonthlyRevenue: number;
  totalRevenueAccumulated: number;
  createdAt: number;
  saleStart: number;
  saleEnd: number;
  creator: string;
  index: number;
  imageUrl?: string;
}

export interface HolderDisplay {
  assetPublicKey: string;
  holderPublicKey: string;
  assetName: string;
  assetSymbol: string;
  assetType: string;
  fractionsHeld: number;
  value: number;
  unclaimedRevenue: number;
  totalClaimed: number;
  apy: number;
  firstPurchase: number;
  lastClaim: number;
}

export interface ListingDisplay {
  publicKey: string;
  assetPublicKey: string;
  assetName: string;
  assetSymbol: string;
  assetType: string;
  seller: string;
  amount: number;
  amountRemaining: number;
  pricePerToken: number;
  isActive: boolean;
  createdAt: number;
  totalValue: number;
}

// ===== Form Types =====

export interface CreateAssetFormData {
  name: string;
  symbol: string;
  uri: string;
  description: string;
  assetType: string;
  location: string;
  totalValuation: number;
  totalSupply: number;
  pricePerFraction: number;
  saleDurationDays: number;
}

export interface ListFractionsFormData {
  assetPublicKey: string;
  amount: number;
  pricePerToken: number;
}

// ===== Revenue Data =====

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  cumulative: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalUnclaimed: number;
  totalClaimed: number;
  assetsCount: number;
  averageApy: number;
}