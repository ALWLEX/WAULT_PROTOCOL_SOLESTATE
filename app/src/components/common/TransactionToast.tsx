"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getExplorerUrl } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

export interface ToastData {
  id: string;
  type: "success" | "error" | "info" | "loading";
  title: string;
  message?: string;
  txHash?: string;
  duration?: number;
}

interface TransactionToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function TransactionToast({ toast, onDismiss }: TransactionToastProps) {
  useEffect(() => {
    if (toast.type !== "loading") {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 6000);

      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    loading: "⏳",
  };

  const borderColors = {
    success: "border-green-500/30",
    error: "border-red-500/30",
    info: "border-blue-500/30",
    loading: "border-yellow-500/30",
  };

  const bgColors = {
    success: "bg-green-500/10",
    error: "bg-red-500/10",
    info: "bg-blue-500/10",
    loading: "bg-yellow-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`max-w-sm w-full ${bgColors[toast.type]} backdrop-blur-xl 
                  border ${borderColors[toast.type]} rounded-xl p-4 shadow-xl`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-xl mt-0.5">
          {toast.type === "loading" ? (
            <div className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          ) : (
            icons[toast.type]
          )}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-wault-muted mt-1">{toast.message}</p>
          )}
          {toast.txHash && (
            <a
              href={getExplorerUrl("tx", toast.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-wault-primary hover:text-wault-secondary 
                       transition font-mono mt-1 inline-block"
            >
              View TX: {shortenAddress(toast.txHash, 8)} ↗
            </a>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-wault-muted hover:text-white transition p-1"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// Toast container manager
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Expose globally
  useEffect(() => {
    (window as any).__waultToast = (toast: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { ...toast, id }]);
    };
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <TransactionToast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper function to show toasts
export function showToast(toast: Omit<ToastData, "id">) {
  if (typeof window !== "undefined" && (window as any).__waultToast) {
    (window as any).__waultToast(toast);
  }
}