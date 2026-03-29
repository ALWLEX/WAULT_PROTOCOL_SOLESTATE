"use client";

import { useState, useCallback } from "react";
import { useWaultProgram } from "./useWaultProgram";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { PLATFORM_SEEDS } from "@/lib/constants";

interface OracleData {
  valuation: number;
  monthlyRevenue: number;
  lastUpdate: number;
  dataHash: string;
}

export function useOracle() {
  const { program, programId } = useWaultProgram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOracleData = useCallback(
    async (assetPublicKey: string): Promise<OracleData | null> => {
      if (!program) return null;

      try {
        const assetPda = new PublicKey(assetPublicKey);
        const assetAccount = await program.account.asset.fetch(assetPda);
        const asset = assetAccount as any;

        return {
          valuation: new BN(asset.oracleValuation).toNumber(),
          monthlyRevenue: new BN(asset.oracleMonthlyRevenue).toNumber(),
          lastUpdate: new BN(asset.oracleLastUpdate).toNumber(),
          dataHash: Buffer.from(asset.oracleDataHash).toString("hex"),
        };
      } catch (err: any) {
        console.error("Failed to fetch oracle data:", err);
        return null;
      }
    },
    [program]
  );

  const updateOracleData = useCallback(
    async (
      assetPublicKey: string,
      valuation: number,
      monthlyRevenue: number,
      dataHash: number[]
    ): Promise<string> => {
      if (!program) throw new Error("Program not initialized");

      setLoading(true);
      setError(null);

      try {
        const [platformPda] = PublicKey.findProgramAddressSync(
          [Buffer.from(PLATFORM_SEEDS)],
          programId
        );

        const assetPda = new PublicKey(assetPublicKey);

        const tx = await program.methods
          .updateOracle(
            new BN(valuation),
            new BN(monthlyRevenue),
            dataHash
          )
          .accounts({
            platform: platformPda,
            asset: assetPda,
            oracleAuthority: program.provider.publicKey!,
          })
          .rpc();

        return tx;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, programId]
  );

  return {
    getOracleData,
    updateOracleData,
    loading,
    error,
  };
}