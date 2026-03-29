"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/common/StatCard";
import { RevenueChart } from "@/components/asset/RevenueChart";

const DEMO_HOLDINGS = [
  {
    asset: "Dubai Marina Tower #1",
    symbol: "WDMT1",
    fractions: 100,
    value: 10000,
    unclaimedRevenue: 425.50,
    totalClaimed: 1275.00,
    apy: 8.5,
  },
  {
    asset: "Solar Farm Alpha",
    symbol: "WSFA",
    fractions: 50,
    value: 10000,
    unclaimedRevenue: 312.75,
    totalClaimed: 938.25,
    apy: 12.0,
  },
];

const REVENUE_DATA = [
  { month: "Jul", revenue: 200, cumulative: 200 },
  { month: "Aug", revenue: 350, cumulative: 550 },
  { month: "Sep", revenue: 280, cumulative: 830 },
  { month: "Oct", revenue: 420, cumulative: 1250 },
  { month: "Nov", revenue: 380, cumulative: 1630 },
  { month: "Dec", revenue: 500, cumulative: 2130 },
];

export default function PortfolioPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl">🔐</span>
        <h2 className="text-2xl font-bold text-white mt-6 mb-4">Connect Your Wallet</h2>
        <p className="text-wault-muted">Connect your wallet to view your portfolio</p>
      </div>
    );
  }

  const totalValue = DEMO_HOLDINGS.reduce((sum, h) => sum + h.value, 0);
  const totalUnclaimed = DEMO_HOLDINGS.reduce((sum, h) => sum + h.unclaimedRevenue, 0);
  const totalClaimed = DEMO_HOLDINGS.reduce((sum, h) => sum + h.totalClaimed, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Your <span className="text-gradient">Portfolio</span>
        </h1>
        <p className="text-wault-muted mb-8">Track your investments and revenue</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Portfolio Value" value={`$${totalValue.toLocaleString()}`} icon="💎" trend="up" trendValue="+5.2%" />
        <StatCard label="Unclaimed Revenue" value={`$${totalUnclaimed.toFixed(2)}`} icon="💰" trend="up" trendValue="Claim Now" />
        <StatCard label="Total Claimed" value={`$${totalClaimed.toFixed(2)}`} icon="✅" />
        <StatCard label="Assets Held" value={DEMO_HOLDINGS.length.toString()} icon="🏢" />
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <RevenueChart data={REVENUE_DATA} />
      </div>

      {/* Holdings Table */}
      <div className="wault-card overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-4">Your Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-wault-border">
                <th className="text-left py-3 px-4 text-sm text-wault-muted font-medium">Asset</th>
                <th className="text-right py-3 px-4 text-sm text-wault-muted font-medium">Fractions</th>
                <th className="text-right py-3 px-4 text-sm text-wault-muted font-medium">Value</th>
                <th className="text-right py-3 px-4 text-sm text-wault-muted font-medium">APY</th>
                <th className="text-right py-3 px-4 text-sm text-wault-muted font-medium">Unclaimed</th>
                <th className="text-right py-3 px-4 text-sm text-wault-muted font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_HOLDINGS.map((holding) => (
                <tr key={holding.symbol} className="border-b border-wault-border/50 hover:bg-white/5 transition">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-semibold">{holding.asset}</p>
                      <p className="text-xs text-wault-primary font-mono">${holding.symbol}</p>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-white font-mono">{holding.fractions}</td>
                  <td className="text-right py-4 px-4 text-white font-semibold">${holding.value.toLocaleString()}</td>
                  <td className="text-right py-4 px-4">
                    <span className="text-green-400 font-semibold">{holding.apy}%</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-wault-accent font-bold">${holding.unclaimedRevenue.toFixed(2)}</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <button className="bg-wault-primary/20 text-wault-primary px-4 py-2 rounded-lg text-sm 
                                     font-semibold hover:bg-wault-primary/30 transition">
                      Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}