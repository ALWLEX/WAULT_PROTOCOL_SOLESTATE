"use client";

import React from "react";
import { ListingDisplay } from "@/lib/types";
import { formatUsd, shortenAddress } from "@/lib/utils";

interface OrderBookProps {
  listings: ListingDisplay[];
  assetSymbol: string;
  onSelectListing?: (listing: ListingDisplay) => void;
}

export function OrderBook({ listings, assetSymbol, onSelectListing }: OrderBookProps) {
  // Sort by price ascending (best price first)
  const sortedListings = [...listings].sort(
    (a, b) => a.pricePerToken - b.pricePerToken
  );

  // Calculate depth
  let cumulativeAmount = 0;
  const depthData = sortedListings.map((listing) => {
    cumulativeAmount += listing.amountRemaining;
    return { ...listing, cumulativeAmount };
  });

  const maxCumulative = cumulativeAmount;

  return (
    <div className="wault-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          Order Book — ${assetSymbol}
        </h3>
        <span className="text-xs text-wault-muted">
          {listings.length} active orders
        </span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-5 gap-2 text-xs text-wault-muted font-medium mb-2 px-2">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
        <span className="text-right">Seller</span>
        <span></span>
      </div>

      {/* Orders */}
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {depthData.length === 0 ? (
          <div className="text-center py-8 text-wault-muted">
            <span className="text-3xl">📭</span>
            <p className="mt-2">No active listings</p>
          </div>
        ) : (
          depthData.map((listing, i) => {
            const depthPercent =
              maxCumulative > 0
                ? (listing.cumulativeAmount / maxCumulative) * 100
                : 0;

            return (
              <div
                key={listing.publicKey}
                className="relative grid grid-cols-5 gap-2 items-center py-2 px-2 
                         rounded-lg hover:bg-white/5 cursor-pointer transition group"
                onClick={() => onSelectListing?.(listing)}
              >
                {/* Depth visualization */}
                <div
                  className="absolute inset-0 bg-green-500/5 rounded-lg"
                  style={{ width: `${depthPercent}%` }}
                />

                <span className="relative text-sm font-mono text-green-400">
                  ${(listing.pricePerToken / 1_000_000).toFixed(2)}
                </span>
                <span className="relative text-sm text-right text-white font-mono">
                  {(listing.amountRemaining / 1_000_000).toLocaleString()}
                </span>
                <span className="relative text-sm text-right text-wault-muted">
                  {formatUsd(listing.totalValue)}
                </span>
                <span className="relative text-xs text-right text-wault-muted font-mono">
                  {shortenAddress(listing.seller)}
                </span>
                <div className="relative text-right">
                  <button className="text-xs text-wault-primary opacity-0 group-hover:opacity-100 transition font-semibold">
                    Buy
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {listings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-wault-border flex justify-between text-sm">
          <div>
            <span className="text-wault-muted">Best Price: </span>
            <span className="text-green-400 font-bold">
              ${(sortedListings[0]?.pricePerToken / 1_000_000 || 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-wault-muted">Total Available: </span>
            <span className="text-white font-bold">
              {(cumulativeAmount / 1_000_000).toLocaleString()} fractions
            </span>
          </div>
        </div>
      )}
    </div>
  );
}