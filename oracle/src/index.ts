import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, Idl } from "@coral-xyz/anchor";
import * as cron from "node-cron";
import { createHash } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID!);
const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";

// Oracle keypair (from env)
const oracleKeypair = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(process.env.ORACLE_PRIVATE_KEY!))
);

interface AssetValuationData {
  assetPubkey: PublicKey;
  valuation: number;
  monthlyRevenue: number;
  source: string;
  timestamp: number;
}

class WaultOracle {
  private connection: Connection;
  private program: Program;
  private provider: AnchorProvider;

  constructor() {
    this.connection = new Connection(RPC_URL, "confirmed");
    const wallet = new Wallet(oracleKeypair);
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });

    // Load IDL (in production, fetch from chain)
    const idl = require("../../target/idl/wault.json");
    this.program = new Program(idl as Idl, PROGRAM_ID, this.provider);
  }

  /**
   * Fetch property valuation from external sources
   * In production: Zillow API, Redfin, government registries, etc.
   */
  async fetchPropertyValuation(assetId: string): Promise<{
    valuation: number;
    monthlyRevenue: number;
  }> {
    // Simulated oracle data fetch
    // In production, this would call real APIs:
    // - Zillow/Redfin for property valuations
    // - Property management systems for rental income
    // - Government land registries for ownership verification

    console.log(`[Oracle] Fetching valuation for asset: ${assetId}`);

    // Simulate market data with slight variations
    const baseValuation = 1_000_000_000_000; // $1M
    const variation = Math.random() * 0.1 - 0.05; // ±5%
    const valuation = Math.round(baseValuation * (1 + variation));

    const baseRevenue = 8_000_000_000; // $8,000/month
    const revenueVariation = Math.random() * 0.15 - 0.05; // -5% to +10%
    const monthlyRevenue = Math.round(baseRevenue * (1 + revenueVariation));

    return { valuation, monthlyRevenue };
  }

  /**
   * Verify asset documents against known hashes
   */
  async verifyDocuments(assetId: string): Promise<{
    verified: boolean;
    hash: Buffer;
  }> {
    // In production: verify documents stored on IPFS
    // Check against title deeds, inspection reports, etc.
    const documentData = JSON.stringify({
      assetId,
      titleDeed: "verified",
      inspection: "passed",
      insurance: "active",
      timestamp: Date.now(),
    });

    const hash = createHash("sha256").update(documentData).digest();

    return {
      verified: true,
      hash,
    };
  }

  /**
   * Update on-chain oracle data for an asset
   */
  async updateAssetOracle(data: AssetValuationData): Promise<string> {
    const [platformPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      PROGRAM_ID
    );

    const dataToHash = JSON.stringify({
      valuation: data.valuation,
      monthlyRevenue: data.monthlyRevenue,
      source: data.source,
      timestamp: data.timestamp,
    });

    const dataHash = Array.from(
      createHash("sha256").update(dataToHash).digest()
    );

    try {
      const tx = await this.program.methods
        .updateOracle(
          { toNumber: () => data.valuation } as any, // BN
          { toNumber: () => data.monthlyRevenue } as any, // BN
          dataHash
        )
        .accounts({
          platform: platformPda,
          asset: data.assetPubkey,
          oracleAuthority: oracleKeypair.publicKey,
        })
        .rpc();

      console.log(`[Oracle] Updated asset ${data.assetPubkey.toBase58()}: tx=${tx}`);
      return tx;
    } catch (error) {
      console.error(`[Oracle] Failed to update:`, error);
      throw error;
    }
  }

  /**
   * Run oracle update cycle for all assets
   */
  async runUpdateCycle(): Promise<void> {
    console.log("\n[Oracle] ======= Starting Update Cycle =======");
    console.log(`[Oracle] Time: ${new Date().toISOString()}`);

    try {
      // Fetch all asset accounts
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform")],
        PROGRAM_ID
      );

      const platform = await this.program.account.platform.fetch(platformPda);
      const totalAssets = (platform.totalAssets as any).toNumber();

      console.log(`[Oracle] Total assets to update: ${totalAssets}`);

      for (let i = 0; i < totalAssets; i++) {
        const [assetPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("asset"),
            platformPda.toBuffer(),
            Buffer.from(new Uint8Array(new BigInt64Array([BigInt(i)]).buffer)),
          ],
          PROGRAM_ID
        );

        try {
          const assetData = await this.program.account.asset.fetch(assetPda);
          const { valuation, monthlyRevenue } = await this.fetchPropertyValuation(
            assetPda.toBase58()
          );

          await this.updateAssetOracle({
            assetPubkey: assetPda,
            valuation,
            monthlyRevenue,
            source: "wault-oracle-v1",
            timestamp: Date.now(),
          });

          console.log(
            `[Oracle] Asset ${i}: ${(assetData as any).name} - Val: $${(valuation / 1e6).toFixed(2)}, Rev: $${(monthlyRevenue / 1e6).toFixed(2)}/mo`
          );
        } catch (err) {
          console.error(`[Oracle] Error updating asset ${i}:`, err);
        }
      }

      console.log("[Oracle] ======= Update Cycle Complete =======\n");
    } catch (error) {
      console.error("[Oracle] Update cycle failed:", error);
    }
  }

  /**
   * Start the oracle with scheduled updates
   */
  start(): void {
    console.log("🔮 WAULT Oracle Service Starting...");
    console.log(`   Oracle Authority: ${oracleKeypair.publicKey.toBase58()}`);
    console.log(`   RPC: ${RPC_URL}`);
    console.log(`   Program: ${PROGRAM_ID.toBase58()}`);

    // Run every 6 hours
    cron.schedule("0 */6 * * *", () => {
      this.runUpdateCycle();
    });

    // Run immediately on start
    this.runUpdateCycle();

    console.log("🔮 Oracle running - updates every 6 hours");
  }
}

// Start oracle
const oracle = new WaultOracle();
oracle.start();