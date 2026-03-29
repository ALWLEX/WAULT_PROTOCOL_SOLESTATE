"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/explore", label: "Explore", icon: "🏘️" },
    { href: "/marketplace", label: "Marketplace", icon: "📊" },
    { href: "/portfolio", label: "Portfolio", icon: "💼" },
    { href: "/create", label: "Create Asset", icon: "➕" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-wault-gradient flex items-center justify-center 
                            transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white font-black text-xl">W</span>
              </div>
              <div className="absolute -inset-1 bg-wault-gradient rounded-xl opacity-0 
                            group-hover:opacity-30 blur-md transition-opacity duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gradient tracking-tight">WAULT</h1>
              <p className="text-[10px] text-wault-muted -mt-1 tracking-wider">RWA PROTOCOL</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-wault-muted hover:text-white
                         rounded-lg hover:bg-white/5 transition-all duration-200
                         flex items-center space-x-2"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Wallet + Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {connected && (
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Connected</span>
              </div>
            )}
            <WalletMultiButton className="!bg-wault-gradient !rounded-xl !font-semibold !text-sm !py-2 !px-4" />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-wault-muted hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-t border-white/5"
          >
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-wault-muted hover:text-white
                           rounded-lg hover:bg-white/5 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}