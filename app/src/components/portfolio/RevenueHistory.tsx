"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatUsd, formatTimestamp } from "@/lib/utils";

interface RevenueEvent {
  id: string;
  type: "distribution" | "claim";
  assetName: string;
  assetSymbol: string;
  amount: number;
  timestamp: number;
  txHash: string;
}

interface RevenueHistoryProps {
  events: RevenueEvent[];
}

const DEMO_EVENTS: RevenueEvent[] = [
  {
    id: "1",
    type: "claim",
    assetName: "Dubai Marina Tower #1",
    assetSymbol: "WDMT1",
    amount: 425.50,
    timestamp: Date.now() / 1000 - 86400,
    txHash: "5abc...def1",
  },
  {
    id: "2",
    type: "distribution",
    assetName: "Solar Farm Alpha",
    assetSymbol: "WSFA",
    amount: 312.75,
    timestamp: Date.now() / 1000 - 86400 * 3,
    txHash: "6ghi...jkl2",
  },
  {
    id: "3",
    type: "claim",
    assetName: "Dubai Marina Tower #1",
    assetSymbol: "WDMT1",
    amount: 380.00,
    timestamp: Date.now() / 1000 - 86400 * 7,
    txHash: "7mno...pqr3",
  },
  {
    id: "4",
    type: "distribution",
    assetName: "Dubai Marina Tower #1",
    assetSymbol: "WDMT1",
    amount: 8000.00,
    timestamp: Date.now() / 1000 - 86400 * 14,
    txHash: "8stu...vwx4",
  },
  {
    id: "5",
    type: "claim",
    assetName: "Solar Farm Alpha",
    assetSymbol: "WSFA",
    amount: 290.50,
    timestamp: Date.now() / 1000 - 86400 * 21,
    txHash: "9yza...bcd5",
  },
];

export function RevenueHistory({ events = DEMO_EVENTS }: RevenueHistoryProps) {
  return (
    <div className="wault-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Revenue History</h3>
        <span className="text-xs text-wault-muted">
          {events.length} events
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-wault-muted">
            <span className="text-3xl">📭</span>
            <p className="mt-2">No revenue history yet</p>
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-3 px-4 rounded-xl 
                       hover:bg-white/3 transition group"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    event.type === "claim"
                      ? "bg-green-500/10"
                      : "bg-blue-500/10"
                  }`}
                >
                  {event.type === "claim" ? "💰" : "📥"}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-white">
                      {event.type === "claim" ? "Revenue Claimed" : "Revenue Distributed"}
                    </p>
                  </div>
                  <p className="text-xs text-wault-muted">
                    {event.assetName}{" "}
                    <span className="text-wault-primary font-mono">
                      ${event.assetSymbol}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    event.type === "claim"
                      ? "text-green-400"
                      : "text-blue-400"
                  }`}
                >
                  {event.type === "claim" ? "+" : ""}
                  {formatUsd(event.amount)}
                </p>
                <p className="text-xs text-wault-muted">
                  {formatTimestamp(event.timestamp)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}