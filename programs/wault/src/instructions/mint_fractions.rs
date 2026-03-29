use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use crate::state::*;
use crate::errors::WaultError;
use crate::events::FractionsMinted;

#[derive(Accounts)]
pub struct MintFractions<'info> {
    #[account(
        mut,
        has_one = creator,
        has_one = fraction_mint,
    )]
    pub asset: Account<'info, Asset>,

    #[account(mut)]
    pub fraction_mint: Account<'info, Mint>,

    /// Token account to receive minted fractions (asset's own vault for primary sale)
    #[account(
        init_if_needed,
        payer = creator,
        token::mint = fraction_mint,
        token::authority = asset,
        seeds = [b"fraction_vault", asset.key().as_ref()],
        bump,
    )]
    pub fraction_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<MintFractions>, amount: u64) -> Result<()> {
    require!(amount > 0, WaultError::InvalidAmount);

    let asset = &ctx.accounts.asset;

    // Check that total minted doesn't exceed supply
    let current_supply = ctx.accounts.fraction_mint.supply;
    require!(
        current_supply.checked_add(amount).ok_or(WaultError::MathOverflow)? <= asset.total_supply,
        WaultError::InsufficientFractions
    );

    // Mint fractions using PDA authority
    let asset_key = asset.key();
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

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.fraction_mint.to_account_info(),
                to: ctx.accounts.fraction_vault.to_account_info(),
                authority: ctx.accounts.asset.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    emit!(FractionsMinted {
        asset: asset_key,
        amount,
    });

    msg!("Minted {} fractions for asset '{}'", amount, asset.name);
    Ok(())
}