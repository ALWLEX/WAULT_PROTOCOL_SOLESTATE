"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { OrderBook } from "@/components/marketplace/OrderBook";
import { StatCard } from "@/components/common/StatCard";
import { ListingDisplay } from "@/lib/types";

const DEMO_LISTINGS: ListingDisplay[] = [
  {
    publicKey: "listing1",
    assetPublicKey: "asset1",
    assetName: "Dubai Marina Tower #1",
    assetSymbol: "WDMT1",
    assetType: "RealEstate",
    seller: "ALW1exKj...4f2a",
    amount: 50_000_000,
    amountRemaining: 50_000_000,
    pricePerToken: 105_000_000,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000) - 3600,
    totalValue: 5250,
  },
  {
    publicKey: "listing2",
    assetPublicKey: "asset1",
    assetName: "Dubai Marina Tower #1",
    assetSymbol: "WDMT1",
    assetType: "RealEstate",
    seller: "B7x3...9k1m",
    amount: 100_000_000,
    amountRemaining: 75_000_000,
    pricePerToken: 102_000_000,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000) - 7200,
    totalValue: 7650,
  },
  {
    publicKey: "listing3",
    assetPublicKey: "asset3",
    assetName: "Solar Farm Alpha",
    assetSymbol: "WSFA",
    assetType: "Energy",
    seller: "C9y2...3p5q",
    amount: 200_000_000,
    amountRemaining: 200_000_000,
    pricePerToken: 210_000_000,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000) - 14400,
    totalValue: 42000,
  },
  {
    publicKey: "listing4",
    assetPublicKey: "asset2",
    assetName: "Manhattan Loft Collection",
    assetSymbol: "WMLC",
    assetType: "RealEstate",
    seller: "D2z5...8r7s",
    amount: 30_000_000,
    amountRemaining: 30_000_000,
    pricePerToken: 520_000_000,
    isActive: true,
    createdAt: Math.floor(Date.now() / 1000) - 28800,
    totalValue: 15600,
  },
];

export default function MarketplacePage() {
  const [view, setView] = useState<"cards" | "orderbook">("cards");
  const [selectedAsset, setSelectedAsset] = useState<string>("all");

  const filteredListings = selectedAsset === "all"
    ? DEMO_LISTINGS
    : DEMO_LISTINGS.filter((l) => l.assetPublicKey === selectedAsset);

  const uniqueAssets = Array.from(
    new Map(DEMO_LISTINGS.map((l) => [l.assetPublicKey, { key: l.assetPublicKey, name: l.assetName, symbol: l.assetSymbol }])).values()
  );

  const totalVolume = DEMO_LISTINGS.reduce((sum, l) => sum + l.totalValue, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Secondary <span className="text-gradient">Marketplace</span>
        </h1>
        <p className="text-wault-muted mb-8">
          Trade tokenized asset fractions peer-to-peer
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Listings" value={DEMO_LISTINGS.length.toString()} icon="📊" />
        <StatCard label="Total Volume" value={`$${(totalVolume).toLocaleString()}`} icon="💰" />
        <StatCard label="Unique Assets" value={uniqueAssets.length.toString()} icon="🏢" />
        <StatCard label="24h Trades" value="47" icon="🔄" trend="up" trendValue="+12" />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Asset Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedAsset("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedAsset === "all"
                ? "bg-wault-primary text-white"
                : "bg-wault-card text-wault-muted hover:bg-wault-primary/20 border border-wault-border"
            }`}
          >
            All Assets
          </button>
          {uniqueAssets.map((asset) => (
            <button
              key={asset.key}
              onClick={() => setSelectedAsset(asset.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedAsset === asset.key
                  ? "bg-wault-primary text-white"
                  : "bg-wault-card text-wault-muted hover:bg-wault-primary/20 border border-wault-border"
              }`}
            >
              ${asset.symbol}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex bg-wault-card rounded-xl border border-wault-border p-1">
          <button
            onClick={() => setView("cards")}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              view === "cards" ? "bg-wault-primary text-white" : "text-wault-muted"
            }`}
          >
            📦 Cards
          </button>
          <button
            onClick={() => setView("orderbook")}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              view === "orderbook" ? "bg-wault-primary text-white" : "text-wault-muted"
            }`}
          >
            📊 Order Book
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing, i) => (
            <motion.div
              key={listing.publicKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ListingCard
                listing={listing}
                onBuy={(l) => console.log("Buy:", l)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {uniqueAssets
            .filter((a) => selectedAsset === "all" || a.key === selectedAsset)
            .map((asset) => (
              <OrderBook
                key={asset.key}
                listings={DEMO_LISTINGS.filter((l) => l.assetPublicKey === asset.key)}
                assetSymbol={asset.symbol}
              />
            ))}
        </div>
      )}

      {filteredListings.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl">📭</span>
          <h3 className="text-lg font-bold text-white mt-4 mb-2">No Active Listings</h3>
          <p className="text-wault-muted">Be the first to list fractions for sale</p>
        </div>
      )}
    </div>
  );
}