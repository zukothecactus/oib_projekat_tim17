import "reflect-metadata";
import { Db } from '../DbConnectionPool';
import { seedPlants } from './seedPlants';
import { Plant } from '../../Domain/models/Plant';

async function run() {
  try {
    await Db.initialize();
    console.log('[Seed] Database initialized');
    const repo = Db.getRepository(Plant);

    for (const p of seedPlants) {
      const exists = await repo.findOne({ where: { latinName: p.latinName } });
      if (!exists) {
        const created = repo.create(p as any);
        await repo.save(created);
        console.log(`[Seed] Inserted ${p.commonName}`);
      } else {
        console.log(`[Seed] Skipped ${p.commonName} (exists)`);
      }
    }

    console.log('[Seed] Finished');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error', err);
    process.exit(1);
  }
}

run();
