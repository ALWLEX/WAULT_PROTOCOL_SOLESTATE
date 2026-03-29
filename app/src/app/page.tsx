"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatCard } from "@/components/common/StatCard";
import { AssetCard } from "@/components/asset/AssetCard";

// Demo data for showcase
const DEMO_STATS = [
  { label: "Total Value Locked", value: "$12.5M", icon: "🔒", trend: "up" as const, trendValue: "+18.2%" },
  { label: "Assets Tokenized", value: "47", icon: "🏢", trend: "up" as const, trendValue: "+12" },
  { label: "Total Revenue Distributed", value: "$892K", icon: "💰", trend: "up" as const, trendValue: "+$42K" },
  { label: "Active Investors", value: "2,341", icon: "👥", trend: "up" as const, trendValue: "+156" },
];

const DEMO_ASSETS = [
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
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wault-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wault-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-wault-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-wault-primary/10 border border-wault-primary/30 
                        rounded-full px-6 py-2 mb-8"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-wault-primary font-medium">Live on Solana Devnet</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
            >
              <span className="text-white">Own </span>
              <span className="text-gradient">Real Assets</span>
              <br />
              <span className="text-white">As </span>
              <span className="text-gradient">Digital Tokens</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-wault-muted max-w-3xl mx-auto mb-10"
            >
              WAULT tokenizes real-world assets — real estate, energy, bonds — into 
              fractional digital tokens on Solana. Invest from <span className="text-white font-semibold">$100</span>, 
              earn <span className="text-white font-semibold">passive income</span>, trade globally.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link href="/explore">
                <button className="wault-btn-primary text-lg px-12 py-4">
                  🚀 Start Investing
                </button>
              </Link>
              <Link href="/create">
                <button className="wault-btn-secondary text-lg px-12 py-4">
                  ➕ Tokenize Your Asset
                </button>
              </Link>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex items-center justify-center space-x-8 text-wault-muted/50 text-sm"
            >
              <span className="flex items-center space-x-2">
                <span>⚡</span><span>Solana</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>🦀</span><span>Rust / Anchor</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>📊</span><span>Oracle Verified</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>🔐</span><span>Non-Custodial</span>
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEMO_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            How <span className="text-gradient">WAULT</span> Works
          </h2>
          <p className="text-wault-muted max-w-2xl mx-auto">
            Four simple steps from real-world asset to your digital wallet
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "List Asset",
              desc: "Property owner lists their real-world asset with verification documents",
              icon: "📋",
            },
            {
              step: "02",
              title: "Verify & Tokenize",
              desc: "Oracle verifies the asset. Smart contract mints fractional tokens on Solana",
              icon: "✅",
            },
            {
              step: "03",
              title: "Invest & Own",
              desc: "Anyone can buy fractions starting from $100. Ownership recorded on-chain",
              icon: "💎",
            },
            {
              step: "04",
              title: "Earn Revenue",
              desc: "Rental income and dividends automatically distributed to token holders",
              icon: "💰",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="wault-card text-center h-full">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-mono text-wault-primary mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-wault-muted">{item.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 text-wault-primary/30 text-2xl">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Assets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
              Featured <span className="text-gradient">Assets</span>
            </h2>
            <p className="text-wault-muted">Explore tokenized real-world assets</p>
          </div>
          <Link href="/explore">
            <button className="wault-btn-secondary text-sm">
              View All →
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_ASSETS.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <AssetCard {...asset} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Solana */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="wault-card p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-wault-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-wault-secondary/5 rounded-full blur-3xl" />
          
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                Why <span className="text-gradient">Solana</span>?
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Sub-second finality",
                    desc: "Transactions confirm in ~400ms. No waiting for blocks.",
                    icon: "⚡",
                  },
                  {
                    title: "Near-zero fees",
                    desc: "~$0.00025 per transaction. Trade fractions without worrying about gas.",
                    icon: "💸",
                  },
                  {
                    title: "65,000 TPS",
                    desc: "Handle thousands of trades, revenue distributions, and claims simultaneously.",
                    icon: "🚀",
                  },
                  {
                    title: "Rich ecosystem",
                    desc: "SPL tokens, composable DeFi, and a thriving developer community.",
                    icon: "🌐",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start space-x-3">
                    <span className="text-2xl mt-1">{item.icon}</span>
                    <div>
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-sm text-wault-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-8 rounded-3xl glow-primary bg-wault-darker/80">
                <div className="text-6xl mb-4">⚡</div>
                <div className="text-4xl font-black text-gradient mb-2">400ms</div>
                <div className="text-wault-muted">Average Transaction Time</div>
                <div className="mt-4 text-3xl font-black text-white">$0.00025</div>
                <div className="text-wault-muted">Per Transaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Protocol <span className="text-gradient">Architecture</span>
          </h2>
        </div>

        <div className="wault-card p-8 font-mono text-sm">
          <pre className="text-wault-muted overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                        WAULT PROTOCOL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────┐        │
│  │   USER   │───▸│  WAULT APP   │───▸│  SOLANA CHAIN  │        │
│  │ (Wallet) │    │  (Next.js)   │    │  (Programs)    │        │
│  └──────────┘    └──────┬───────┘    └───────┬────────┘        │
│                         │                     │                  │
│                    ┌────▼────┐           ┌────▼────────┐        │
│                    │  IDL /  │           │  WAULT      │        │
│                    │ Anchor  │           │  SMART      │        │
│                    │ Client  │           │  CONTRACTS  │        │
│                    └─────────┘           │             │        │
│                                          │ • Platform  │        │
│  ┌──────────────┐                       │ • Asset     │        │
│  │   ORACLE     │──────────────────────▸│ • Purchase  │        │
│  │  SERVICE     │  (Update valuations)  │ • Revenue   │        │
│  │              │                       │ • Market    │        │
│  │ • Valuation  │                       │ • Oracle    │        │
│  │ • Documents  │                       │ • Verify    │        │
│  │ • Revenue    │                       └─────────────┘        │
│  └──────────────┘                                               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐                          │
│  │    IPFS      │    │  USDC VAULTS │                          │
│  │  (Metadata)  │    │  (Payments/  │                          │
│  │              │    │   Revenue)   │                          │
│  └──────────────┘    └──────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-wault-gradient opacity-10" />
          <div className="absolute inset-0 bg-wault-darker/80" />
          <div className="relative text-center py-20 px-8">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to <span className="text-gradient">W</span>in?
            </h2>
            <p className="text-wault-muted text-lg mb-8 max-w-2xl mx-auto">
              Join the future of asset ownership. Start investing in tokenized 
              real-world assets on Solana today.
            </p>
            <Link href="/explore">
              <button className="wault-btn-primary text-xl px-16 py-5">
                Launch App 🚀
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}