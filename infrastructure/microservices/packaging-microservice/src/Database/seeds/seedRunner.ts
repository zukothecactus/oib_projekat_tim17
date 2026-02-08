import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { Db } from '../DbConnectionPool';
import { seedPackages } from './seedPackages';

async function runSeeds() {
  try {
    await Db.initialize();
    console.log("\x1b[34m[Seed@packaging]\x1b[0m Database connected");

    await seedPackages();

    console.log("\x1b[32m[Seed@packaging]\x1b[0m All seeds completed.");
    process.exit(0);
  } catch (err) {
    console.error("\x1b[31m[Seed@packaging]\x1b[0m Seed runner failed:", err);
    process.exit(1);
  }
}

runSeeds();
