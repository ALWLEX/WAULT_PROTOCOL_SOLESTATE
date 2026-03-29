import type { Metadata } from "next";
import "./globals.css";
import { WalletProviderWrapper } from "@/components/providers/WalletProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "WAULT - Real-World Asset Tokenization on Solana",
  description:
    "Tokenize real-world assets, own fractions of properties, earn passive income. Built on Solana by ALWLEX.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-wault-darker">
        <WalletProviderWrapper>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}