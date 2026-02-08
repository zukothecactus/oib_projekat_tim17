import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { Db } from "../DbConnectionPool";
import { seedPerfumes } from "./seedPerfumes";

async function run() {
  try {
    await Db.initialize();
    console.log("[Seed@processing] Database connected");

    await seedPerfumes();

    console.log("[Seed@processing] Seed proces završen.");
    process.exit(0);
  } catch (err) {
    console.error("[Seed@processing] Greška:", err);
    process.exit(1);
  }
}

run();
