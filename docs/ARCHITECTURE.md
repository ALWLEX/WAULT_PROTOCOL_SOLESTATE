# WAULT Protocol Architecture

## System Overview

WAULT is a real-world asset tokenization protocol built on Solana. It enables:
- Fractional ownership of real-world assets via SPL tokens
- Automated revenue distribution to token holders
- Secondary marketplace for trading fractions
- Oracle-based asset verification and valuation

## Architecture Layers

### 1. Smart Contract Layer (Solana / Anchor)
- **Platform Account** — Global config, fees, authority
- **Asset Accounts** — Individual tokenized assets with metadata
- **Fraction Mint** — SPL Token mint for fractional ownership
- **Vaults** — PDA-controlled token accounts for payments and revenue
- **Holder Accounts** — Per-user tracking for revenue distribution
- **Listing Accounts** — Secondary marketplace orders with escrow

### 2. Frontend Layer (Next.js / TypeScript)
- Server-side rendering for SEO
- Wallet integration (Phantom, Solflare, Backpack)
- Real-time on-chain data via Anchor client
- Responsive design with Tailwind CSS

### 3. Oracle Layer (Node.js)
- Property valuation aggregation
- Rental income tracking
- Document verification
- Scheduled on-chain updates via cron

### 4. Storage Layer
- On-chain: ownership, revenue state, verification hashes
- IPFS: asset metadata, documents, images
- Oracle: off-chain data bridges

## Key Design Decisions

### Revenue Distribution (Dividend Model)
Uses cumulative per-token revenue tracking (similar to Compound's reward distribution):
- `revenue_per_token_cumulative` — global counter, scaled by 1e18
- Each holder has a `revenue_per_token_snapshot`
- Pending revenue = `(cumulative - snapshot) * holdings / 1e18`
- This allows O(1) distribution regardless of holder count

### PDA Authority Pattern
All vaults and mints are controlled by PDA (Program Derived Address) authority:
- No admin private keys
- Trustless escrow
- Composable with other Solana programs

### Oracle Integration
Custom oracle service provides:
- Asset valuation updates (simulated; production: Zillow/Redfin APIs)
- Revenue data from property management systems
- Document verification hashes stored on-chain
- Data integrity via SHA-256 hashes

## Data Flow
User → Frontend → Anchor Client → Solana RPC → WAULT Program
↓
SPL Token Operations
PDA Vault Transfers
State Updates
↓
Transaction Confirmed
↓
Frontend Updates UI

## Security Model

1. **Authority checks** — All sensitive operations verify signer
2. **PDA seeds** — Deterministic, collision-resistant account derivation
3. **Overflow protection** — All math uses checked_add/sub/mul
4. **Input validation** — String lengths, amounts, timestamps validated
5. **Escrow pattern** — Marketplace uses escrow for trustless trading
6. **Oracle verification** — Data hashes prevent tampering