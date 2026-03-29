"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AssetCardProps {
  id: string;
  name: string;
  symbol: string;
  location: string;
  assetType: string;
  totalValuation: number;
  pricePerFraction: number;
  fractionsSold: number;
  totalSupply: number;
  apy: number;
  isVerified: boolean;
  imageUrl?: string;
}

export function AssetCard({
  id,
  name,
  symbol,
  location,
  assetType,
  totalValuation,
  pricePerFraction,
  fractionsSold,
  totalSupply,
  apy,
  isVerified,
  imageUrl,
}: AssetCardProps) {
  const progress = (fractionsSold / totalSupply) * 100;

  const assetTypeIcons: Record<string, string> = {
    RealEstate: "🏢",
    Bond: "📜",
    Commodity: "⚡",
    Energy: "🔋",
    Art: "🎨",
    Other: "📦",
  };

  return (
    <Link href={`/asset/${id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="wault-card overflow-hidden cursor-pointer group"
      >
        {/* Image / Visual */}
        <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-wault-primary/20 to-wault-secondary/20 
                          flex items-center justify-center">
              <span className="text-6xl">{assetTypeIcons[assetType] || "🏢"}</span>
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-wault-card to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {isVerified && (
              <span className="wault-badge-verified">
                ✓ Verified
              </span>
            )}
            <span className="wault-badge-active">
              {assetTypeIcons[assetType]} {assetType}
            </span>
          </div>

          {/* APY */}
          <div className="absolute top-3 right-3">
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 
                          rounded-lg px-3 py-1">
              <span className="text-green-400 font-bold text-sm">{apy}% APY</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-lg group-hover:text-gradient transition-all">
                {name}
              </h3>
              <p className="text-wault-muted text-sm flex items-center">
                📍 {location}
              </p>
            </div>
            <span className="text-xs font-mono text-wault-primary bg-wault-primary/10 
                           px-2 py-1 rounded-lg">
              ${symbol}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <p className="text-xs text-wault-muted">Total Value</p>
              <p className="text-sm font-semibold text-white">
                ${(totalValuation / 1_000_000).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-wault-muted">Min. Investment</p>
              <p className="text-sm font-semibold text-white">
                ${(pricePerFraction / 1_000_000).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-wault-muted">Funding Progress</span>
              <span className="text-white font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-wault-darker rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-wault-gradient rounded-full"
              />
            </div>
            <p className="text-xs text-wault-muted mt-1">
              {fractionsSold.toLocaleString()} / {totalSupply.toLocaleString()} fractions sold
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}