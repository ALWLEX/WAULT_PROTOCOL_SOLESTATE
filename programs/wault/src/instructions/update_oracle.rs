use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::WaultError;
use crate::events::OracleUpdated;

#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(
        seeds = [b"platform"],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub asset: Account<'info, Asset>,

    #[account(
        constraint = oracle_authority.key() == platform.oracle_authority @ WaultError::Unauthorized,
    )]
    pub oracle_authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateOracle>,
    valuation: u64,
    monthly_revenue: u64,
    data_hash: [u8; 32],
) -> Result<()> {
    require!(valuation > 0, WaultError::InvalidOracleData);

    let asset = &mut ctx.accounts.asset;
    let clock = Clock::get()?;

    asset.oracle_valuation = valuation;
    asset.oracle_monthly_revenue = monthly_revenue;
    asset.oracle_last_update = clock.unix_timestamp;
    asset.oracle_data_hash = data_hash;

    emit!(OracleUpdated {
        asset: asset.key(),
        valuation,
        monthly_revenue,
        timestamp: clock.unix_timestamp,
    });

    msg!("Oracle updated: valuation={}, monthly_revenue={}", valuation, monthly_revenue);
    Ok(())
}