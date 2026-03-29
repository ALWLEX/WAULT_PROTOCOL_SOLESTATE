import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  // Solana
  rpcUrl: process.env.RPC_URL || "https://api.devnet.solana.com",
  programId: process.env.PROGRAM_ID || "WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  oraclePrivateKey: process.env.ORACLE_PRIVATE_KEY || "[]",

  // Update schedule (cron format)
  updateSchedule: process.env.UPDATE_SCHEDULE || "0 */6 * * *", // every 6 hours

  // External API keys (for production)
  zillowApiKey: process.env.ZILLOW_API_KEY || "",
  redfinApiKey: process.env.REDFIN_API_KEY || "",

  // Thresholds
  maxValuationChangePct: 20, // Max 20% change per update
  minUpdateInterval: 3600, // Min 1 hour between updates
  
  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};