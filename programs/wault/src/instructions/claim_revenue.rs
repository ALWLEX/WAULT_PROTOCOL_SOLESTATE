use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::WaultError;
use crate::events::RevenueClaimed;

#[derive(Accounts)]
pub struct ClaimRevenue<'info> {
    #[account(
        has_one = revenue_vault,
    )]
    pub asset: Account<'info, Asset>,

    #[account(
        mut,
        seeds = [b"holder", asset.key().as_ref(), holder_authority.key().as_ref()],
        bump = fraction_holder.bump,
        has_one = owner,
    )]
    pub fraction_holder: Account<'info, FractionHolder>,

    /// Revenue vault
    #[account(mut)]
    pub revenue_vault: Account<'info, TokenAccount>,

    /// Holder's USDC account to receive revenue
    #[account(
        mut,
        constraint = holder_usdc_account.owner == holder_authority.key(),
    )]
    pub holder_usdc_account: Account<'info, TokenAccount>,

    /// The owner field from fraction_holder
    /// CHECK: Validated via constraint
    pub owner: UncheckedAccount<'info>,

    #[account(
        constraint = holder_authority.key() == fraction_holder.owner,
    )]
    pub holder_authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimRevenue>) -> Result<()> {
    let asset = &ctx.accounts.asset;
    let holder = &mut ctx.accounts.fraction_holder;

    // Calculate pending revenue
    let diff = asset.revenue_per_token_cumulative
        .checked_sub(holder.revenue_per_token_snapshot)
        .ok_or(WaultError::MathOverflow)?;

    let new_revenue = (holder.fractions_held as u128)
        .checked_mul(diff)
        .ok_or(WaultError::MathOverflow)?
        .checked_div(1_000_000_000_000_000_000)
        .ok_or(WaultError::MathOverflow)? as u64;

    let total_claimable = holder.unclaimed_revenue
        .checked_add(new_revenue)
        .ok_or(WaultError::MathOverflow)?;

    require!(total_claimable > 0, WaultError::NoRevenueToClaim);

    // Transfer from revenue vault using asset PDA
    let platform_key = asset.platform;
    let index_bytes = asset.index.to_le_bytes();
    let bump = asset.bump;
    let seeds = &[
        b"asset",
        platform_key.as_ref(),
        index_bytes.as_ref(),
        &[bump],
    ];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.revenue_vault.to_account_info(),
                to: ctx.accounts.holder_usdc_account.to_account_info(),
                authority: ctx.accounts.asset.to_account_info(),
            },
            signer_seeds,
        ),
        total_claimable,
    )?;

    let clock = Clock::get()?;

    // Update holder state
    holder.revenue_per_token_snapshot = asset.revenue_per_token_cumulative;
    holder.unclaimed_revenue = 0;
    holder.total_claimed = holder.total_claimed
        .checked_add(total_claimable)
        .ok_or(WaultError::MathOverflow)?;
    holder.last_claim = clock.unix_timestamp;

    emit!(RevenueClaimed {
        asset: asset.key(),
        holder: holder.owner,
        amount: total_claimable,
    });

    msg!("Claimed {} USDC revenue", total_claimable);
    Ok(())
}