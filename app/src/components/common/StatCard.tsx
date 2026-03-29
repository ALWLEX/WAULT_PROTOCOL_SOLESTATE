"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatCard({ label, value, subValue, icon, trend, trendValue }: StatCardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-wault-muted",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="wault-card relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-wault-primary/5 rounded-full 
                    -translate-x-4 -translate-y-4 group-hover:bg-wault-primary/10 transition-colors" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          {trend && trendValue && (
            <span className={`text-xs font-medium ${trendColors[trend]}`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </span>
          )}
        </div>
        <p className="text-wault-muted text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subValue && <p className="text-xs text-wault-muted mt-1">{subValue}</p>}
      </div>
    </motion.div>
  );
}