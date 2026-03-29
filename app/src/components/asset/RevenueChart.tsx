"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    cumulative: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="wault-card">
      <h3 className="text-lg font-bold text-white mb-4">Revenue History</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D2D3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D2D3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3F" />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111128",
                border: "1px solid #1E1E3F",
                borderRadius: "12px",
                color: "#E2E8F0",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6C5CE7"
              fill="url(#revenueGradient)"
              strokeWidth={2}
              name="Monthly Revenue"
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#00D2D3"
              fill="url(#cumulativeGradient)"
              strokeWidth={2}
              name="Cumulative"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}