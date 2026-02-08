import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { Db } from "../DbConnectionPool";
import { seedAuditLogs } from "./seedAuditLogs";

/** Called by index.ts after DB is already initialized */
export async function runSeeds() {
  console.log("[Seed@audit] Pokretanje seed-ova...");
  await seedAuditLogs();
  console.log("[Seed@audit] Seed proces završen.");
}

/** Standalone: npm run seed */
async function main() {
  try {
    await Db.initialize();
    console.log("[Seed@audit] Database connected");
    await runSeeds();
    process.exit(0);
  } catch (err) {
    console.error("[Seed@audit] Greška:", err);
    process.exit(1);
  }
}

// Run standalone only when executed directly (not imported)
if (require.main === module) {
  main();
}
