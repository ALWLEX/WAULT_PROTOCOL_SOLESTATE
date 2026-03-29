use anchor_lang::prelude::*;

#[event]
pub struct PlatformInitialized {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
}

#[event]
pub struct AssetCreated {
    pub asset: Pubkey,
    pub creator: Pubkey,
    pub name: String,
    pub symbol: String,
    pub asset_type: u8,
    pub total_valuation: u64,
    pub total_supply: u64,
    pub price_per_fraction: u64,
    pub index: u64,
}

#[event]
pub struct FractionsMinted {
    pub asset: Pubkey,
    pub amount: u64,
}

#[event]
pub struct FractionsPurchased {
    pub asset: Pubkey,
    pub buyer: Pubkey,
    pub amount: u64,
    pub total_cost: u64,
}

#[event]
pub struct RevenueDistributed {
    pub asset: Pubkey,
    pub total_revenue: u64,
    pub revenue_per_token: u128,
    pub timestamp: i64,
}

#[event]
pub struct RevenueClaimed {
    pub asset: Pubkey,
    pub holder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct FractionsListed {
    pub listing: Pubkey,
    pub asset: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub price_per_token: u64,
}

#[event]
pub struct FractionsSold {
    pub listing: Pubkey,
    pub buyer: Pubkey,
    pub amount: u64,
    pub total_price: u64,
}

#[event]
pub struct OracleUpdated {
    pub asset: Pubkey,
    pub valuation: u64,
    pub monthly_revenue: u64,
    pub timestamp: i64,
}

#[event]
pub struct AssetVerified {
    pub asset: Pubkey,
    pub verified: bool,
    pub verification_hash: [u8; 32],
    pub timestamp: i64,
}