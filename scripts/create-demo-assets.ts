import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint } from "@solana/spl-token";

const DEMO_ASSETS = [
  {
    name: "WAULT Dubai Marina Tower #1",
    symbol: "WDMT1",
    uri: "https://ipfs.io/ipfs/QmDubaiMarina1",
    description: "Luxury 3BR apartment in Dubai Marina with sea view. 8.5% annual rental yield.",
    assetType: { realEstate: {} },
    location: "Dubai Marina, Building 7, Unit 2301, UAE",
    totalValuation: new anchor.BN(1_000_000_000_000), // $1M
    totalSupply: new anchor.BN(10_000_000_000), // 10,000 fractions
    pricePerFraction: new anchor.BN(100_000_000), // $100
  },
  {
    name: "WAULT Solar Farm Alpha",
    symbol: "WSFA",
    uri: "https://ipfs.io/ipfs/QmSolarFarm1",
    description: "50MW solar farm in Nevada with PPA contracts. 12% APY from energy sales.",
    assetType: { energy: {} },
    location: "Clark County, Nevada, USA",
    totalValuation: new anchor.BN(2_000_000_000_000), // $2M
    totalSupply: new anchor.BN(10_000_000_000),
    pricePerFraction: new anchor.BN(200_000_000), // $200
  },
  {
    name: "WAULT US Treasury Bond Pool",
    symbol: "WUSTB",
    uri: "https://ipfs.io/ipfs/QmUSTreasury1",
    description: "Tokenized pool of US Treasury bonds with 4.8% yield.",
    assetType: { bond: {} },
    location: "United States",
    totalValuation: new anchor.BN(10_000_000_000_000), // $10M
    totalSupply: new anchor.BN(10_000_000_000),
    pricePerFraction: new anchor.BN(1_000_000_000), // $1,000
  },
];

async function main() {
  console.log("🏗️  Creating Demo Assets for WAULT...\n");

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Wault as Program;

  const [platformPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  // Create USDC mock
  const usdcMint = await createMint(
    provider.connection,
    (provider.wallet as any).payer,
    provider.wallet.publicKey,
    null,
    6
  );
  console.log("Mock USDC Mint:", usdcMint.toBase58());

  const platform = await program.account.platform.fetch(platformPda);
  let assetIndex = (platform.totalAssets as any).toNumber();

  for (const assetData of DEMO_ASSETS) {
    const now = Math.floor(Date.now() / 1000);
    const indexBN = new anchor.BN(assetIndex);

    const [assetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset"), platformPda.toBuffer(), indexBN.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [fractionMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fraction_mint"), assetPda.toBuffer()],
      program.programId
    );

    const [paymentVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("payment_vault"), assetPda.toBuffer()],
      program.programId
    );

    const [revenueVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("revenue_vault"), assetPda.toBuffer()],
      program.programId
    );

    const args = {
      ...assetData,
      saleStart: new anchor.BN(now - 3600),
      saleEnd: new anchor.BN(now + 86400 * 90), // 90 days
    };

    const tx = await program.methods
      .createAsset(args)
      .accounts({
        platform: platformPda,
        asset: assetPda,
        fractionMint: fractionMintPda,
        usdcMint: usdcMint,
        paymentVault: paymentVaultPda,
        revenueVault: revenueVaultPda,
        creator: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log(`✅ Created: ${assetData.name}`);
    console.log(`   PDA: ${assetPda.toBase58()}`);
    console.log(`   TX: ${tx}\n`);

    // Verify asset
    const verificationHash = Buffer.alloc(32);
    Buffer.from(`verified-${assetData.symbol}`).copy(verificationHash);

    await program.methods
      .verifyAsset(true, Array.from(verificationHash))
      .accounts({
        platform: platformPda,
        asset: assetPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log(`   ✓ Asset verified`);

    // Mint fractions
    const [fractionVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fraction_vault"), assetPda.toBuffer()],
      program.programId
    );

    await program.methods
      .mintFractions(assetData.totalSupply)
      .accounts({
        asset: assetPda,
        fractionMint: fractionMintPda,
        fractionVault: fractionVaultPda,
        creator: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log(`   ✓ ${assetData.totalSupply.toString()} fractions minted\n`);

    assetIndex++;
  }

  console.log("🎉 All demo assets created successfully!");
}

main().catch(console.error);