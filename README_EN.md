WAULT Protocol
Real-World Asset Tokenization Protocol on Solana.

Overview
WAULT enables tokenization of real-world assets including real estate, energy infrastructure, bonds, and commodities. Assets are represented as fractional SPL tokens on Solana, allowing investors to purchase fractions, earn passive income from asset revenue, and trade fractions on a secondary marketplace.

Architecture
The protocol consists of four main components:

Solana smart contracts (Rust + Anchor)

Next.js frontend application

Oracle service for asset valuation

IPFS for metadata storage

Smart Contracts
Program ID
WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (replace after deployment)

Account Structure
Account	Purpose
Platform	Global protocol state, fee configuration, authority addresses
Asset	Individual asset metadata, tokenomics, revenue tracking
FractionHolder	User holdings and revenue claims per asset
Listing	Secondary marketplace listings
Instructions
Instruction	Description
initialize_platform	Initialize protocol with fee and authorities
create_asset	Register new real-world asset
mint_fractions	Mint fractional tokens for an asset
purchase_fractions	Primary sale purchase
distribute_revenue	Deposit revenue for distribution
claim_revenue	Claim accumulated revenue
list_fractions	Create marketplace listing
buy_listed_fractions	Purchase from marketplace
update_oracle	Update asset valuation data
verify_asset	Verify asset (admin only)
Revenue Distribution Mechanism
The protocol uses cumulative revenue per token tracking. Each asset maintains revenue_per_token_cumulative scaled by 1e18. Fraction holders store a snapshot of this value at their last claim. Pending revenue is calculated as:

text
pending = fractions_held * (cumulative - snapshot) / 1e18
This approach avoids per-holder loops during revenue distribution.

Technical Requirements
Development
Rust 1.70+

Solana CLI 1.18+

Anchor 0.30.1

Node.js 20+

Yarn or npm

Deployment
Solana Devnet or Mainnet with:

USDC mint (6 decimals)

Oracle authority keypair

Treasury wallet

Installation
Clone repository:

text
git clone https://github.com/alwlex/wault.git
cd wault
Install dependencies:

text
npm install
Build smart contracts:

text
anchor build
Run tests:

text
anchor test
Deployment
Deploy to devnet:

text
npm run deploy
Initialize platform:

text
npm run init
Create demo assets:

text
npm run demo
Environment Variables
Frontend (.env.local)
text
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Oracle (.env)
text
RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ORACLE_PRIVATE_KEY=[...]
Directory Structure
text
wault/
├── programs/wault/          # Smart contracts
│   └── src/
│       ├── instructions/    # Instruction handlers
│       ├── state.rs         # Account structures
│       ├── errors.rs        # Error definitions
│       └── events.rs        # Event emissions
├── app/                     # Next.js frontend
│   └── src/
│       ├── app/             # Pages
│       ├── components/      # React components
│       ├── hooks/           # Custom React hooks
│       └── lib/             # Program client
├── oracle/                  # Oracle service
│   └── src/
│       ├── index.ts         # Main oracle loop
│       └── providers/       # Data providers
├── tests/                   # Anchor tests
├── scripts/                 # Deployment scripts
└── docs/                    # Documentation
API Reference
Program Client
Initialize program:

typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "./idl/wault.json";

const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl, programId, provider);
Create asset:

typescript
await program.methods
  .createAsset({
    name: "Asset Name",
    symbol: "SYM",
    uri: "ipfs://...",
    description: "...",
    assetType: { realEstate: {} },
    location: "City, Country",
    totalValuation: new anchor.BN(1_000_000_000_000),
    totalSupply: new anchor.BN(10_000_000_000),
    pricePerFraction: new anchor.BN(100_000_000),
    saleStart: new anchor.BN(now),
    saleEnd: new anchor.BN(now + 86400 * 30),
  })
  .accounts({ ... })
  .rpc();
Purchase fractions:

typescript
await program.methods
  .purchaseFractions(new anchor.BN(amount))
  .accounts({
    platform: platformPda,
    asset: assetPda,
    fractionMint: fractionMintPda,
    fractionVault: fractionVaultPda,
    paymentVault: paymentVaultPda,
    buyerUsdcAccount: buyerUsdcAccount,
    buyerFractionAccount: buyerFractionAccount,
    fractionHolder: holderPda,
    treasuryAccount: treasuryUsdcAccount,
    buyer: wallet.publicKey,
  })
  .signers([wallet.payer])
  .rpc();
Testing
Run full test suite:

text
anchor test
Run specific test:

text
anchor test -- --filter "Purchases fractions"
Security
All accounts use PDA seeds for deterministic addressing

Arithmetic operations use checked math

Admin functions restricted via authority checks

Revenue calculations use 1e18 precision to prevent rounding errors

License
MIT

Contact
Created by ALWLEX





AVE W...