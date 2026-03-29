"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-wault-border/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-wault-gradient flex items-center justify-center">
                <span className="text-white font-black text-xl">W</span>
              </div>
              <span className="text-2xl font-black text-gradient">WAULT</span>
            </div>
            <p className="text-wault-muted text-sm max-w-md">
              Democratizing access to real-world assets through blockchain tokenization.
              Built on Solana for speed, transparency, and global accessibility.
            </p>
            <p className="text-wault-muted/50 text-xs mt-4">
              Created by <span className="text-wault-primary font-semibold">ALWLEX</span> — W wins always 🏆
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Protocol</h4>
            <ul className="space-y-2 text-sm text-wault-muted">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Smart Contracts</a></li>
              <li><a href="#" className="hover:text-white transition">GitHub</a></li>
              <li><a href="#" className="hover:text-white transition">Audit Reports</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-wault-muted">
              <li><a href="#" className="hover:text-white transition">Twitter / X</a></li>
              <li><a href="#" className="hover:text-white transition">Discord</a></li>
              <li><a href="#" className="hover:text-white transition">Telegram</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-wault-border/30 mt-8 pt-8 text-center text-xs text-wault-muted/50">
          © 2025 WAULT Protocol. Built on Solana. All rights reserved.
        </div>
      </div>
    </footer>
  );
}