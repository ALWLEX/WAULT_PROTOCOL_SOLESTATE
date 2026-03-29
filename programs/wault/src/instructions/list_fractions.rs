use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use crate::state::*;
use crate::errors::WaultError;
use crate::events::FractionsListed;

#[derive(Accounts)]
pub struct ListFractions<'info> {
    #[account(
        has_one = fraction_mint,
    )]
    pub asset: Account<'info, Asset>,

    pub fraction_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = seller,
        space = Listing::SIZE,
        seeds = [b"listing", asset.key().as_ref(), seller.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump,
    )]
    pub listing: Account<'info, Listing>,

    /// Seller's fraction token account
    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == asset.fraction_mint,
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// Escrow account to hold listed fractions
    #[account(
        init,
        payer = seller,
        token::mint = fraction_mint,
        token::authority = listing,
        seeds = [b"escrow", listing.key().as_ref()],
        bump,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<ListFractions>, amount: u64, price_per_token: u64) -> Result<()> {
    require!(amount > 0, WaultError::InvalidAmount);
    require!(price_per_token > 0, WaultError::ZeroPrice);

    let clock = Clock::get()?;

    // Transfer fractions to escrow
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        ),
        amount,
    )?;

    let listing = &mut ctx.accounts.listing;
    listing.asset = ctx.accounts.asset.key();
    listing.seller = ctx.accounts.seller.key();
    listing.seller_token_account = ctx.accounts.seller_token_account.key();
    listing.escrow_token_account = ctx.accounts.escrow_token_account.key();
    listing.amount = amount;
    listing.amount_remaining = amount;
    listing.price_per_token = price_per_token;
    listing.is_active = true;
    listing.created_at = clock.unix_timestamp;
    listing.bump = ctx.bumps.listing;
    listing.listing_index = clock.unix_timestamp as u64; // unique enough

    emit!(FractionsListed {
        listing: listing.key(),
        asset: listing.asset,
        seller: listing.seller,
        amount,
        price_per_token,
    });

    msg!("Listed {} fractions at {} USDC each", amount, price_per_token);
    Ok(())
}