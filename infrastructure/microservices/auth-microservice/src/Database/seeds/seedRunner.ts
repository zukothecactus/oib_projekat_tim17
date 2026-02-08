import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { Db } from "../DbConnectionPool";
import { seedUsers } from "./seedUsers";

async function run() {
  try {
    await Db.initialize();
    console.log("[Seed@auth] Database connected");

    await seedUsers();

    console.log("[Seed@auth] Seed proces završen.");
    process.exit(0);
  } catch (err) {
    console.error("[Seed@auth] Greška:", err);
    process.exit(1);
  }
}

run();
