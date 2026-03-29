"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

const links: SidebarLink[] = [
  { href: "/explore", label: "Explore", icon: "🏘️" },
  { href: "/marketplace", label: "Marketplace", icon: "📊", badge: "New" },
  { href: "/portfolio", label: "Portfolio", icon: "💼" },
  { href: "/create", label: "Create Asset", icon: "➕" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-wault-card border-r border-wault-border",
          "transform transition-transform duration-300 z-50",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 space-y-2">
          <div className="text-xs font-semibold text-wault-muted uppercase tracking-wider mb-4 px-3">
            Navigation
          </div>

          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-wault-primary/20 text-wault-primary border border-wault-primary/30"
                    : "text-wault-muted hover:text-white hover:bg-white/5"
                )}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
                {link.badge && (
                  <span className="ml-auto text-[10px] bg-wault-secondary/20 text-wault-secondary px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-wault-border">
          <div className="wault-card p-3 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs text-wault-muted">Powered by</p>
            <p className="text-sm font-bold text-gradient">Solana</p>
          </div>
        </div>
      </aside>
    </>
  );
}