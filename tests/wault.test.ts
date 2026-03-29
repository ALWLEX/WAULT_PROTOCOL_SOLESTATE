import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Wault } from "../target/types/wault";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("WAULT Protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Wault as Program<Wault>;
  const authority = provider.wallet as anchor.Wallet;

  let platformPda: PublicKey;
  let platformBump: number;
  let usdcMint: PublicKey;
  let treasuryKeypair: Keypair;
  let treasuryUsdcAccount: PublicKey;
  let oracleAuthority: Keypair;
  let assetPda: PublicKey;
  let fractionMintPda: PublicKey;
  let paymentVaultPda: PublicKey;
  let revenueVaultPda: PublicKey;
  let fractionVaultPda: PublicKey;

  const buyer = Keypair.generate();
  let buyerUsdcAccount: PublicKey;
  let buyerFractionAccount: PublicKey;

  before(async () => {
    // Airdrop SOL to buyer
    const sig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    // Create USDC mock mint
    usdcMint = await createMint(
      provider.connection,
      (authority as any).payer,
      authority.publicKey,
      null,
      6
    );

    // Setup treasury
    treasuryKeypair = Keypair.generate();
    const treasurySig = await provider.connection.requestAirdrop(
      treasuryKeypair.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(treasurySig);

    treasuryUsdcAccount = await createAccount(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      treasuryKeypair.publicKey
    );

    // Setup oracle authority
    oracleAuthority = Keypair.generate();
    const oracleSig = await provider.connection.requestAirdrop(
      oracleAuthority.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(oracleSig);

    // Find platform PDA
    [platformPda, platformBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    // Setup buyer USDC account and fund it
    buyerUsdcAccount = await createAccount(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      buyer.publicKey
    );

    // Mint 100,000 USDC to buyer
    await mintTo(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      buyerUsdcAccount,
      authority.publicKey,
      100_000_000_000 // 100,000 USDC
    );
  });

  it("Initializes the WAULT platform", async () => {
    const tx = await program.methods
      .initializePlatform(250) // 2.5% fee
      .accounts({
        platform: platformPda,
        authority: authority.publicKey,
        treasury: treasuryKeypair.publicKey,
        oracleAuthority: oracleAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Platform initialized:", tx);

    const platform = await program.account.platform.fetch(platformPda);
    assert.equal(platform.feeBps, 250);
    assert.equal(platform.totalAssets.toNumber(), 0);
    assert.ok(platform.authority.equals(authority.publicKey));
    assert.ok(platform.treasury.equals(treasuryKeypair.publicKey));
  });

  it("Creates a real estate asset", async () => {
    const index = new anchor.BN(0);
    [assetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset"), platformPda.toBuffer(), index.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    [fractionMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fraction_mint"), assetPda.toBuffer()],
      program.programId
    );

    [paymentVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("payment_vault"), assetPda.toBuffer()],
      program.programId
    );

    [revenueVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("revenue_vault"), assetPda.toBuffer()],
      program.programId
    );

    const now = Math.floor(Date.now() / 1000);

    const args = {
      name: "WAULT Dubai Marina Tower #1",
      symbol: "WDMT1",
      uri: "https://ipfs.io/ipfs/QmExample...",
      description: "Luxury apartment in Dubai Marina with 8% annual yield",
      assetType: { realEstate: {} },
      location: "Dubai Marina, UAE",
      totalValuation: new anchor.BN(1_000_000_000_000), // $1M (6 decimals)
      totalSupply: new anchor.BN(10_000_000_000), // 10,000 fractions (6 decimals)
      pricePerFraction: new anchor.BN(100_000_000), // $100 per fraction
      saleStart: new anchor.BN(now - 60),
      saleEnd: new anchor.BN(now + 86400 * 30), // 30 days
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
        creator: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Asset created:", tx);

    const asset = await program.account.asset.fetch(assetPda);
    assert.equal(asset.name, "WAULT Dubai Marina Tower #1");
    assert.equal(asset.symbol, "WDMT1");
    assert.ok(asset.totalValuation.eq(new anchor.BN(1_000_000_000_000)));
    assert.deepEqual(asset.status, { pendingVerification: {} });
  });

  it("Verifies the asset", async () => {
    const verificationHash = Buffer.alloc(32);
    Buffer.from("verified-document-hash-1234567").copy(verificationHash);

    const tx = await program.methods
      .verifyAsset(true, Array.from(verificationHash))
      .accounts({
        platform: platformPda,
        asset: assetPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Asset verified:", tx);

    const asset = await program.account.asset.fetch(assetPda);
    assert.equal(asset.isVerified, true);
    assert.deepEqual(asset.status, { saleOpen: {} });
  });

  it("Mints fractional tokens", async () => {
    [fractionVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fraction_vault"), assetPda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .mintFractions(new anchor.BN(10_000_000_000)) // mint all 10,000
      .accounts({
        asset: assetPda,
        fractionMint: fractionMintPda,
        fractionVault: fractionVaultPda,
        creator: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Fractions minted:", tx);

    const vault = await getAccount(provider.connection, fractionVaultPda);
    assert.equal(vault.amount.toString(), "10000000000");
  });

  it("Purchases fractions", async () => {
    const [holderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), assetPda.toBuffer(), buyer.publicKey.toBuffer()],
      program.programId
    );

    buyerFractionAccount = await createAccount(
      provider.connection,
      (authority as any).payer,
      fractionMintPda,
      buyer.publicKey
    );

    const purchaseAmount = new anchor.BN(100_000_000); // 100 fractions

    const tx = await program.methods
      .purchaseFractions(purchaseAmount)
      .accounts({
        platform: platformPda,
        asset: assetPda,
        fractionMint: fractionMintPda,
        fractionVault: fractionVaultPda,
        paymentVault: paymentVaultPda,
        buyerUsdcAccount: buyerUsdcAccount,
        buyerFractionAccount: buyerFractionAccount,
        fractionHolder: holderPda,
        treasuryAccount: treasuryUsdcAccount,
        buyer: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    console.log("Fractions purchased:", tx);

    const fractionAccount = await getAccount(provider.connection, buyerFractionAccount);
    assert.equal(fractionAccount.amount.toString(), "100000000");

    const holder = await program.account.fractionHolder.fetch(holderPda);
    assert.equal(holder.fractionsHeld.toString(), "100000000");
  });

  it("Updates oracle data", async () => {
    const dataHash = Buffer.alloc(32);
    Buffer.from("oracle-data-hash-2024-q1").copy(dataHash);

    const tx = await program.methods
      .updateOracle(
        new anchor.BN(1_050_000_000_000), // 5% appreciation
        new anchor.BN(8_000_000_000), // $8,000 monthly revenue
        Array.from(dataHash)
      )
      .accounts({
        platform: platformPda,
        asset: assetPda,
        oracleAuthority: oracleAuthority.publicKey,
      })
      .signers([oracleAuthority])
      .rpc();

    console.log("Oracle updated:", tx);

    const asset = await program.account.asset.fetch(assetPda);
    assert.equal(asset.oracleValuation.toString(), "1050000000000");
    assert.equal(asset.oracleMonthlyRevenue.toString(), "8000000000");
  });

  it("Distributes revenue", async () => {
    // Create revenue source and fund it
    const revenueSourceAccount = await createAccount(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      authority.publicKey
    );

    await mintTo(
      provider.connection,
      (authority as any).payer,
      usdcMint,
      revenueSourceAccount,
      authority.publicKey,
      8_000_000_000 // $8,000 revenue
    );

    const tx = await program.methods
      .distributeRevenue(new anchor.BN(8_000_000_000))
      .accounts({
        platform: platformPda,
        asset: assetPda,
        revenueVault: revenueVaultPda,
        revenueSource: revenueSourceAccount,
        depositor: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Revenue distributed:", tx);

    const asset = await program.account.asset.fetch(assetPda);
    assert.equal(asset.totalRevenueAccumulated.toString(), "8000000000");
  });

  it("Claims revenue", async () => {
    const [holderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("holder"), assetPda.toBuffer(), buyer.publicKey.toBuffer()],
      program.programId
    );

    const beforeBalance = await getAccount(provider.connection, buyerUsdcAccount);

    const tx = await program.methods
      .claimRevenue()
      .accounts({
        asset: assetPda,
        fractionHolder: holderPda,
        revenueVault: revenueVaultPda,
        holderUsdcAccount: buyerUsdcAccount,
        owner: buyer.publicKey,
        holderAuthority: buyer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    console.log("Revenue claimed:", tx);

    const afterBalance = await getAccount(provider.connection, buyerUsdcAccount);
    const holder = await program.account.fractionHolder.fetch(holderPda);
    assert.equal(holder.unclaimedRevenue.toString(), "0");
    console.log("Revenue received:", (afterBalance.amount - beforeBalance.amount).toString());
  });
});