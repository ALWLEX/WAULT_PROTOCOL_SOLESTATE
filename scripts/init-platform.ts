import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
  console.log("🏗️  Initializing WAULT Platform...\n");

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Wault as Program;
  const authority = provider.wallet;

  // Generate treasury and oracle keypairs
  const treasuryKeypair = Keypair.generate();
  const oracleKeypair = Keypair.generate();

  console.log("Authority:", authority.publicKey.toBase58());
  console.log("Treasury:", treasuryKeypair.publicKey.toBase58());
  console.log("Oracle:", oracleKeypair.publicKey.toBase58());

  const [platformPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  const tx = await program.methods
    .initializePlatform(250) // 2.5% platform fee
    .accounts({
      platform: platformPda,
      authority: authority.publicKey,
      treasury: treasuryKeypair.publicKey,
      oracleAuthority: oracleKeypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("\n✅ Platform initialized!");
  console.log("Transaction:", tx);
  console.log("Platform PDA:", platformPda.toBase58());

  // Save keypairs
  const fs = require("fs");
  fs.writeFileSync(
    ".keys/treasury.json",
    JSON.stringify(Array.from(treasuryKeypair.secretKey))
  );
  fs.writeFileSync(
    ".keys/oracle.json",
    JSON.stringify(Array.from(oracleKeypair.secretKey))
  );

  console.log("\n🔑 Keypairs saved to .keys/");
}

main().catch(console.error);