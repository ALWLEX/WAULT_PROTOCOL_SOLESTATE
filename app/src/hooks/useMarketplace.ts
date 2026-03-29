"use client";

import { useState, useEffect, useCallback } from "react";
import { useWaultProgram } from "./useWaultProgram";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { ListingDisplay } from "@/lib/types";

export function useMarketplace(assetFilter?: string) {
  const { program, programId } = useWaultProgram();
  const { connection } = useConnection();
  const [listings, setListings] = useState<ListingDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (!program) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all listing accounts
      const allListings = await program.account.listing.all();

      const displayListings: ListingDisplay[] = [];

      for (const listing of allListings) {
        const data = listing.account as any;

        // Filter by asset if specified
        if (assetFilter && data.asset.toBase58() !== assetFilter) {
          continue;
        }

        // Only show active listings
        if (!data.isActive) continue;

        // Fetch associated asset for name/symbol
        let assetName = "Unknown Asset";
        let assetSymbol = "???";
        let assetType = "Other";

        try {
          const assetAccount = await program.account.asset.fetch(data.asset);
          assetName = (assetAccount as any).name;
          assetSymbol = (assetAccount as any).symbol;
          assetType = Object.keys((assetAccount as any).assetType)[0];
        } catch {
          // Asset might not exist anymore
        }

        displayListings.push({
          publicKey: listing.publicKey.toBase58(),
          assetPublicKey: data.asset.toBase58(),
          assetName,
          assetSymbol,
          assetType,
          seller: data.seller.toBase58(),
          amount: new BN(data.amount).toNumber(),
          amountRemaining: new BN(data.amountRemaining).toNumber(),
          pricePerToken: new BN(data.pricePerToken).toNumber(),
          isActive: data.isActive,
          createdAt: new BN(data.createdAt).toNumber(),
          totalValue:
            (new BN(data.amountRemaining).toNumber() *
              new BN(data.pricePerToken).toNumber()) /
            1_000_000_000_000,
        });
      }

      // Sort by newest first
      displayListings.sort((a, b) => b.createdAt - a.createdAt);

      setListings(displayListings);
    } catch (err: any) {
      console.error("Failed to fetch listings:", err);
      setError(err.message || "Failed to fetch marketplace listings");
    } finally {
      setLoading(false);
    }
  }, [program, programId, assetFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const totalListingVolume = listings.reduce((sum, l) => sum + l.totalValue, 0);
  const activeListingsCount = listings.filter((l) => l.isActive).length;

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
    totalListingVolume,
    activeListingsCount,
  };
}