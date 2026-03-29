use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::WaultError;
use crate::events::RevenueDistributed;

#[derive(Accounts)]
pub struct DistributeRevenue<'info> {
    #[account(
        seeds = [b"platform"],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(
        mut,
        has_one = revenue_vault,
    )]
    pub asset: Account<'info, Asset>,

    /// Revenue vault
    #[account(mut)]
    pub revenue_vault: Account<'info, TokenAccount>,

    /// Source of revenue (e.g., asset creator deposits rental income)
    #[account(
        mut,
        constraint = revenue_source.owner == depositor.key(),
    )]
    pub revenue_source: Account<'info, TokenAccount>,

    /// The depositor (asset creator or authorized party)
    #[account(
        mut,
        constraint = depositor.key() == asset.creator || depositor.key() == platform.authority,
    )]
    pub depositor: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<DistributeRevenue>, total_revenue: u64) -> Result<()> {
    require!(total_revenue > 0, WaultError::InvalidAmount);

    let asset = &ctx.accounts.asset;
    require!(asset.fractions_sold > 0, WaultError::InvalidAmount);

    // Transfer revenue to vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.revenue_source.to_account_info(),
                to: ctx.accounts.revenue_vault.to_account_info(),
                authority: ctx.accounts.depositor.to_account_info(),
            },
        ),
        total_revenue,
    )?;

    // Calculate revenue per token with 1e18 precision
    let revenue_per_token = (total_revenue as u128)
        .checked_mul(1_000_000_000_000_000_000) // 1e18
        .ok_or(WaultError::MathOverflow)?
        .checked_div(asset.fractions_sold as u128)
        .ok_or(WaultError::MathOverflow)?;

    let asset = &mut ctx.accounts.asset;
    let clock = Clock::get()?;

    asset.revenue_per_token_cumulative = asset.revenue_per_token_cumulative
        .checked_add(revenue_per_token)
        .ok_or(WaultError::MathOverflow)?;
    asset.total_revenue_accumulated = asset.total_revenue_accumulated
        .checked_add(total_revenue)
        .ok_or(WaultError::MathOverflow)?;
    asset.last_revenue_distribution = clock.unix_timestamp;

    emit!(RevenueDistributed {
        asset: asset.key(),
        total_revenue,
        revenue_per_token,
        timestamp: clock.unix_timestamp,
    });

    msg!("Distributed {} USDC revenue for asset '{}'", total_revenue, asset.name);
    Ok(())
}