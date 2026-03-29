# WAULT User Guide

## Getting Started

### 1. Connect Wallet
- Install Phantom, Solflare, or Backpack wallet
- Switch to Solana Devnet
- Connect wallet on wault.app

### 2. Get Devnet USDC
- Use Solana faucet for SOL: `solana airdrop 2`
- Use demo script to get test USDC

### 3. Explore Assets
- Browse tokenized assets at `/explore`
- Filter by asset type (Real Estate, Energy, Bond)
- View asset details, oracle data, and revenue history

### 4. Purchase Fractions
- Select an asset
- Choose number of fractions to buy
- Approve USDC transfer
- Transaction confirms in ~400ms

### 5. Track Portfolio
- View all holdings at `/portfolio`
- Monitor accumulated revenue
- See historical performance

### 6. Claim Revenue
- Revenue is distributed periodically by asset creators
- Click "Claim" on any holding with unclaimed revenue
- USDC transfers to your wallet

### 7. Trade on Marketplace
- **Sell:** List your fractions at desired price
- **Buy:** Browse listings and purchase from others
- Platform fee: 2.5% on all trades

### 8. Create Assets (Asset Owners)
- Navigate to `/create`
- Select asset type
- Fill in details and tokenomics
- Submit for oracle verification
- Once verified, sale goes live

## FAQ

**Q: Are these real assets?**
A: On devnet, we use simulated data. In production, assets would be verified through legal frameworks and oracle services.

**Q: How is revenue calculated?**
A: Revenue is distributed proportionally based on fractions held. The smart contract uses a cumulative tracking system for gas-efficient distribution.

**Q: Can I lose my tokens?**
A: Tokens are stored in your wallet. The protocol uses non-custodial PDAs — no one can take your tokens without your signature.

**Q: What fees are there?**
A: 2.5% platform fee on primary purchases and marketplace trades. No fees for claiming revenue.