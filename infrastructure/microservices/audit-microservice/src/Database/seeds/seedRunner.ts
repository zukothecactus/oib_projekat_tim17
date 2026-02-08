import { seedAuditLogs } from "./seedAuditLogs";

export async function runSeeds() {
  console.log("[Seed] Pokretanje seed-ova...");
  await seedAuditLogs();
  console.log("[Seed] Seed proces završen.");
}
