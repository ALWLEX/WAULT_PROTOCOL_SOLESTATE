use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Platform {
    /// Authority who manages the platform
    pub authority: Pubkey,
    /// Treasury wallet for platform fees
    pub treasury: Pubkey,
    /// Platform fee in basis points (e.g., 250 = 2.5%)
    pub fee_bps: u16,
    /// Total assets created
    pub total_assets: u64,
    /// Total volume traded (in lamports)
    pub total_volume: u64,
    /// Total revenue distributed
    pub total_revenue_distributed: u64,
    /// Bump seed
    pub bump: u8,
    /// Oracle authority - can update asset data
    pub oracle_authority: Pubkey,
    /// Reserved for future use
    pub _reserved: [u8; 64],
}

impl Platform {
    pub const SIZE: usize = 8 + // discriminator
        32 + // authority
        32 + // treasury
        2 +  // fee_bps
        8 +  // total_assets
        8 +  // total_volume
        8 +  // total_revenue_distributed
        1 +  // bump
        32 + // oracle_authority
        64;  // reserved
}

#[account]
pub struct Asset {
    /// Platform this asset belongs to
    pub platform: Pubkey,
    /// Creator/owner of the real-world asset
    pub creator: Pubkey,
    /// Mint of the fractional tokens
    pub fraction_mint: Pubkey,
    /// Asset metadata
    pub name: String,           // max 64 chars
    pub symbol: String,         // max 10 chars
    pub uri: String,            // max 200 chars - IPFS link to full metadata
    pub description: String,    // max 256 chars
    /// Asset type
    pub asset_type: AssetType,
    /// Location (for real estate)
    pub location: String,       // max 128 chars
    /// Total valuation in USDC (6 decimals)
    pub total_valuation: u64,
    /// Price per fraction in USDC (6 decimals)
    pub price_per_fraction: u64,
    /// Total fractional supply
    pub total_supply: u64,
    /// Fractions sold
    pub fractions_sold: u64,
    /// Status
    pub status: AssetStatus,
    /// Verification
    pub is_verified: bool,
    pub verification_hash: [u8; 32],
    pub verified_at: i64,
    /// Revenue tracking
    pub total_revenue_accumulated: u64,
    pub revenue_per_token_cumulative: u128,  // scaled by 1e18 for precision
    pub last_revenue_distribution: i64,
    /// Oracle data
    pub oracle_valuation: u64,
    pub oracle_monthly_revenue: u64,
    pub oracle_last_update: i64,
    pub oracle_data_hash: [u8; 32],
    /// Timestamps
    pub created_at: i64,
    pub sale_start: i64,
    pub sale_end: i64,
    /// USDC vault for collecting payments
    pub payment_vault: Pubkey,
    /// Revenue vault for distributing income
    pub revenue_vault: Pubkey,
    /// Bump
    pub bump: u8,
    /// Asset index
    pub index: u64,
    /// Reserved
    pub _reserved: [u8; 64],
}

impl Asset {
    pub const SIZE: usize = 8 + // discriminator
        32 + // platform
        32 + // creator
        32 + // fraction_mint
        (4 + 64) +  // name
        (4 + 10) +  // symbol
        (4 + 200) + // uri
        (4 + 256) + // description
        1 +  // asset_type
        (4 + 128) + // location
        8 +  // total_valuation
        8 +  // price_per_fraction
        8 +  // total_supply
        8 +  // fractions_sold
        1 +  // status
        1 +  // is_verified
        32 + // verification_hash
        8 +  // verified_at
        8 +  // total_revenue_accumulated
        16 + // revenue_per_token_cumulative
        8 +  // last_revenue_distribution
        8 +  // oracle_valuation
        8 +  // oracle_monthly_revenue
        8 +  // oracle_last_update
        32 + // oracle_data_hash
        8 +  // created_at
        8 +  // sale_start
        8 +  // sale_end
        32 + // payment_vault
        32 + // revenue_vault
        1 +  // bump
        8 +  // index
        64;  // reserved
}

#[account]
#[derive(Default)]
pub struct FractionHolder {
    /// The asset this holding relates to
    pub asset: Pubkey,
    /// The holder's wallet
    pub owner: Pubkey,
    /// Fractions owned (tracked on-chain for revenue calc)
    pub fractions_held: u64,
    /// Revenue tracking - snapshot of cumulative at last claim
    pub revenue_per_token_snapshot: u128,
    /// Total revenue claimed
    pub total_claimed: u64,
    /// Unclaimed revenue
    pub unclaimed_revenue: u64,
    /// Timestamps
    pub first_purchase: i64,
    pub last_claim: i64,
    /// Bump
    pub bump: u8,
    /// Reserved
    pub _reserved: [u8; 32],
}

impl FractionHolder {
    pub const SIZE: usize = 8 + // discriminator
        32 + // asset
        32 + // owner
        8 +  // fractions_held
        16 + // revenue_per_token_snapshot
        8 +  // total_claimed
        8 +  // unclaimed_revenue
        8 +  // first_purchase
        8 +  // last_claim
        1 +  // bump
        32;  // reserved
}

#[account]
pub struct Listing {
    /// The asset
    pub asset: Pubkey,
    /// Seller
    pub seller: Pubkey,
    /// Seller's token account (fractions held in escrow)
    pub seller_token_account: Pubkey,
    /// Escrow token account holding listed fractions
    pub escrow_token_account: Pubkey,
    /// Amount listed
    pub amount: u64,
    /// Amount remaining
    pub amount_remaining: u64,
    /// Price per token in USDC (6 decimals)
    pub price_per_token: u64,
    /// Active
    pub is_active: bool,
    /// Timestamps
    pub created_at: i64,
    /// Bump
    pub bump: u8,
    /// Listing index
    pub listing_index: u64,
}

impl Listing {
    pub const SIZE: usize = 8 + // discriminator
        32 + // asset
        32 + // seller
        32 + // seller_token_account
        32 + // escrow_token_account
        8 +  // amount
        8 +  // amount_remaining
        8 +  // price_per_token
        1 +  // is_active
        8 +  // created_at
        1 +  // bump
        8;   // listing_index
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AssetType {
    RealEstate,
    Bond,
    Commodity,
    Energy,
    Art,
    Other,
}

impl Default for AssetType {
    fn default() -> Self {
        AssetType::Other
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AssetStatus {
    Draft,
    PendingVerification,
    Active,
    SaleOpen,
    SoldOut,
    Paused,
    Closed,
}

impl Default for AssetStatus {
    fn default() -> Self {
        AssetStatus::Draft
    }
}

/// Arguments for creating an asset
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateAssetArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub description: String,
    pub asset_type: AssetType,
    pub location: String,
    pub total_valuation: u64,
    pub total_supply: u64,
    pub price_per_fraction: u64,
    pub sale_start: i64,
    pub sale_end: i64,
}