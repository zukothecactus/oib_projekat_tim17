import { Db } from "../DbConnectionPool";
import { Perfume } from "../../Domain/models/Perfume";
import { PerfumeType } from "../../Domain/enums/PerfumeType";
import { PerfumeStatus } from "../../Domain/enums/PerfumeStatus";
import { v4 as uuidv4 } from "uuid";

export async function seedPerfumes() {
  const repo = Db.getRepository(Perfume);
  const count = await repo.count();
  if (count > 0) {
    console.log("[Seed@processing] Parfemi već postoje, preskačem seed.");
    return;
  }

  const now = new Date();
  const expiresIn = (months: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  };

  const perfumes: Partial<Perfume>[] = [
    {
      name: "Rosa Mistika",
      type: PerfumeType.PERFUME,
      volume: 250,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(24),
      status: PerfumeStatus.DONE,
      plantId: null as any,
    },
    {
      name: "Rosa Mistika",
      type: PerfumeType.PERFUME,
      volume: 250,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(24),
      status: PerfumeStatus.DONE,
      plantId: null as any,
    },
    {
      name: "Lavander Noir",
      type: PerfumeType.COLOGNE,
      volume: 150,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(18),
      status: PerfumeStatus.DONE,
      plantId: null as any,
    },
    {
      name: "Lavander Noir",
      type: PerfumeType.COLOGNE,
      volume: 150,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(18),
      status: PerfumeStatus.DONE,
      plantId: null as any,
    },
    {
      name: "Bergamot Esenc",
      type: PerfumeType.PERFUME,
      volume: 250,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(20),
      status: PerfumeStatus.IN_PROGRESS,
      plantId: null as any,
    },
    {
      name: "Jasmin De Nuj",
      type: PerfumeType.COLOGNE,
      volume: 150,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(12),
      status: PerfumeStatus.DONE,
      plantId: null as any,
    },
    {
      name: "Iris Royal",
      type: PerfumeType.PERFUME,
      volume: 250,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(22),
      status: PerfumeStatus.IN_PROGRESS,
      plantId: null as any,
    },
    {
      name: "Vetiver Sauvage",
      type: PerfumeType.COLOGNE,
      volume: 150,
      serialNumber: `SN-${uuidv4().substring(0, 8).toUpperCase()}`,
      expiresAt: expiresIn(16),
      status: PerfumeStatus.DONE,
      plantId: null as any,
    },
  ];

  for (const p of perfumes) {
    const entity = repo.create(p);
    await repo.save(entity);
  }

  console.log(`[Seed@processing] Uneseno ${perfumes.length} parfema.`);
}
