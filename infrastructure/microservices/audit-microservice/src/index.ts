import app from "./app";
import dotenv from "dotenv";
import { initialize_database } from "./Database/InitializeConnection";
import { runSeeds } from "./Database/seeds/seedRunner";

dotenv.config();

const PORT = process.env.PORT || 5004;

initialize_database().then(async () => {
  await runSeeds();
  app.listen(PORT, () => {
    console.log(`\x1b[35m[AuditMS]\x1b[0m Server running on port ${PORT}`);
  });
});
