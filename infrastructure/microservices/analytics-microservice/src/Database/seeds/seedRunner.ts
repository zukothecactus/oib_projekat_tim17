import "reflect-metadata";
import dotenv from "dotenv";
import { Db } from "../DbConnectionPool";
import { RecordedSale } from "../../Domain/models/RecordedSale";
import { AnalyticsReport } from "../../Domain/models/AnalyticsReport";
import { ReportType } from "../../Domain/enums/ReportType";

dotenv.config();

async function seed() {
  try {
    await Db.initialize();
    console.log("[Seed] Database connected");

    const saleRepo = Db.getRepository(RecordedSale);
    const reportRepo = Db.getRepository(AnalyticsReport);

    // Clear existing data
    await reportRepo.clear();
    await saleRepo.clear();

    // Seed recorded sales (mirror of invoices from sales-microservice)
    const sales = saleRepo.create([
      {
        invoiceId: "inv-00000001-0000-0000-0000-000000000001",
        saleType: "MALOPRODAJA",
        paymentMethod: "KARTICNO",
        items: [
          { perfumeId: "p-001", perfumeName: "Rosa Mistika", quantity: 2, unitPrice: 13200 },
          { perfumeId: "p-002", perfumeName: "Lavander Noir", quantity: 1, unitPrice: 8900 },
        ],
        totalAmount: 35300,
        saleDate: new Date("2026-01-15T10:30:00"),
      },
      {
        invoiceId: "inv-00000002-0000-0000-0000-000000000002",
        saleType: "VELEPRODAJA",
        paymentMethod: "UPLATA_NA_RACUN",
        items: [
          { perfumeId: "p-003", perfumeName: "Bergamot Esenc", quantity: 10, unitPrice: 13200 },
          { perfumeId: "p-004", perfumeName: "Jasmin De Nuj", quantity: 8, unitPrice: 9500 },
        ],
        totalAmount: 208000,
        saleDate: new Date("2026-01-20T14:00:00"),
      },
      {
        invoiceId: "inv-00000003-0000-0000-0000-000000000003",
        saleType: "MALOPRODAJA",
        paymentMethod: "GOTOVINA",
        items: [
          { perfumeId: "p-002", perfumeName: "Lavander Noir", quantity: 3, unitPrice: 8900 },
        ],
        totalAmount: 26700,
        saleDate: new Date("2026-01-25T09:15:00"),
      },
      {
        invoiceId: "inv-00000004-0000-0000-0000-000000000004",
        saleType: "VELEPRODAJA",
        paymentMethod: "KARTICNO",
        items: [
          { perfumeId: "p-001", perfumeName: "Rosa Mistika", quantity: 5, unitPrice: 13200 },
          { perfumeId: "p-003", perfumeName: "Bergamot Esenc", quantity: 5, unitPrice: 13200 },
        ],
        totalAmount: 132000,
        saleDate: new Date("2026-02-03T11:00:00"),
      },
      {
        invoiceId: "inv-00000005-0000-0000-0000-000000000005",
        saleType: "MALOPRODAJA",
        paymentMethod: "UPLATA_NA_RACUN",
        items: [
          { perfumeId: "p-004", perfumeName: "Jasmin De Nuj", quantity: 2, unitPrice: 9500 },
          { perfumeId: "p-002", perfumeName: "Lavander Noir", quantity: 1, unitPrice: 8900 },
        ],
        totalAmount: 27900,
        saleDate: new Date("2026-02-05T16:45:00"),
      },
    ]);

    const savedSales = await saleRepo.save(sales);
    console.log(`[Seed] Inserted ${savedSales.length} recorded sales`);

    // Seed 3 analytics reports
    const monthlyReportData = {
      title: "Mesečni izveštaj prodaje",
      generatedAt: new Date("2026-02-01T08:00:00").toISOString(),
      sections: [
        {
          heading: "Prodaja po mesecima",
          table: {
            headers: ["Period", "Broj faktura", "Ukupno prodato", "Prihod (RSD)"],
            rows: [
              ["2026-01", "3", "24", "270.000"],
              ["2026-02", "2", "13", "159.900"],
            ],
          },
          chart: {
            type: "bar",
            labels: ["2026-01", "2026-02"],
            data: [270000, 159900],
          },
        },
      ],
    };

    const trendReportData = {
      title: "Trend prodaje",
      generatedAt: new Date("2026-02-01T08:00:00").toISOString(),
      sections: [
        {
          heading: "Mesečni trend prihoda",
          table: {
            headers: ["Mesec", "Prihod (RSD)", "Promena (%)"],
            rows: [
              ["2026-01", "270.000", "—"],
              ["2026-02", "159.900", "-40.78%"],
            ],
          },
          chart: {
            type: "line",
            labels: ["2026-01", "2026-02"],
            data: [270000, 159900],
          },
        },
      ],
    };

    const top10ReportData = {
      title: "Top 10 parfema",
      generatedAt: new Date("2026-02-01T08:00:00").toISOString(),
      sections: [
        {
          heading: "Top 10 po količini",
          table: {
            headers: ["Parfem", "Prodato komada"],
            rows: [
              ["Bergamot Esenc", "15"],
              ["Rosa Mistika", "7"],
              ["Lavander Noir", "5"],
              ["Jasmin De Nuj", "10"],
            ],
          },
          chart: {
            type: "bar",
            labels: ["Bergamot Esenc", "Rosa Mistika", "Lavander Noir", "Jasmin De Nuj"],
            data: [15, 7, 5, 10],
          },
        },
        {
          heading: "Top 10 po prihodu",
          table: {
            headers: ["Parfem", "Prihod (RSD)"],
            rows: [
              ["Bergamot Esenc", "198.000"],
              ["Rosa Mistika", "92.400"],
              ["Jasmin De Nuj", "95.000"],
              ["Lavander Noir", "44.500"],
            ],
          },
          chart: {
            type: "bar",
            labels: ["Bergamot Esenc", "Rosa Mistika", "Jasmin De Nuj", "Lavander Noir"],
            data: [198000, 92400, 95000, 44500],
          },
        },
      ],
    };

    const reports = reportRepo.create([
      { reportType: ReportType.MONTHLY, data: JSON.stringify(monthlyReportData) },
      { reportType: ReportType.TREND, data: JSON.stringify(trendReportData) },
      { reportType: ReportType.TOP10, data: JSON.stringify(top10ReportData) },
    ]);

    const savedReports = await reportRepo.save(reports);
    console.log(`[Seed] Inserted ${savedReports.length} analytics reports`);
    console.log("[Seed] Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Error:", err);
    process.exit(1);
  }
}

seed();
