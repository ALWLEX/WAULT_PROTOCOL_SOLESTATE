use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use instructions::*;

declare_id!("WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod wault {
    use super::*;

    /// Initialize the WAULT platform
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        platform_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_platform::handler(ctx, platform_fee_bps)
    }

    /// Create a new real-world asset listing
    pub fn create_asset(
        ctx: Context<CreateAsset>,
        args: CreateAssetArgs,
    ) -> Result<()> {
        instructions::create_asset::handler(ctx, args)
    }

    /// Mint fractional tokens for an asset
    pub fn mint_fractions(
        ctx: Context<MintFractions>,
        amount: u64,
    ) -> Result<()> {
        instructions::mint_fractions::handler(ctx, amount)
    }

    /// Purchase fractional tokens during primary sale
    pub fn purchase_fractions(
        ctx: Context<PurchaseFractions>,
        amount: u64,
    ) -> Result<()> {
        instructions::purchase_fractions::handler(ctx, amount)
    }

    /// Distribute revenue (rental income, dividends) to fraction holders
    pub fn distribute_revenue(
        ctx: Context<DistributeRevenue>,
        total_revenue: u64,
    ) -> Result<()> {
        instructions::distribute_revenue::handler(ctx, total_revenue)
    }

    /// Claim accumulated revenue
    pub fn claim_revenue(
        ctx: Context<ClaimRevenue>) -> Result<()> {
        instructions::claim_revenue::handler(ctx)
    }

    /// List fractions on secondary marketplace
    pub fn list_fractions(
        ctx: Context<ListFractions>,
        amount: u64,
        price_per_token: u64,
    ) -> Result<()> {
        instructions::list_fractions::handler(ctx, amount, price_per_token)
    }

    /// Buy listed fractions from marketplace
    pub fn buy_listed_fractions(
        ctx: Context<BuyListedFractions>,
        amount: u64,
    ) -> Result<()> {
        instructions::buy_listed_fractions::handler(ctx, amount)
    }

    /// Update oracle data for asset valuation
    pub fn update_oracle(
        ctx: Context<UpdateOracle>,
        valuation: u64,
        monthly_revenue: u64,
        data_hash: [u8; 32],
    ) -> Result<()> {
        instructions::update_oracle::handler(ctx, valuation, monthly_revenue, data_hash)
    }

    /// Verify asset (admin/oracle authority)
    pub fn verify_asset(
        ctx: Context<VerifyAsset>,
        verified: bool,
        verification_hash: [u8; 32],
    ) -> Result<()> {
        instructions::verify_asset::handler(ctx, verified, verification_hash)
    }
}