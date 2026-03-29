"use client";

import React from "react";
import { motion } from "framer-motion";
import { ListingDisplay } from "@/lib/types";
import { formatUsd, shortenAddress, timeAgo } from "@/lib/utils";
import { ASSET_TYPE_ICONS } from "@/lib/constants";

interface ListingCardProps {
  listing: ListingDisplay;
  onBuy?: (listing: ListingDisplay) => void;
}

export function ListingCard({ listing, onBuy }: ListingCardProps) {
  const priceFormatted = listing.pricePerToken / 1_000_000;
  const totalValueFormatted = listing.totalValue;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="wault-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-wault-primary/10 flex items-center justify-center text-xl">
            {ASSET_TYPE_ICONS[listing.assetType] || "📦"}
          </div>
          <div>
            <h4 className="font-semibold text-white">{listing.assetName}</h4>
            <p className="text-xs text-wault-primary font-mono">${listing.assetSymbol}</p>
          </div>
        </div>
        <span className="wault-badge-active">Active</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-wault-darker rounded-lg p-3">
          <p className="text-xs text-wault-muted">Price / Fraction</p>
          <p className="text-lg font-bold text-white">${priceFormatted}</p>
        </div>
        <div className="bg-wault-darker rounded-lg p-3">
          <p className="text-xs text-wault-muted">Available</p>
          <p className="text-lg font-bold text-white">
            {(listing.amountRemaining / 1_000_000).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-wault-muted mb-4">
        <span>Seller: {shortenAddress(listing.seller)}</span>
        <span>{timeAgo(listing.createdAt)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-wault-muted">Total Value</p>
          <p className="text-sm font-bold text-gradient">
            {formatUsd(totalValueFormatted)}
          </p>
        </div>
        <button
          onClick={() => onBuy?.(listing)}
          className="wault-btn-primary py-2 px-6 text-sm"
        >
          Buy →
        </button>
      </div>
    </motion.div>
  );
}