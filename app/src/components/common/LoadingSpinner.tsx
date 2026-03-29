"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-full border-wault-border animate-spin",
            sizes[size]
          )}
          style={{
            borderTopColor: "#6C5CE7",
            borderRightColor: "#00D2D3",
          }}
        />
        {size === "xl" && (
          <div className="absolute inset-2">
            <div
              className="w-full h-full rounded-full border-2 border-wault-border animate-spin"
              style={{
                borderTopColor: "#00D2D3",
                animationDirection: "reverse",
                animationDuration: "0.8s",
              }}
            />
          </div>
        )}
      </div>
      {text && (
        <p className="text-sm text-wault-muted animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-wault-darker/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Page-level loading
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

// Inline skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-wault-border/30 rounded-lg",
        className
      )}
    />
  );
}