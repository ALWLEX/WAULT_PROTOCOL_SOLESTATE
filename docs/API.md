# WAULT Protocol API Reference

## Smart Contract Instructions

### `initialize_platform`
Initialize the WAULT platform.

**Parameters:**
- `platform_fee_bps: u16` — Platform fee in basis points (max 10,000)

**Accounts:**
- `platform` — Platform PDA (init)
- `authority` — Platform admin (signer, payer)
- `treasury` — Fee recipient wallet
- `oracle_authority` — Oracle signer

---

### `create_asset`
Create a new tokenized real-world asset.

**Parameters:**
- `args: CreateAssetArgs`
  - `name: String` (max 64 chars)
  - `symbol: String` (max 10 chars)
  - `uri: String` (max 200 chars)
  - `description: String` (max 256 chars)
  - `asset_type: AssetType`
  - `location: String` (max 128 chars)
  - `total_valuation: u64`
  - `total_supply: u64`
  - `price_per_fraction: u64`
  - `sale_start: i64`
  - `sale_end: i64`

---

### `verify_asset`
Verify an asset (admin only).

**Parameters:**
- `verified: bool`
- `verification_hash: [u8; 32]`

---

### `mint_fractions`
Mint fractional SPL tokens.

**Parameters:**
- `amount: u64`

---

### `purchase_fractions`
Buy fractions during primary sale.

**Parameters:**
- `amount: u64`

---

### `distribute_revenue`
Deposit revenue for holders.

**Parameters:**
- `total_revenue: u64`

---

### `claim_revenue`
Claim accumulated revenue.

**Parameters:** None

---

### `list_fractions`
List fractions on secondary marketplace.

**Parameters:**
- `amount: u64`
- `price_per_token: u64`

---

### `buy_listed_fractions`
Buy from marketplace listing.

**Parameters:**
- `amount: u64`

---

### `update_oracle`
Update oracle data (oracle authority only).

**Parameters:**
- `valuation: u64`
- `monthly_revenue: u64`
- `data_hash: [u8; 32]`

## Account Structures

See `programs/wault/src/state.rs` for complete account definitions.

## Error Codes

See `programs/wault/src/errors.rs` for all custom errors.