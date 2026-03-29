"use client";

import { useState, useEffect, useCallback } from "react";
import { useWaultProgram } from "./useWaultProgram";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { AssetAccount, AssetDisplay } from "@/lib/types";
import { PLATFORM_SEEDS, ASSET_SEEDS } from "@/lib/constants";
import { lamportsToUsd, calculateProgress, getAssetTypeLabel } from "@/lib/utils";

export function useAssets() {
  const { program, programId } = useWaultProgram();
  const [assets, setAssets] = useState<AssetDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!program) {
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

      const fetchedAssets: AssetDisplay[] = [];

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

          const assetAccount = await program.account.asset.fetch(assetPda);
          const asset = assetAccount as unknown as AssetAccount;

          const totalValuation = new BN(asset.totalValuation).toNumber();
          const pricePerFraction = new BN(asset.pricePerFraction).toNumber();
          const fractionsSold = new BN(asset.fractionsSold).toNumber();
          const totalSupply = new BN(asset.totalSupply).toNumber();
          const oracleMonthlyRevenue = new BN(asset.oracleMonthlyRevenue).toNumber();

          // Calculate APY: (monthlyRevenue * 12) / totalValuation * 100
          const annualRevenue = oracleMonthlyRevenue * 12;
          const apy = totalValuation > 0
            ? (annualRevenue / totalValuation) * 100
            : 0;

          fetchedAssets.push({
            publicKey: assetPda.toBase58(),
            name: asset.name,
            symbol: asset.symbol,
            uri: asset.uri,
            description: asset.description,
            assetType: getAssetTypeLabel(asset.assetType),
            location: asset.location,
            totalValuation,
            pricePerFraction,
            fractionsSold,
            totalSupply,
            apy: Math.round(apy * 10) / 10,
            isVerified: asset.isVerified,
            status: Object.keys(asset.status)[0],
            oracleValuation: new BN(asset.oracleValuation).toNumber(),
            oracleMonthlyRevenue,
            totalRevenueAccumulated: new BN(asset.totalRevenueAccumulated).toNumber(),
            createdAt: new BN(asset.createdAt).toNumber(),
            saleStart: new BN(asset.saleStart).toNumber(),
            saleEnd: new BN(asset.saleEnd).toNumber(),
            creator: asset.creator.toBase58(),
            index: i,
          });
        } catch (err) {
          console.warn(`Failed to fetch asset ${i}:`, err);
        }
      }

      setAssets(fetchedAssets);
    } catch (err: any) {
      console.error("Failed to fetch assets:", err);
      setError(err.message || "Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  }, [program, programId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
  };
}

export function useAsset(assetId: string) {
  const { assets, loading, error, refetch } = useAssets();

  const asset = assets.find(
    (a) => a.publicKey === assetId || a.index.toString() === assetId
  );

  return { asset, loading, error, refetch };
}