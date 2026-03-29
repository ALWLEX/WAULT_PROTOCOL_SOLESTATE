use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use crate::state::*;
use crate::errors::WaultError;
use crate::events::AssetCreated;

#[derive(Accounts)]
#[instruction(args: CreateAssetArgs)]
pub struct CreateAsset<'info> {
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(
        init,
        payer = creator,
        space = Asset::SIZE,
        seeds = [b"asset", platform.key().as_ref(), platform.total_assets.to_le_bytes().as_ref()],
        bump,
    )]
    pub asset: Account<'info, Asset>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = asset,
        seeds = [b"fraction_mint", asset.key().as_ref()],
        bump,
    )]
    pub fraction_mint: Account<'info, Mint>,

    /// USDC mint (payment currency)
    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        token::mint = usdc_mint,
        token::authority = asset,
        seeds = [b"payment_vault", asset.key().as_ref()],
        bump,
    )]
    pub payment_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        token::mint = usdc_mint,
        token::authority = asset,
        seeds = [b"revenue_vault", asset.key().as_ref()],
        bump,
    )]
    pub revenue_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<CreateAsset>, args: CreateAssetArgs) -> Result<()> {
    // Validate inputs
    require!(args.name.len() <= 64, WaultError::NameTooLong);
    require!(args.symbol.len() <= 10, WaultError::SymbolTooLong);
    require!(args.uri.len() <= 200, WaultError::UriTooLong);
    require!(args.description.len() <= 256, WaultError::DescriptionTooLong);
    require!(args.location.len() <= 128, WaultError::LocationTooLong);
    require!(args.total_supply > 0, WaultError::ZeroSupply);
    require!(args.price_per_fraction > 0, WaultError::ZeroPrice);
    require!(args.sale_end > args.sale_start, WaultError::InvalidSalePeriod);

    let platform = &mut ctx.accounts.platform;
    let asset = &mut ctx.accounts.asset;
    let clock = Clock::get()?;

    asset.platform = platform.key();
    asset.creator = ctx.accounts.creator.key();
    asset.fraction_mint = ctx.accounts.fraction_mint.key();
    asset.name = args.name.clone();
    asset.symbol = args.symbol.clone();
    asset.uri = args.uri;
    asset.description = args.description;
    asset.asset_type = args.asset_type;
    asset.location = args.location;
    asset.total_valuation = args.total_valuation;
    asset.price_per_fraction = args.price_per_fraction;
    asset.total_supply = args.total_supply;
    asset.fractions_sold = 0;
    asset.status = AssetStatus::PendingVerification;
    asset.is_verified = false;
    asset.verification_hash = [0u8; 32];
    asset.verified_at = 0;
    asset.total_revenue_accumulated = 0;
    asset.revenue_per_token_cumulative = 0;
    asset.last_revenue_distribution = 0;
    asset.oracle_valuation = args.total_valuation;
    asset.oracle_monthly_revenue = 0;
    asset.oracle_last_update = 0;
    asset.oracle_data_hash = [0u8; 32];
    asset.created_at = clock.unix_timestamp;
    asset.sale_start = args.sale_start;
    asset.sale_end = args.sale_end;
    asset.payment_vault = ctx.accounts.payment_vault.key();
    asset.revenue_vault = ctx.accounts.revenue_vault.key();
    asset.bump = ctx.bumps.asset;
    asset.index = platform.total_assets;

    platform.total_assets = platform.total_assets.checked_add(1).ok_or(WaultError::MathOverflow)?;

    emit!(AssetCreated {
        asset: asset.key(),
        creator: asset.creator,
        name: args.name,
        symbol: args.symbol,
        asset_type: asset.asset_type as u8,
        total_valuation: asset.total_valuation,
        total_supply: asset.total_supply,
        price_per_fraction: asset.price_per_fraction,
        index: asset.index,
    });

    msg!("Asset '{}' created with {} fractions", asset.name, asset.total_supply);
    Ok(())
}