"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";

interface FractionPurchaseProps {
  assetName: string;
  assetPublicKey: string;
  pricePerFraction: number;
  availableFractions: number;
  onPurchase: (amount: number) => Promise<string>;
}

export function FractionPurchase({
  assetName,
  assetPublicKey,
  pricePerFraction,
  availableFractions,
  onPurchase,
}: FractionPurchaseProps) {
  const { connected } = useWallet();
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalCost = amount * pricePerFraction / 1_000_000;
  const priceFormatted = pricePerFraction / 1_000_000;

  const handlePurchase = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const hash = await onPurchase(amount);
      setTxHash(hash);
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }, [amount, connected, onPurchase]);

  const presetAmounts = [1, 10, 50, 100];

  return (
    <div className="wault-card">
      <h3 className="text-lg font-bold text-white mb-4">Purchase Fractions</h3>

      {/* Preset Buttons */}
      <div className="flex space-x-2 mb-4">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
              ${amount === preset
                ? "bg-wault-primary text-white"
                : "bg-wault-darker text-wault-muted hover:bg-wault-primary/20"
              }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-4">
        <label className="text-sm text-wault-muted mb-2 block">Custom Amount</label>
        <div className="relative">
          <input
            type="number"
            min={1}
            max={availableFractions}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="wault-input w-full text-lg font-mono"
          />
          <button
            onClick={() => setAmount(availableFractions)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-wault-primary 
                     hover:text-wault-secondary transition"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-wault-darker rounded-xl p-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-wault-muted">Price per fraction</span>
          <span className="text-white font-mono">${priceFormatted}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-wault-muted">Quantity</span>
          <span className="text-white font-mono">×{amount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-wault-muted">Platform fee (2.5%)</span>
          <span className="text-white font-mono">${(totalCost * 0.025).toFixed(2)}</span>
        </div>
        <div className="border-t border-wault-border pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-white font-semibold">Total Cost</span>
            <span className="text-xl font-bold text-gradient">
              ${(totalCost * 1.025).toFixed(2)} USDC
            </span>
          </div>
        </div>
      </div>

      {/* Purchase Button */}
      {connected ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePurchase}
          disabled={loading || amount <= 0}
          className="wault-btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>🔐</span>
              <span>Purchase {amount} Fractions</span>
            </>
          )}
        </motion.button>
      ) : (
        <div className="text-center py-4 text-wault-muted">
          Connect your wallet to purchase fractions
        </div>
      )}

      {/* Success */}
      {txHash && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
          <p className="text-green-400 font-semibold mb-1">✅ Purchase Successful!</p>
          <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-300 hover:underline font-mono break-all"
          >
            {txHash}
          </a>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <p className="text-red-400 text-sm">❌ {error}</p>
        </motion.div>
      )}
    </div>
  );
}