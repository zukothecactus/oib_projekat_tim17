import { Db } from '../DbConnectionPool';
import { Package } from '../../Domain/models/Package';
import { PackageStatus } from '../../Domain/enums/PackageStatus';
import { v4 as uuidv4 } from 'uuid';

export async function seedPackages() {
  const repo = Db.getRepository(Package);

  const existing = await repo.count();
  if (existing > 0) {
    console.log("\x1b[33m[Seed@packaging]\x1b[0m Packages already seeded, skipping.");
    return;
  }

  const packages: Partial<Package>[] = [
    {
      name: "Paket Rosa Mistika",
      senderAddress: "Pariz, Rue de la Paix 45",
      warehouseId: null,
      perfumeIds: [uuidv4(), uuidv4(), uuidv4()],
      status: PackageStatus.SPAKOVANA,
    },
    {
      name: "Paket Lavander Noir",
      senderAddress: "Pariz, Avenue Foch 12",
      warehouseId: "wh-2",
      perfumeIds: [uuidv4(), uuidv4()],
      status: PackageStatus.POSLATA,
    },
    {
      name: "Paket Bergamot Esenc",
      senderAddress: "Pariz, Blvd. Saint-Germain 89",
      warehouseId: null,
      perfumeIds: [uuidv4(), uuidv4(), uuidv4(), uuidv4()],
      status: PackageStatus.SPAKOVANA,
    },
    {
      name: "Paket Jasmin De Nuj",
      senderAddress: "Pariz, Rue de Rivoli 33",
      warehouseId: "wh-1",
      perfumeIds: [uuidv4(), uuidv4(), uuidv4()],
      status: PackageStatus.POSLATA,
    },
    {
      name: "Paket Iris Royal",
      senderAddress: "Pariz, Avenue Montaigne 7",
      warehouseId: null,
      perfumeIds: [uuidv4(), uuidv4()],
      status: PackageStatus.SPAKOVANA,
    },
  ];

  for (const pkg of packages) {
    const entity = repo.create(pkg);
    await repo.save(entity);
  }

  console.log(`\x1b[32m[Seed@packaging]\x1b[0m Seeded ${packages.length} packages.`);
}
