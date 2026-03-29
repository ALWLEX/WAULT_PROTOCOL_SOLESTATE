use anchor_lang::prelude::*;
use crate::state::Platform;
use crate::errors::WaultError;
use crate::events::PlatformInitialized;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = Platform::SIZE,
        seeds = [b"platform"],
        bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Treasury wallet to receive platform fees
    pub treasury: UncheckedAccount<'info>,

    /// CHECK: Oracle authority
    pub oracle_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializePlatform>,
    platform_fee_bps: u16,
) -> Result<()> {
    require!(platform_fee_bps <= 10_000, WaultError::InvalidFee);

    let platform = &mut ctx.accounts.platform;
    platform.authority = ctx.accounts.authority.key();
    platform.treasury = ctx.accounts.treasury.key();
    platform.fee_bps = platform_fee_bps;
    platform.total_assets = 0;
    platform.total_volume = 0;
    platform.total_revenue_distributed = 0;
    platform.bump = ctx.bumps.platform;
    platform.oracle_authority = ctx.accounts.oracle_authority.key();

    emit!(PlatformInitialized {
        authority: platform.authority,
        treasury: platform.treasury,
        fee_bps: platform_fee_bps,
    });

    msg!("WAULT Platform initialized! Fee: {} bps", platform_fee_bps);
    Ok(())
}