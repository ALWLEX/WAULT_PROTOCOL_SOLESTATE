import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  PROGRAM_ID,
  PLATFORM_SEEDS,
  ASSET_SEEDS,
  FRACTION_MINT_SEEDS,
  FRACTION_VAULT_SEEDS,
  PAYMENT_VAULT_SEEDS,
  REVENUE_VAULT_SEEDS,
  HOLDER_SEEDS,
  LISTING_SEEDS,
  ESCROW_SEEDS,
  ASSET_TYPE_LABELS,
} from "./constants";

// ===== PDA Derivation =====

export function getPlatformPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PLATFORM_SEEDS)],
    PROGRAM_ID
  );
}

export function getAssetPda(
  platformPda: PublicKey,
  index: number
): [PublicKey, number] {
  const indexBN = new BN(index);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(ASSET_SEEDS),
      platformPda.toBuffer(),
      indexBN.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );
}

export function getFractionMintPda(assetPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FRACTION_MINT_SEEDS), assetPda.toBuffer()],
    PROGRAM_ID
  );
}

export function getFractionVaultPda(assetPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FRACTION_VAULT_SEEDS), assetPda.toBuffer()],
    PROGRAM_ID
  );
}

export function getPaymentVaultPda(assetPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PAYMENT_VAULT_SEEDS), assetPda.toBuffer()],
    PROGRAM_ID
  );
}

export function getRevenueVaultPda(assetPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(REVENUE_VAULT_SEEDS), assetPda.toBuffer()],
    PROGRAM_ID
  );
}

export function getHolderPda(
  assetPda: PublicKey,
  owner: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(HOLDER_SEEDS), assetPda.toBuffer(), owner.toBuffer()],
    PROGRAM_ID
  );
}

export function getListingPda(
  assetPda: PublicKey,
  seller: PublicKey,
  timestamp: number
): [PublicKey, number] {
  const tsBN = new BN(timestamp);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(LISTING_SEEDS),
      assetPda.toBuffer(),
      seller.toBuffer(),
      tsBN.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );
}

export function getEscrowPda(listingPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEEDS), listingPda.toBuffer()],
    PROGRAM_ID
  );
}

// ===== Formatting =====

export function lamportsToUsd(lamports: number, decimals: number = 6): number {
  return lamports / Math.pow(10, decimals);
}

export function usdToLamports(usd: number, decimals: number = 6): number {
  return Math.round(usd * Math.pow(10, decimals));
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUsdCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return formatUsd(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTimestampFull(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatTimestamp(timestamp);
}

// ===== Calculations =====

export function calculateProgress(sold: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((sold / total) * 100, 100);
}

export function calculateApy(
  monthlyRevenue: number,
  totalValuation: number
): number {
  if (totalValuation === 0) return 0;
  return ((monthlyRevenue * 12) / totalValuation) * 100;
}

export function calculateUserRevenue(
  totalRevenue: number,
  userFractions: number,
  totalFractions: number
): number {
  if (totalFractions === 0) return 0;
  return (totalRevenue * userFractions) / totalFractions;
}

// ===== Asset Type Helpers =====

export function getAssetTypeLabel(assetType: any): string {
  const key = Object.keys(assetType)[0];
  return ASSET_TYPE_LABELS[key] || key || "Other";
}

export function getAssetTypeKey(assetType: any): string {
  return Object.keys(assetType)[0] || "other";
}

// ===== Validation =====

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function validateAmount(amount: number, max: number): string | null {
  if (amount <= 0) return "Amount must be greater than 0";
  if (amount > max) return `Amount cannot exceed ${formatNumber(max)}`;
  if (!Number.isInteger(amount)) return "Amount must be a whole number";
  return null;
}

// ===== Clipboard =====

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ===== Class Name Helper =====

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}