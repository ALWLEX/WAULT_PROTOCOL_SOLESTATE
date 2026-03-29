"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUsd, formatTimestampFull, timeAgo } from "@/lib/utils";

interface AssetVerificationProps {
  isVerified: boolean;
  verificationHash: string;
  verifiedAt: number;
  oracleValuation: number;
  oracleMonthlyRevenue: number;
  oracleLastUpdate: number;
  oracleDataHash: string;
  totalValuation: number;
}

export function AssetVerification({
  isVerified,
  verificationHash,
  verifiedAt,
  oracleValuation,
  oracleMonthlyRevenue,
  oracleLastUpdate,
  oracleDataHash,
  totalValuation,
}: AssetVerificationProps) {
  const valuationChange = totalValuation > 0
    ? ((oracleValuation - totalValuation) / totalValuation) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Verification Status */}
      <div className="wault-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Asset Verification</h3>
          {isVerified ? (
            <span className="wault-badge-verified">
              <span className="mr-1">✓</span> Verified
            </span>
          ) : (
            <span className="wault-badge-pending">
              <span className="mr-1">⏳</span> Pending
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              isVerified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
            }`}>
              {isVerified ? "✓" : "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Document Verification
              </p>
              <p className="text-xs text-wault-muted">
                Title deed, inspection report, and insurance verified on-chain
              </p>
              {isVerified && verifiedAt > 0 && (
                <p className="text-xs text-green-400 mt-1">
                  Verified {formatTimestampFull(verifiedAt)}
                </p>
              )}
            </div>
          </div>

          {isVerified && verificationHash && (
            <div className="bg-wault-darker rounded-xl p-3">
              <p className="text-xs text-wault-muted mb-1">Verification Hash (SHA-256)</p>
              <p className="text-xs font-mono text-wault-primary break-all">
                {verificationHash}
              </p>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm text-blue-400">
              🔗
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                On-Chain Proof
              </p>
              <p className="text-xs text-wault-muted">
                Verification data permanently stored on Solana blockchain
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Oracle Data */}
      <div className="wault-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Oracle Data Feed</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              oracleLastUpdate > Date.now() / 1000 - 86400
                ? "bg-green-400 animate-pulse"
                : "bg-yellow-400"
            }`} />
            <span className="text-xs text-wault-muted">
              Updated {oracleLastUpdate > 0 ? timeAgo(oracleLastUpdate) : "never"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-wault-darker rounded-xl p-4">
            <p className="text-xs text-wault-muted mb-1">Oracle Valuation</p>
            <p className="text-xl font-bold text-white">
              {formatUsd(oracleValuation / 1_000_000)}
            </p>
            <p className={`text-xs mt-1 ${valuationChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {valuationChange >= 0 ? "↑" : "↓"} {Math.abs(valuationChange).toFixed(1)}% from listing
            </p>
          </div>
          <div className="bg-wault-darker rounded-xl p-4">
            <p className="text-xs text-wault-muted mb-1">Monthly Revenue</p>
            <p className="text-xl font-bold text-white">
              {formatUsd(oracleMonthlyRevenue / 1_000_000)}
            </p>
            <p className="text-xs text-green-400 mt-1">
              {formatUsd((oracleMonthlyRevenue * 12) / 1_000_000)}/year
            </p>
          </div>
        </div>

        {oracleDataHash && (
          <div className="bg-wault-darker rounded-xl p-3">
            <p className="text-xs text-wault-muted mb-1">Data Integrity Hash</p>
            <p className="text-xs font-mono text-wault-secondary break-all">
              {oracleDataHash}
            </p>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-4 pt-4 border-t border-wault-border">
          <p className="text-xs text-wault-muted mb-2">Trust Indicators</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Verified Ownership", active: isVerified },
              { label: "Oracle Active", active: oracleLastUpdate > Date.now() / 1000 - 86400 * 7 },
              { label: "Revenue Flowing", active: oracleMonthlyRevenue > 0 },
              { label: "On-Chain Proof", active: true },
            ].map((indicator) => (
              <span
                key={indicator.label}
                className={`text-xs px-3 py-1 rounded-full border ${
                  indicator.active
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : "border-wault-border bg-wault-darker text-wault-muted"
                }`}
              >
                {indicator.active ? "✓" : "○"} {indicator.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}