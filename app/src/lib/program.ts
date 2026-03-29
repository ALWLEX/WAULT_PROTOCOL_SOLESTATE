import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Program, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  getPlatformPda,
  getAssetPda,
  getFractionMintPda,
  getFractionVaultPda,
  getPaymentVaultPda,
  getRevenueVaultPda,
  getHolderPda,
  getListingPda,
  getEscrowPda,
} from "./utils";
import { USDC_MINT } from "./constants";
import { CreateAssetFormData } from "./types";

/**
 * High-level program interaction functions
 */

export async function initializePlatform(
  program: Program,
  feeBps: number,
  treasury: PublicKey,
  oracleAuthority: PublicKey
): Promise<string> {
  const [platformPda] = getPlatformPda();

  const tx = await program.methods
    .initializePlatform(feeBps)
    .accounts({
      platform: platformPda,
      authority: program.provider.publicKey!,
      treasury,
      oracleAuthority,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function createAsset(
  program: Program,
  formData: CreateAssetFormData
): Promise<{ tx: string; assetPda: PublicKey }> {
  const [platformPda] = getPlatformPda();
  const platform = await program.account.platform.fetch(platformPda);
  const assetIndex = (platform.totalAssets as BN).toNumber();

  const [assetPda] = getAssetPda(platformPda, assetIndex);
  const [fractionMintPda] = getFractionMintPda(assetPda);
  const [paymentVaultPda] = getPaymentVaultPda(assetPda);
  const [revenueVaultPda] = getRevenueVaultPda(assetPda);

  const now = Math.floor(Date.now() / 1000);

  // Map string asset type to enum
  const assetTypeMap: Record<string, any> = {
    realEstate: { realEstate: {} },
    bond: { bond: {} },
    commodity: { commodity: {} },
    energy: { energy: {} },
    art: { art: {} },
    other: { other: {} },
  };

  const args = {
    name: formData.name,
    symbol: formData.symbol,
    uri: formData.uri,
    description: formData.description,
    assetType: assetTypeMap[formData.assetType] || { other: {} },
    location: formData.location,
    totalValuation: new BN(formData.totalValuation * 1_000_000),
    totalSupply: new BN(formData.totalSupply * 1_000_000),
    pricePerFraction: new BN(formData.pricePerFraction * 1_000_000),
    saleStart: new BN(now),
    saleEnd: new BN(now + formData.saleDurationDays * 86400),
  };

  const tx = await program.methods
    .createAsset(args)
    .accounts({
      platform: platformPda,
      asset: assetPda,
      fractionMint: fractionMintPda,
      usdcMint: USDC_MINT,
      paymentVault: paymentVaultPda,
      revenueVault: revenueVaultPda,
      creator: program.provider.publicKey!,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  return { tx, assetPda };
}

export async function purchaseFractions(
  program: Program,
  assetPublicKey: string,
  amount: number,
  buyerUsdcAccount: PublicKey,
  buyerFractionAccount: PublicKey,
  treasuryUsdcAccount: PublicKey
): Promise<string> {
  const [platformPda] = getPlatformPda();
  const assetPda = new PublicKey(assetPublicKey);

  const assetAccount = await program.account.asset.fetch(assetPda);
  const fractionMint = (assetAccount as any).fractionMint;
  const paymentVault = (assetAccount as any).paymentVault;

  const [fractionVaultPda] = getFractionVaultPda(assetPda);
  const [holderPda] = getHolderPda(assetPda, program.provider.publicKey!);

  const tx = await program.methods
    .purchaseFractions(new BN(amount * 1_000_000))
    .accounts({
      platform: platformPda,
      asset: assetPda,
      fractionMint: fractionMint,
      fractionVault: fractionVaultPda,
      paymentVault: paymentVault,
      buyerUsdcAccount,
      buyerFractionAccount,
      fractionHolder: holderPda,
      treasuryAccount: treasuryUsdcAccount,
      buyer: program.provider.publicKey!,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  return tx;
}

export async function claimRevenue(
  program: Program,
  assetPublicKey: string,
  holderUsdcAccount: PublicKey
): Promise<string> {
  const assetPda = new PublicKey(assetPublicKey);
  const wallet = program.provider.publicKey!;

  const assetAccount = await program.account.asset.fetch(assetPda);
  const revenueVault = (assetAccount as any).revenueVault;

  const [holderPda] = getHolderPda(assetPda, wallet);

  const tx = await program.methods
    .claimRevenue()
    .accounts({
      asset: assetPda,
      fractionHolder: holderPda,
      revenueVault: revenueVault,
      holderUsdcAccount: holderUsdcAccount,
      owner: wallet,
      holderAuthority: wallet,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
}

export async function listFractionsOnMarket(
  program: Program,
  assetPublicKey: string,
  amount: number,
  pricePerToken: number,
  sellerTokenAccount: PublicKey
): Promise<string> {
  const assetPda = new PublicKey(assetPublicKey);
  const wallet = program.provider.publicKey!;

  const assetAccount = await program.account.asset.fetch(assetPda);
  const fractionMint = (assetAccount as any).fractionMint;

  const now = Math.floor(Date.now() / 1000);
  const [listingPda] = getListingPda(assetPda, wallet, now);
  const [escrowPda] = getEscrowPda(listingPda);

  const tx = await program.methods
    .listFractions(
      new BN(amount * 1_000_000),
      new BN(pricePerToken * 1_000_000)
    )
    .accounts({
      asset: assetPda,
      fractionMint,
      listing: listingPda,
      sellerTokenAccount,
      escrowTokenAccount: escrowPda,
      seller: wallet,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  return tx;
}