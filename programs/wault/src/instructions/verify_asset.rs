use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::WaultError;
use crate::events::AssetVerified;

#[derive(Accounts)]
pub struct VerifyAsset<'info> {
    #[account(
        seeds = [b"platform"],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub asset: Account<'info, Asset>,

    #[account(
        constraint = authority.key() == platform.authority @ WaultError::Unauthorized,
    )]
    pub authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<VerifyAsset>,
    verified: bool,
    verification_hash: [u8; 32],
) -> Result<()> {
    let asset = &mut ctx.accounts.asset;
    let clock = Clock::get()?;

    asset.is_verified = verified;
    asset.verification_hash = verification_hash;
    asset.verified_at = clock.unix_timestamp;

    if verified {
        asset.status = AssetStatus::SaleOpen;
    }

    emit!(AssetVerified {
        asset: asset.key(),
        verified,
        verification_hash,
        timestamp: clock.unix_timestamp,
    });

    msg!("Asset '{}' verification status: {}", asset.name, verified);
    Ok(())
}