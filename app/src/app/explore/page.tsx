"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AssetCard } from "@/components/asset/AssetCard";

const ASSETS = [
  {
    id: "1",
    name: "Dubai Marina Tower #1",
    symbol: "WDMT1",
    location: "Dubai Marina, UAE",
    assetType: "RealEstate",
    totalValuation: 1_000_000_000_000,
    pricePerFraction: 100_000_000,
    fractionsSold: 7500,
    totalSupply: 10000,
    apy: 8.5,
    isVerified: true,
  },
  {
    id: "2",
    name: "Manhattan Loft Collection",
    symbol: "WMLC",
    location: "New York, USA",
    assetType: "RealEstate",
    totalValuation: 5_000_000_000_000,
    pricePerFraction: 500_000_000,
    fractionsSold: 3200,
    totalSupply: 10000,
    apy: 6.2,
    isVerified: true,
  },
  {
    id: "3",
    name: "Solar Farm Alpha",
    symbol: "WSFA",
    location: "Nevada, USA",
    assetType: "Energy",
    totalValuation: 2_000_000_000_000,
    pricePerFraction: 200_000_000,
    fractionsSold: 9100,
    totalSupply: 10000,
    apy: 12.0,
    isVerified: true,
  },
  {
    id: "4",
    name: "London Commercial Hub",
    symbol: "WLCH",
    location: "London, UK",
    assetType: "RealEstate",
    totalValuation: 3_000_000_000_000,
    pricePerFraction: 300_000_000,
    fractionsSold: 5600,
    totalSupply: 10000,
    apy: 7.1,
    isVerified: true,
  },
  {
    id: "5",
    name: "US Treasury Bond Pool",
    symbol: "WUSTB",
    location: "United States",
    assetType: "Bond",
    totalValuation: 10_000_000_000_000,
    pricePerFraction: 1_000_000_000,
    fractionsSold: 8200,
    totalSupply: 10000,
    apy: 4.8,
    isVerified: true,
  },
  {
    id: "6",
    name: "Tokyo Residential Complex",
    symbol: "WTRC",
    location: "Tokyo, Japan",
    assetType: "RealEstate",
    totalValuation: 2_500_000_000_000,
    pricePerFraction: 250_000_000,
    fractionsSold: 1200,
    totalSupply: 10000,
    apy: 5.5,
    isVerified: false,
  },
];

const ASSET_TYPES = ["All", "RealEstate", "Energy", "Bond", "Commodity", "Art"];

export default function ExplorePage() {
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState<"apy" | "valuation" | "progress">("apy");

  const filteredAssets = ASSETS
    .filter((a) => selectedType === "All" || a.assetType === selectedType)
    .sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy;
        case "valuation":
          return b.totalValuation - a.totalValuation;
        case "progress":
          return (b.fractionsSold / b.totalSupply) - (a.fractionsSold / a.totalSupply);
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Explore <span className="text-gradient">Assets</span>
        </h1>
        <p className="text-wault-muted">Discover and invest in tokenized real-world assets</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          {ASSET_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedType === type
                  ? "bg-wault-primary text-white"
                  : "bg-wault-card text-wault-muted hover:bg-wault-primary/20 border border-wault-border"
              }`}
            >
              {type === "All" ? "🌐 All" : type}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-wault-muted">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="wault-input text-sm py-2"
          >
            <option value="apy">Highest APY</option>
            <option value="valuation">Highest Value</option>
            <option value="progress">Most Funded</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <AssetCard {...asset} />
          </motion.div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-20">
          <span className="text-4xl">🔍</span>
          <p className="text-wault-muted mt-4">No assets found for this filter</p>
        </div>
      )}
    </div>
  );
}