use anchor_lang::prelude::*;

#[error_code]
pub enum WaultError {
    #[msg("Unauthorized: You don't have permission to perform this action")]
    Unauthorized,

    #[msg("Asset is not in active/sale state")]
    AssetNotActive,

    #[msg("Sale has not started yet")]
    SaleNotStarted,

    #[msg("Sale has ended")]
    SaleEnded,

    #[msg("Insufficient fractions available")]
    InsufficientFractions,

    #[msg("Insufficient funds")]
    InsufficientFunds,

    #[msg("Asset is not verified")]
    AssetNotVerified,

    #[msg("No revenue to claim")]
    NoRevenueToClaim,

    #[msg("Listing is not active")]
    ListingNotActive,

    #[msg("Insufficient listing amount")]
    InsufficientListingAmount,

    #[msg("Invalid amount - must be greater than 0")]
    InvalidAmount,

    #[msg("Name too long - max 64 characters")]
    NameTooLong,

    #[msg("Symbol too long - max 10 characters")]
    SymbolTooLong,

    #[msg("URI too long - max 200 characters")]
    UriTooLong,

    #[msg("Description too long - max 256 characters")]
    DescriptionTooLong,

    #[msg("Location too long - max 128 characters")]
    LocationTooLong,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Invalid fee: must be <= 10000 bps")]
    InvalidFee,

    #[msg("Sale period invalid")]
    InvalidSalePeriod,

    #[msg("Already verified")]
    AlreadyVerified,

    #[msg("Invalid oracle data")]
    InvalidOracleData,

    #[msg("Price per fraction cannot be zero")]
    ZeroPrice,

    #[msg("Total supply cannot be zero")]
    ZeroSupply,
}