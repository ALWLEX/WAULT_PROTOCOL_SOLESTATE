"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { StatCard } from "@/components/common/StatCard";
import { FractionPurchase } from "@/components/asset/FractionPurchase";
import { RevenueChart } from "@/components/asset/RevenueChart";
import { AssetVerification } from "@/components/oracle/AssetVerification";
import { OrderBook } from "@/components/marketplace/OrderBook";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { formatUsd, formatNumber, formatTimestamp, shortenAddress, calculateProgress } from "@/lib/utils";
import { ASSET_TYPE_ICONS, getExplorerUrl } from "@/lib/constants";
import { pricingService } from "@/services/pricing.service";
import { RevenueDataPoint } from "@/lib/types";

// Demo asset data — in production, fetched from chain
const DEMO_ASSET = {
  publicKey: "7xKX...demo",
  name: "WAULT Dubai Marina Tower #1",
  symbol: "WDMT1",
  description:
    "Luxury 3BR apartment in Dubai Marina with stunning sea views. The property generates consistent rental income with an average occupancy rate of 92%. Professionally managed by a top-tier property management company. All legal documents verified on-chain.",
  assetType: "RealEstate",
  location: "Dubai Marina, Building 7, Unit 2301, UAE",
  totalValuation: 1_000_000_000_000,
  pricePerFraction: 100_000_000,
  fractionsSold: 7500_000_000,
  totalSupply: 10_000_000_000,
  apy: 8.5,
  isVerified: true,
  status: "saleOpen",
  oracleValuation: 1_050_000_000_000,
  oracleMonthlyRevenue: 8_000_000_000,
  totalRevenueAccumulated: 48_000_000_000,
  createdAt: Math.floor(Date.now() / 1000) - 86400 * 180,
  saleStart: Math.floor(Date.now() / 1000) - 86400 * 90,
  saleEnd: Math.floor(Date.now() / 1000) + 86400 * 90,
  creator: "ALW1...ex",
  verificationHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  verifiedAt: Math.floor(Date.now() / 1000) - 86400 * 85,
  oracleLastUpdate: Math.floor(Date.now() / 1000) - 3600 * 2,
  oracleDataHash: "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5",
};

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "oracle">("overview");
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const asset = DEMO_ASSET; // In production: useAsset(assetId)

  useEffect(() => {
    async function loadData() {
      const data = await pricingService.getRevenueHistory(assetId);
      setRevenueData(data);
      setLoading(false);
    }
    loadData();
  }, [assetId]);

  if (loading) return <PageLoading text="Loading asset details..." />;

  const progress = calculateProgress(
    asset.fractionsSold / 1_000_000,
    asset.totalSupply / 1_000_000
  );
  const availableFractions = (asset.totalSupply - asset.fractionsSold) / 1_000_000;
  const icon = ASSET_TYPE_ICONS[asset.assetType] || "📦";

  const handlePurchase = async (amount: number): Promise<string> => {
    // In production: call purchaseFractions from program.ts
    await new Promise((r) => setTimeout(r, 2000));
    return "SimulatedTransactionHash123456789abcdef";
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "📋" },
    { key: "market", label: "Marketplace", icon: "📊" },
    { key: "oracle", label: "Verification", icon: "🔮" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-wault-muted mb-4">
          <a href="/explore" className="hover:text-white transition">Explore</a>
          <span>/</span>
          <span className="text-white">{asset.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-wault-primary/10 flex items-center justify-center text-3xl">
                {icon}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl md:text-3xl font-black text-white">{asset.name}</h1>
                  {asset.isVerified && <span className="wault-badge-verified">✓ Verified</span>}
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-wault-primary font-mono">${asset.symbol}</span>
                  <span className="text-sm text-wault-muted">📍 {asset.location}</span>
                </div>
              </div>
            </div>
            <p className="text-wault-muted leading-relaxed max-w-2xl">{asset.description}</p>
          </div>

          <div className="flex-shrink-0 grid grid-cols-2 gap-3 lg:w-80">
            <div className="bg-wault-card border border-wault-border rounded-xl p-3 text-center">
              <p className="text-xs text-wault-muted">Valuation</p>
              <p className="text-lg font-bold text-white">
                {formatUsd(asset.oracleValuation / 1_000_000)}
              </p>
            </div>
            <div className="bg-wault-card border border-wault-border rounded-xl p-3 text-center">
              <p className="text-xs text-wault-muted">APY</p>
              <p className="text-lg font-bold text-green-400">{asset.apy}%</p>
            </div>
            <div className="bg-wault-card border border-wault-border rounded-xl p-3 text-center">
              <p className="text-xs text-wault-muted">Min. Investment</p>
              <p className="text-lg font-bold text-white">
                ${asset.pricePerFraction / 1_000_000}
              </p>
            </div>
            <div className="bg-wault-card border border-wault-border rounded-xl p-3 text-center">
              <p className="text-xs text-wault-muted">Investors</p>
              <p className="text-lg font-bold text-white">
                {formatNumber(Math.round(asset.fractionsSold / 1_000_000 / 10))}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-wault-muted">Funding Progress</span>
            <span className="text-white font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-wault-darker rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-wault-gradient rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-wault-muted mt-1">
            <span>{formatNumber(asset.fractionsSold / 1_000_000)} fractions sold</span>
            <span>{formatNumber(availableFractions)} available</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-wault-card rounded-xl p-1 border border-wault-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
              activeTab === tab.key
                ? "bg-wault-primary text-white"
                : "text-wault-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={formatUsd(asset.totalRevenueAccumulated / 1_000_000)} icon="💰" />
                <StatCard label="Monthly Income" value={formatUsd(asset.oracleMonthlyRevenue / 1_000_000)} icon="📈" />
                <StatCard label="Created" value={formatTimestamp(asset.createdAt)} icon="📅" />
                <StatCard label="Sale Ends" value={formatTimestamp(asset.saleEnd)} icon="⏰" />
              </div>
              <RevenueChart data={revenueData} />
            </>
          )}

          {activeTab === "market" && (
            <OrderBook
              listings={[]}
              assetSymbol={asset.symbol}
            />
          )}

          {activeTab === "oracle" && (
            <AssetVerification
              isVerified={asset.isVerified}
              verificationHash={asset.verificationHash}
              verifiedAt={asset.verifiedAt}
              oracleValuation={asset.oracleValuation}
              oracleMonthlyRevenue={asset.oracleMonthlyRevenue}
              oracleLastUpdate={asset.oracleLastUpdate}
              oracleDataHash={asset.oracleDataHash}
              totalValuation={asset.totalValuation}
            />
          )}
        </div>

        {/* Sidebar — Purchase */}
        <div className="space-y-6">
          <FractionPurchase
            assetName={asset.name}
            assetPublicKey={asset.publicKey}
            pricePerFraction={asset.pricePerFraction}
            availableFractions={availableFractions}
            onPurchase={handlePurchase}
          />

          {/* Asset Info */}
          <div className="wault-card">
            <h4 className="text-sm font-bold text-white mb-3">Asset Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-wault-muted">Type</span>
                <span className="text-white">{icon} {asset.assetType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wault-muted">Creator</span>
                <span className="text-wault-primary font-mono text-xs">{asset.creator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wault-muted">Fraction Decimals</span>
                <span className="text-white">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wault-muted">Status</span>
                <span className="wault-badge-active text-xs">{asset.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}