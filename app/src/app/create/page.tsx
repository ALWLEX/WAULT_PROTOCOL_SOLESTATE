"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { CreateAssetFormData } from "@/lib/types";
import { ASSET_TYPE_ICONS } from "@/lib/constants";

const ASSET_TYPES = [
  { key: "realEstate", label: "Real Estate", icon: "🏢", desc: "Properties, apartments, commercial spaces" },
  { key: "energy", label: "Energy", icon: "🔋", desc: "Solar farms, wind turbines, P2P energy" },
  { key: "bond", label: "Bond", icon: "📜", desc: "Government bonds, corporate bonds" },
  { key: "commodity", label: "Commodity", icon: "⚡", desc: "Gold, silver, oil, agricultural" },
  { key: "art", label: "Art", icon: "🎨", desc: "Fine art, collectibles, digital art" },
  { key: "other", label: "Other", icon: "📦", desc: "Any other real-world asset" },
];

export default function CreateAssetPage() {
  const { connected } = useWallet();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateAssetFormData>({
    name: "",
    symbol: "",
    uri: "",
    description: "",
    assetType: "",
    location: "",
    totalValuation: 0,
    totalSupply: 10000,
    pricePerFraction: 0,
    saleDurationDays: 90,
  });

  const updateField = (field: keyof CreateAssetFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate price per fraction
      if ((field === "totalValuation" || field === "totalSupply") && updated.totalSupply > 0) {
        updated.pricePerFraction = Math.round(updated.totalValuation / updated.totalSupply);
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      // In production: call createAsset from program.ts
      await new Promise((r) => setTimeout(r, 3000));
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl">🔐</span>
        <h2 className="text-2xl font-bold text-white mt-6 mb-4">Connect Your Wallet</h2>
        <p className="text-wault-muted">Connect your wallet to create a tokenized asset</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <span className="text-8xl">🎉</span>
        </motion.div>
        <h2 className="text-3xl font-black text-white mt-6 mb-4">Asset Created!</h2>
        <p className="text-wault-muted mb-8">
          Your asset "<span className="text-white font-semibold">{formData.name}</span>" has been 
          submitted for verification. Once verified by our oracle, it will be live for investment.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/explore">
            <button className="wault-btn-primary">View Assets</button>
          </a>
          <button onClick={() => { setSuccess(false); setStep(1); setFormData({ name: "", symbol: "", uri: "", description: "", assetType: "", location: "", totalValuation: 0, totalSupply: 10000, pricePerFraction: 0, saleDurationDays: 90 }); }} className="wault-btn-secondary">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Create <span className="text-gradient">Asset</span>
        </h1>
        <p className="text-wault-muted mb-8">Tokenize a real-world asset on Solana</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {["Asset Type", "Details", "Tokenomics", "Review"].map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step > i + 1 ? "bg-green-500 text-white" :
              step === i + 1 ? "bg-wault-primary text-white" :
              "bg-wault-card text-wault-muted border border-wault-border"
            }`}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`ml-2 text-sm hidden sm:block ${step === i + 1 ? "text-white font-semibold" : "text-wault-muted"}`}>
              {label}
            </span>
            {i < 3 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > i + 1 ? "bg-green-500" : "bg-wault-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Asset Type */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Select Asset Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ASSET_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => { updateField("assetType", type.key); setStep(2); }}
                className={`wault-card text-left transition-all hover:border-wault-primary/50 ${
                  formData.assetType === type.key ? "border-wault-primary bg-wault-primary/5" : ""
                }`}
              >
                <span className="text-3xl">{type.icon}</span>
                <h3 className="text-white font-semibold mt-2">{type.label}</h3>
                <p className="text-xs text-wault-muted mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Asset Details</h2>
          <div>
            <label className="text-sm text-wault-muted mb-1 block">Asset Name *</label>
            <input type="text" value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g., Dubai Marina Tower #1" className="wault-input w-full" maxLength={64} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-wault-muted mb-1 block">Symbol *</label>
              <input type="text" value={formData.symbol} onChange={(e) => updateField("symbol", e.target.value.toUpperCase())} placeholder="e.g., WDMT1" className="wault-input w-full" maxLength={10} />
            </div>
            <div>
              <label className="text-sm text-wault-muted mb-1 block">Location *</label>
              <input type="text" value={formData.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g., Dubai, UAE" className="wault-input w-full" maxLength={128} />
            </div>
          </div>
          <div>
            <label className="text-sm text-wault-muted mb-1 block">Description *</label>
            <textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe the asset, its income potential, and any relevant details..." className="wault-input w-full h-32 resize-none" maxLength={256} />
            <p className="text-xs text-wault-muted mt-1">{formData.description.length}/256</p>
          </div>
          <div>
            <label className="text-sm text-wault-muted mb-1 block">Metadata URI (IPFS)</label>
            <input type="text" value={formData.uri} onChange={(e) => updateField("uri", e.target.value)} placeholder="ipfs://... or https://..." className="wault-input w-full" />
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="wault-btn-secondary">← Back</button>
            <button onClick={() => setStep(3)} disabled={!formData.name || !formData.symbol} className="wault-btn-primary">Next →</button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Tokenomics */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Tokenomics</h2>
          <div>
            <label className="text-sm text-wault-muted mb-1 block">Total Valuation (USD) *</label>
            <input type="number" value={formData.totalValuation || ""} onChange={(e) => updateField("totalValuation", parseInt(e.target.value) || 0)} placeholder="1000000" className="wault-input w-full" min={1000} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-wault-muted mb-1 block">Total Fractions *</label>
              <input type="number" value={formData.totalSupply} onChange={(e) => updateField("totalSupply", parseInt(e.target.value) || 0)} className="wault-input w-full" min={1} />
            </div>
            <div>
              <label className="text-sm text-wault-muted mb-1 block">Price per Fraction (auto)</label>
              <div className="wault-input w-full bg-wault-darker/80 flex items-center">
                <span className="text-wault-primary font-mono">
                  ${formData.pricePerFraction > 0 ? formData.pricePerFraction.toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-wault-muted mb-1 block">Sale Duration (days)</label>
            <input type="number" value={formData.saleDurationDays} onChange={(e) => updateField("saleDurationDays", parseInt(e.target.value) || 30)} className="wault-input w-full" min={1} max={365} />
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(2)} className="wault-btn-secondary">← Back</button>
            <button onClick={() => setStep(4)} disabled={!formData.totalValuation} className="wault-btn-primary">Next →</button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Review & Create</h2>
          <div className="wault-card">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Asset Type", ASSET_TYPES.find((t) => t.key === formData.assetType)?.label || formData.assetType],
                ["Name", formData.name],
                ["Symbol", `$${formData.symbol}`],
                ["Location", formData.location],
                ["Valuation", `$${formData.totalValuation.toLocaleString()}`],
                ["Total Fractions", formData.totalSupply.toLocaleString()],
                ["Price/Fraction", `$${formData.pricePerFraction.toLocaleString()}`],
                ["Sale Duration", `${formData.saleDurationDays} days`],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <span className="text-wault-muted">{label}</span>
                  <p className="text-white font-semibold">{value}</p>
                </div>
              ))}
            </div>
            {formData.description && (
              <div className="mt-4 pt-4 border-t border-wault-border">
                <span className="text-xs text-wault-muted">Description</span>
                <p className="text-sm text-white mt-1">{formData.description}</p>
              </div>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Important</p>
            <p className="text-xs text-yellow-300/70">
              After creation, the asset will be in "Pending Verification" status.
              Our oracle service will verify the associated documents before the sale goes live.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(3)} className="wault-btn-secondary">← Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="wault-btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating on Solana...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Create Asset on Solana</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}