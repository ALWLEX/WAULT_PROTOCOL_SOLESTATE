use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use crate::state::*;
use crate::errors::WaultError;
use crate::events::FractionsSold;

#[derive(Accounts)]
pub struct BuyListedFractions<'info> {
    #[account(
        seeds = [b"platform"],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub asset: Account<'info, Asset>,

    #[account(
        mut,
        has_one = asset,
        has_one = escrow_token_account,
    )]
    pub listing: Account<'info, Listing>,

    pub fraction_mint: Account<'info, Mint>,

    /// Escrow holding the fractions
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Buyer's fraction account
    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = fraction_mint,
        token::authority = buyer,
    )]
    pub buyer_fraction_account: Account<'info, TokenAccount>,

    /// Buyer's USDC account
    #[account(
        mut,
        constraint = buyer_usdc_account.owner == buyer.key(),
    )]
    pub buyer_usdc_account: Account<'info, TokenAccount>,

    /// Seller's USDC account
    #[account(
        mut,
        constraint = seller_usdc_account.owner == listing.seller,
    )]
    pub seller_usdc_account: Account<'info, TokenAccount>,

    /// Treasury for fees
    #[account(
        mut,
        constraint = treasury_usdc_account.owner == platform.treasury,
    )]
    pub treasury_usdc_account: Account<'info, TokenAccount>,

    /// Buyer's holder account
    #[account(
        init_if_needed,
        payer = buyer,
        space = FractionHolder::SIZE,
        seeds = [b"holder", asset.key().as_ref(), buyer.key().as_ref()],
        bump,
    )]
    pub buyer_holder: Account<'info, FractionHolder>,

    /// Seller's holder account
    #[account(
        mut,
        seeds = [b"holder", asset.key().as_ref(), listing.seller.as_ref()],
        bump = seller_holder.bump,
    )]
    pub seller_holder: Account<'info, FractionHolder>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<BuyListedFractions>, amount: u64) -> Result<()> {
    require!(amount > 0, WaultError::InvalidAmount);

    let listing = &ctx.accounts.listing;
    require!(listing.is_active, WaultError::ListingNotActive);
    require!(listing.amount_remaining >= amount, WaultError::InsufficientListingAmount);

    let platform = &ctx.accounts.platform;
    let asset = &ctx.accounts.asset;

    // Calculate total price
    let total_price = (amount as u128)
        .checked_mul(listing.price_per_token as u128)
        .ok_or(WaultError::MathOverflow)?
        .checked_div(1_000_000) // 6 decimal adjustment
        .ok_or(WaultError::MathOverflow)? as u64;

    // Calculate fee
    let fee = (total_price as u128)
        .checked_mul(platform.fee_bps as u128)
        .ok_or(WaultError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(WaultError::MathOverflow)? as u64;

    let seller_receives = total_price.checked_sub(fee).ok_or(WaultError::MathOverflow)?;

    // Transfer USDC from buyer to seller
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_usdc_account.to_account_info(),
                to: ctx.accounts.seller_usdc_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        seller_receives,
    )?;

    // Transfer fee to treasury
    if fee > 0 {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_usdc_account.to_account_info(),
                    to: ctx.accounts.treasury_usdc_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            fee,
        )?;
    }

    // Transfer fractions from escrow to buyer
    let listing_key = ctx.accounts.listing.key();
    let bump = ctx.accounts.listing.bump;
    let asset_key = listing.asset;
    let seller_key = listing.seller;
    let ts_bytes = listing.created_at.to_le_bytes();
    let seeds = &[
        b"listing",
        asset_key.as_ref(),
        seller_key.as_ref(),
        ts_bytes.as_ref(),
        &[bump],
    ];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.buyer_fraction_account.to_account_info(),
                authority: ctx.accounts.listing.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    // Update listing
    let listing = &mut ctx.accounts.listing;
    listing.amount_remaining = listing.amount_remaining
        .checked_sub(amount)
        .ok_or(WaultError::MathOverflow)?;

    if listing.amount_remaining == 0 {
        listing.is_active = false;
    }

    // Update holder states
    let clock = Clock::get()?;
    let cumulative = asset.revenue_per_token_cumulative;

    // Update seller holder
    let seller_holder = &mut ctx.accounts.seller_holder;
    let seller_pending = calculate_pending(seller_holder.fractions_held, cumulative, seller_holder.revenue_per_token_snapshot)?;
    seller_holder.unclaimed_revenue = seller_holder.unclaimed_revenue
        .checked_add(seller_pending)
        .ok_or(WaultError::MathOverflow)?;
    seller_holder.fractions_held = seller_holder.fractions_held
        .checked_sub(amount)
        .ok_or(WaultError::MathOverflow)?;
    seller_holder.revenue_per_token_snapshot = cumulative;

    // Update buyer holder
    let buyer_holder = &mut ctx.accounts.buyer_holder;
    if buyer_holder.fractions_held == 0 {
        buyer_holder.asset = asset.key();
        buyer_holder.owner = ctx.accounts.buyer.key();
        buyer_holder.first_purchase = clock.unix_timestamp;
        buyer_holder.bump = ctx.bumps.buyer_holder;
    }
    let buyer_pending = calculate_pending(buyer_holder.fractions_held, cumulative, buyer_holder.revenue_per_token_snapshot)?;
    buyer_holder.unclaimed_revenue = buyer_holder.unclaimed_revenue
        .checked_add(buyer_pending)
        .ok_or(WaultError::MathOverflow)?;
    buyer_holder.fractions_held = buyer_holder.fractions_held
        .checked_add(amount)
        .ok_or(WaultError::MathOverflow)?;
    buyer_holder.revenue_per_token_snapshot = cumulative;

    emit!(FractionsSold {
        listing: ctx.accounts.listing.key(),
        buyer: ctx.accounts.buyer.key(),
        amount,
        total_price,
    });

    msg!("Bought {} fractions for {} USDC on marketplace", amount, total_price);
    Ok(())
}

fn calculate_pending(fractions: u64, cumulative: u128, snapshot: u128) -> Result<u64> {
    let diff = cumulative.checked_sub(snapshot).unwrap_or(0);
    let pending = (fractions as u128)
        .checked_mul(diff)
        .ok_or(WaultError::MathOverflow)?
        .checked_div(1_000_000_000_000_000_000)
        .ok_or(WaultError::MathOverflow)? as u64;
    Ok(pending)
}