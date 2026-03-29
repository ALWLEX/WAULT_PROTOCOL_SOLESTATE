"use client";

import { useState, useEffect, useCallback } from "react";
import { useWaultProgram } from "./useWaultProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { HolderDisplay } from "@/lib/types";
import { PLATFORM_SEEDS, ASSET_SEEDS, HOLDER_SEEDS } from "@/lib/constants";

export function usePortfolio() {
  const { program, programId, connected } = useWaultProgram();
  const { publicKey } = useWallet();
  const [holdings, setHoldings] = useState<HolderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!program || !publicKey || !connected) {
      setHoldings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(PLATFORM_SEEDS)],
        programId
      );

      const platform = await program.account.platform.fetch(platformPda);
      const totalAssets = (platform.totalAssets as BN).toNumber();

      const userHoldings: HolderDisplay[] = [];

      for (let i = 0; i < totalAssets; i++) {
        try {
          const indexBN = new BN(i);
          const [assetPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from(ASSET_SEEDS),
              platformPda.toBuffer(),
              indexBN.toArrayLike(Buffer, "le", 8),
            ],
            programId
          );

          const [holderPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from(HOLDER_SEEDS),
              assetPda.toBuffer(),
              publicKey.toBuffer(),
            ],
            programId
          );

          try {
            const holderAccount = await program.account.fractionHolder.fetch(holderPda);
            const assetAccount = await program.account.asset.fetch(assetPda);

            const fractionsHeld = new BN(holderAccount.fractionsHeld).toNumber();

            if (fractionsHeld > 0) {
              const pricePerFraction = new BN(assetAccount.pricePerFraction).toNumber();
              const unclaimedRevenue = new BN(holderAccount.unclaimedRevenue).toNumber();
              const totalClaimed = new BN(holderAccount.totalClaimed).toNumber();
              const oracleMonthlyRevenue = new BN(assetAccount.oracleMonthlyRevenue).toNumber();
              const totalSupply = new BN(assetAccount.totalSupply).toNumber();

              // Calculate value based on oracle or purchase price
              const value = (fractionsHeld * pricePerFraction) / 1_000_000;

              // Calculate user's share of monthly revenue
              const userMonthlyRevenue = totalSupply > 0
                ? (oracleMonthlyRevenue * fractionsHeld) / totalSupply
                : 0;
              const userApy = value > 0
                ? ((userMonthlyRevenue * 12) / (value * 1_000_000)) * 100
                : 0;

              // Calculate pending revenue from cumulative tracker
              const revenuePerTokenCumulative = new BN(
                assetAccount.revenuePerTokenCumulative
              );
              const revenuePerTokenSnapshot = new BN(
                holderAccount.revenuePerTokenSnapshot
              );
              const diff = revenuePerTokenCumulative.sub(revenuePerTokenSnapshot);
              const pendingRevenue = diff
                .mul(new BN(fractionsHeld))
                .div(new BN("1000000000000000000"))
                .toNumber();

              const totalUnclaimed = unclaimedRevenue + pendingRevenue;

              userHoldings.push({
                assetPublicKey: assetPda.toBase58(),
                holderPublicKey: holderPda.toBase58(),
                assetName: (assetAccount as any).name,
                assetSymbol: (assetAccount as any).symbol,
                assetType: Object.keys((assetAccount as any).assetType)[0],
                fractionsHeld,
                value: value / 1_000_000,
                unclaimedRevenue: totalUnclaimed / 1_000_000,
                totalClaimed: totalClaimed / 1_000_000,
                apy: Math.round(userApy * 10) / 10,
                firstPurchase: new BN(holderAccount.firstPurchase).toNumber(),
                lastClaim: new BN(holderAccount.lastClaim).toNumber(),
              });
            }
          } catch {
            // No holder account for this asset — skip
          }
        } catch (err) {
          console.warn(`Failed to check asset ${i}:`, err);
        }
      }

      setHoldings(userHoldings);
    } catch (err: any) {
      console.error("Failed to fetch portfolio:", err);
      setError(err.message || "Failed to fetch portfolio");
    } finally {
      setLoading(false);
    }
  }, [program, programId, publicKey, connected]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalUnclaimedRevenue = holdings.reduce((sum, h) => sum + h.unclaimedRevenue, 0);
  const totalClaimedRevenue = holdings.reduce((sum, h) => sum + h.totalClaimed, 0);

  return {
    holdings,
    loading,
    error,
    refetch: fetchPortfolio,
    totalPortfolioValue,
    totalUnclaimedRevenue,
    totalClaimedRevenue,
    assetsCount: holdings.length,
  };
}