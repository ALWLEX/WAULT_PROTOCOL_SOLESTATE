use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::WaultError;
use crate::events::FractionsPurchased;

#[derive(Accounts)]
pub struct PurchaseFractions<'info> {
    #[account(
        seeds = [b"platform"],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(
        mut,
        has_one = payment_vault,
        has_one = fraction_mint,
    )]
    pub asset: Account<'info, Asset>,

    pub fraction_mint: Account<'info, anchor_spl::token::Mint>,

    /// Fraction vault holding minted tokens for sale
    #[account(
        mut,
        seeds = [b"fraction_vault", asset.key().as_ref()],
        bump,
    )]
    pub fraction_vault: Account<'info, TokenAccount>,

    /// Payment vault for USDC
    #[account(mut)]
    pub payment_vault: Account<'info, TokenAccount>,

    /// Buyer's USDC token account
    #[account(
        mut,
        constraint = buyer_usdc_account.owner == buyer.key(),
    )]
    pub buyer_usdc_account: Account<'info, TokenAccount>,

    /// Buyer's fraction token account
    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = fraction_mint,
        token::authority = buyer,
    )]
    pub buyer_fraction_account: Account<'info, TokenAccount>,

    /// Fraction holder tracking account
    #[account(
        init_if_needed,
        payer = buyer,
        space = FractionHolder::SIZE,
        seeds = [b"holder", asset.key().as_ref(), buyer.key().as_ref()],
        bump,
    )]
    pub fraction_holder: Account<'info, FractionHolder>,

    /// Platform treasury for fees
    #[account(
        mut,
        constraint = treasury_account.owner == platform.treasury,
    )]
    pub treasury_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<PurchaseFractions>, amount: u64) -> Result<()> {
    require!(amount > 0, WaultError::InvalidAmount);

    let asset = &ctx.accounts.asset;
    let platform = &ctx.accounts.platform;
    let clock = Clock::get()?;

    // Check sale is active
    require!(
        asset.status == AssetStatus::SaleOpen || asset.status == AssetStatus::Active,
        WaultError::AssetNotActive
    );
    require!(clock.unix_timestamp >= asset.sale_start, WaultError::SaleNotStarted);
    require!(clock.unix_timestamp <= asset.sale_end, WaultError::SaleEnded);

    // Check fractions available
    let available = ctx.accounts.fraction_vault.amount;
    require!(available >= amount, WaultError::InsufficientFractions);

    // Calculate cost
    let total_cost = (amount as u128)
        .checked_mul(asset.price_per_fraction as u128)
        .ok_or(WaultError::MathOverflow)?
        .checked_div(1_000_000) // adjust for 6 decimal fractions
        .ok_or(WaultError::MathOverflow)? as u64;

    // Calculate platform fee
    let fee = (total_cost as u128)
        .checked_mul(platform.fee_bps as u128)
        .ok_or(WaultError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(WaultError::MathOverflow)? as u64;

    let payment_after_fee = total_cost.checked_sub(fee).ok_or(WaultError::MathOverflow)?;

    // Transfer USDC from buyer to payment vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_usdc_account.to_account_info(),
                to: ctx.accounts.payment_vault.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        payment_after_fee,
    )?;

    // Transfer fee to treasury
    if fee > 0 {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_usdc_account.to_account_info(),
                    to: ctx.accounts.treasury_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            fee,
        )?;
    }

    // Transfer fractions from vault to buyer (using asset PDA authority)
    let asset_account = &ctx.accounts.asset;
    let platform_key = asset_account.platform;
    let index_bytes = asset_account.index.to_le_bytes();
    let bump = asset_account.bump;
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
                from: ctx.accounts.fraction_vault.to_account_info(),
                to: ctx.accounts.buyer_fraction_account.to_account_info(),
                authority: ctx.accounts.asset.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    // Update asset state
    let asset = &mut ctx.accounts.asset;
    asset.fractions_sold = asset.fractions_sold.checked_add(amount).ok_or(WaultError::MathOverflow)?;

    if asset.fractions_sold >= asset.total_supply {
        asset.status = AssetStatus::SoldOut;
    }

    // Update fraction holder state
    let holder = &mut ctx.accounts.fraction_holder;
    if holder.fractions_held == 0 {
        holder.asset = asset.key();
        holder.owner = ctx.accounts.buyer.key();
        holder.first_purchase = clock.unix_timestamp;
        holder.revenue_per_token_snapshot = asset.revenue_per_token_cumulative;
        holder.bump = ctx.bumps.fraction_holder;
    }

    // Calculate unclaimed revenue before updating holdings
    let pending = calculate_pending_revenue(
        holder.fractions_held,
        asset.revenue_per_token_cumulative,
        holder.revenue_per_token_snapshot,
    )?;
    holder.unclaimed_revenue = holder.unclaimed_revenue
        .checked_add(pending)
        .ok_or(WaultError::MathOverflow)?;

    holder.fractions_held = holder.fractions_held.checked_add(amount).ok_or(WaultError::MathOverflow)?;
    holder.revenue_per_token_snapshot = asset.revenue_per_token_cumulative;

    emit!(FractionsPurchased {
        asset: asset.key(),
        buyer: ctx.accounts.buyer.key(),
        amount,
        total_cost,
    });

    msg!("Purchased {} fractions of '{}' for {} USDC", amount, asset.name, total_cost);
    Ok(())
}

fn calculate_pending_revenue(
    fractions: u64,
    cumulative: u128,
    snapshot: u128,
) -> Result<u64> {
    let diff = cumulative.checked_sub(snapshot).ok_or(WaultError::MathOverflow)?;
    let pending = (fractions as u128)
        .checked_mul(diff)
        .ok_or(WaultError::MathOverflow)?
        .checked_div(1_000_000_000_000_000_000) // 1e18 precision
        .ok_or(WaultError::MathOverflow)? as u64;
    Ok(pending)
}