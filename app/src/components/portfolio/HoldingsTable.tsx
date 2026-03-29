"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HolderDisplay } from "@/lib/types";
import { formatUsd, formatNumber } from "@/lib/utils";
import { ASSET_TYPE_ICONS } from "@/lib/constants";

interface HoldingsTableProps {
  holdings: HolderDisplay[];
  onClaim: (holding: HolderDisplay) => void;
  onSell: (holding: HolderDisplay) => void;
  claimingAsset?: string; // publicKey of asset being claimed
}

export function HoldingsTable({
  holdings,
  onClaim,
  onSell,
  claimingAsset,
}: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="wault-card text-center py-12">
        <span className="text-5xl">📭</span>
        <h3 className="text-lg font-bold text-white mt-4 mb-2">No Holdings Yet</h3>
        <p className="text-wault-muted mb-6">
          Start investing in tokenized real-world assets
        </p>
        <Link href="/explore">
          <button className="wault-btn-primary">Explore Assets →</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="wault-card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Your Holdings</h3>
        <span className="text-sm text-wault-muted">
          {holdings.length} asset{holdings.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-wault-border">
              <th className="text-left py-3 px-6 text-xs text-wault-muted font-medium uppercase tracking-wider">
                Asset
              </th>
              <th className="text-right py-3 px-4 text-xs text-wault-muted font-medium uppercase tracking-wider">
                Fractions
              </th>
              <th className="text-right py-3 px-4 text-xs text-wault-muted font-medium uppercase tracking-wider">
                Value
              </th>
              <th className="text-right py-3 px-4 text-xs text-wault-muted font-medium uppercase tracking-wider">
                APY
              </th>
              <th className="text-right py-3 px-4 text-xs text-wault-muted font-medium uppercase tracking-wider">
                Unclaimed
              </th>
              <th className="text-right py-3 px-6 text-xs text-wault-muted font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => {
              const isClaiming = claimingAsset === holding.assetPublicKey;
              const icon = ASSET_TYPE_ICONS[holding.assetType] || "📦";

              return (
                <motion.tr
                  key={holding.assetPublicKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-wault-border/30 hover:bg-white/3 transition"
                >
                  <td className="py-4 px-6">
                    <Link
                      href={`/asset/${holding.assetPublicKey}`}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-wault-primary/10 flex items-center justify-center text-lg">
                        {icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold group-hover:text-gradient transition">
                          {holding.assetName}
                        </p>
                        <p className="text-xs text-wault-primary font-mono">
                          ${holding.assetSymbol}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-white font-mono">
                      {formatNumber(holding.fractionsHeld / 1_000_000)}
                    </span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-white font-semibold">
                      {formatUsd(holding.value)}
                    </span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-green-400 font-semibold">
                      {holding.apy}%
                    </span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className={`font-bold ${holding.unclaimedRevenue > 0 ? "text-wault-accent" : "text-wault-muted"}`}>
                      {formatUsd(holding.unclaimedRevenue)}
                    </span>
                  </td>
                  <td className="text-right py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onClaim(holding)}
                        disabled={holding.unclaimedRevenue <= 0 || isClaiming}
                        className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs 
                                 font-semibold hover:bg-green-500/30 transition
                                 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isClaiming ? (
                          <span className="flex items-center space-x-1">
                            <div className="w-3 h-3 border border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                            <span>...</span>
                          </span>
                        ) : (
                          "Claim"
                        )}
                      </button>
                      <button
                        onClick={() => onSell(holding)}
                        className="bg-wault-primary/20 text-wault-primary px-3 py-1.5 rounded-lg text-xs 
                                 font-semibold hover:bg-wault-primary/30 transition"
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}