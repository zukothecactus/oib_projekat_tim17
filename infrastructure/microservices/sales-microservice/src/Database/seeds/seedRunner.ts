import "reflect-metadata";
import dotenv from "dotenv";
import { Db } from "../DbConnectionPool";
import { Invoice } from "../../Domain/models/Invoice";
import { SaleType } from "../../Domain/enums/SaleType";
import { PaymentMethod } from "../../Domain/enums/PaymentMethod";

dotenv.config();

async function seed() {
  try {
    await Db.initialize();
    console.log("[Seed] Database connected");

    const invoiceRepo = Db.getRepository(Invoice);

    // Clear existing data
    await invoiceRepo.clear();

    const invoices = invoiceRepo.create([
      {
        saleType: SaleType.MALOPRODAJA,
        paymentMethod: PaymentMethod.KARTICNO,
        items: [
          { perfumeId: "p-001", perfumeName: "Rosa Mistika", quantity: 2, unitPrice: 13200 },
          { perfumeId: "p-002", perfumeName: "Lavander Noir", quantity: 1, unitPrice: 8900 },
        ],
        totalAmount: 35300,
      },
      {
        saleType: SaleType.VELEPRODAJA,
        paymentMethod: PaymentMethod.UPLATA_NA_RACUN,
        items: [
          { perfumeId: "p-003", perfumeName: "Bergamot Esenc", quantity: 10, unitPrice: 13200 },
          { perfumeId: "p-004", perfumeName: "Jasmin De Nuj", quantity: 8, unitPrice: 9500 },
        ],
        totalAmount: 208000,
      },
      {
        saleType: SaleType.MALOPRODAJA,
        paymentMethod: PaymentMethod.GOTOVINA,
        items: [
          { perfumeId: "p-002", perfumeName: "Lavander Noir", quantity: 3, unitPrice: 8900 },
        ],
        totalAmount: 26700,
      },
      {
        saleType: SaleType.VELEPRODAJA,
        paymentMethod: PaymentMethod.KARTICNO,
        items: [
          { perfumeId: "p-001", perfumeName: "Rosa Mistika", quantity: 5, unitPrice: 13200 },
          { perfumeId: "p-003", perfumeName: "Bergamot Esenc", quantity: 5, unitPrice: 13200 },
        ],
        totalAmount: 132000,
      },
      {
        saleType: SaleType.MALOPRODAJA,
        paymentMethod: PaymentMethod.UPLATA_NA_RACUN,
        items: [
          { perfumeId: "p-004", perfumeName: "Jasmin De Nuj", quantity: 2, unitPrice: 9500 },
          { perfumeId: "p-002", perfumeName: "Lavander Noir", quantity: 1, unitPrice: 8900 },
        ],
        totalAmount: 27900,
      },
    ]);

    const saved = await invoiceRepo.save(invoices);
    console.log(`[Seed] Inserted ${saved.length} invoices`);
    console.log("[Seed] Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Error:", err);
    process.exit(1);
  }
}

seed();
