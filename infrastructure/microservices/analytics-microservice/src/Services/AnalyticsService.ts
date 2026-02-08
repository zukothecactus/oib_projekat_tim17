import { Repository } from "typeorm";
import {
  IAnalyticsService,
  RecordSaleInput,
  SalesByCriteriaResult,
  SalesTrendResult,
  Top10PerfumeResult,
  Top10RevenueResult,
} from "../Domain/services/IAnalyticsService";
import { AnalyticsReport } from "../Domain/models/AnalyticsReport";
import { RecordedSale, RecordedSaleItem } from "../Domain/models/RecordedSale";
import { ReportType } from "../Domain/enums/ReportType";
import { sendAuditLog } from "../utils/AuditClient";

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private readonly reportRepo: Repository<AnalyticsReport>,
    private readonly saleRepo: Repository<RecordedSale>
  ) {}

  async recordSale(data: RecordSaleInput): Promise<void> {
    const sale = this.saleRepo.create({
      invoiceId: data.invoiceId,
      saleType: data.saleType,
      paymentMethod: data.paymentMethod,
      items: data.items,
      totalAmount: data.totalAmount,
      saleDate: new Date(data.saleDate),
    });
    await this.saleRepo.save(sale);
    sendAuditLog("INFO", `Analytics: zabeležena prodaja ${data.invoiceId}, iznos ${data.totalAmount} RSD`);
  }

  async getSalesByCriteria(criteria: "month" | "week" | "year" | "total"): Promise<SalesByCriteriaResult[]> {
    const sales = await this.saleRepo.find({ order: { saleDate: "ASC" } });

    if (criteria === "total") {
      const totalSales = sales.reduce((sum, s) => {
        const items: RecordedSaleItem[] = typeof s.items === "string" ? JSON.parse(s.items) : s.items;
        return sum + items.reduce((q, i) => q + i.quantity, 0);
      }, 0);
      const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
      return [{ period: "Ukupno", totalSales, totalRevenue, invoiceCount: sales.length }];
    }

    const grouped = new Map<string, { totalSales: number; totalRevenue: number; invoiceCount: number }>();

    for (const sale of sales) {
      const d = new Date(sale.saleDate);
      let key: string;

      if (criteria === "year") {
        key = `${d.getFullYear()}`;
      } else if (criteria === "month") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // week
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
        key = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { totalSales: 0, totalRevenue: 0, invoiceCount: 0 });
      }
      const entry = grouped.get(key)!;
      const items: RecordedSaleItem[] = typeof sale.items === "string" ? JSON.parse(sale.items) : sale.items;
      entry.totalSales += items.reduce((q, i) => q + i.quantity, 0);
      entry.totalRevenue += Number(sale.totalAmount);
      entry.invoiceCount += 1;
    }

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      ...data,
    }));
  }

  async getSalesTrend(): Promise<SalesTrendResult[]> {
    const sales = await this.saleRepo.find({ order: { saleDate: "ASC" } });

    const monthly = new Map<string, number>();
    for (const sale of sales) {
      const d = new Date(sale.saleDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly.set(key, (monthly.get(key) ?? 0) + Number(sale.totalAmount));
    }

    const sorted = Array.from(monthly.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const result: SalesTrendResult[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const [month, revenue] = sorted[i];
      let changePercent: number | null = null;
      if (i > 0) {
        const prevRevenue = sorted[i - 1][1];
        changePercent = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 10000) / 100 : null;
      }
      result.push({ month, revenue, changePercent });
    }

    return result;
  }

  async getTop10Perfumes(): Promise<Top10PerfumeResult[]> {
    const sales = await this.saleRepo.find();
    const perfumeMap = new Map<string, { perfumeName: string; totalQuantity: number }>();

    for (const sale of sales) {
      const items: RecordedSaleItem[] = typeof sale.items === "string" ? JSON.parse(sale.items) : sale.items;
      for (const item of items) {
        const existing = perfumeMap.get(item.perfumeId) ?? { perfumeName: item.perfumeName, totalQuantity: 0 };
        existing.totalQuantity += item.quantity;
        perfumeMap.set(item.perfumeId, existing);
      }
    }

    return Array.from(perfumeMap.entries())
      .map(([perfumeId, data]) => ({ perfumeId, ...data }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);
  }

  async getTop10Revenue(): Promise<Top10RevenueResult[]> {
    const sales = await this.saleRepo.find();
    const perfumeMap = new Map<string, { perfumeName: string; totalRevenue: number }>();

    for (const sale of sales) {
      const items: RecordedSaleItem[] = typeof sale.items === "string" ? JSON.parse(sale.items) : sale.items;
      for (const item of items) {
        const existing = perfumeMap.get(item.perfumeId) ?? { perfumeName: item.perfumeName, totalRevenue: 0 };
        existing.totalRevenue += item.quantity * item.unitPrice;
        perfumeMap.set(item.perfumeId, existing);
      }
    }

    return Array.from(perfumeMap.entries())
      .map(([perfumeId, data]) => ({ perfumeId, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }

  async generateReport(type: ReportType): Promise<AnalyticsReport> {
    let reportData: any;

    switch (type) {
      case ReportType.MONTHLY: {
        const data = await this.getSalesByCriteria("month");
        reportData = {
          title: "Mesecni izvestaj prodaje",
          generatedAt: new Date().toISOString(),
          sections: [
            {
              heading: "Prodaja po mesecima",
              table: {
                headers: ["Period", "Broj faktura", "Ukupno prodato", "Prihod (RSD)"],
                rows: data.map((d) => [d.period, d.invoiceCount.toString(), d.totalSales.toString(), d.totalRevenue.toLocaleString("sr-RS")]),
              },
              chart: {
                type: "bar",
                labels: data.map((d) => d.period),
                data: data.map((d) => d.totalRevenue),
              },
            },
          ],
        };
        break;
      }
      case ReportType.WEEKLY: {
        const data = await this.getSalesByCriteria("week");
        reportData = {
          title: "Nedeljni izvestaj prodaje",
          generatedAt: new Date().toISOString(),
          sections: [
            {
              heading: "Prodaja po nedeljama",
              table: {
                headers: ["Period", "Broj faktura", "Ukupno prodato", "Prihod (RSD)"],
                rows: data.map((d) => [d.period, d.invoiceCount.toString(), d.totalSales.toString(), d.totalRevenue.toLocaleString("sr-RS")]),
              },
              chart: {
                type: "bar",
                labels: data.map((d) => d.period),
                data: data.map((d) => d.totalRevenue),
              },
            },
          ],
        };
        break;
      }
      case ReportType.YEARLY: {
        const data = await this.getSalesByCriteria("year");
        reportData = {
          title: "Godisnji izvestaj prodaje",
          generatedAt: new Date().toISOString(),
          sections: [
            {
              heading: "Prodaja po godinama",
              table: {
                headers: ["Godina", "Broj faktura", "Ukupno prodato", "Prihod (RSD)"],
                rows: data.map((d) => [d.period, d.invoiceCount.toString(), d.totalSales.toString(), d.totalRevenue.toLocaleString("sr-RS")]),
              },
              chart: {
                type: "bar",
                labels: data.map((d) => d.period),
                data: data.map((d) => d.totalRevenue),
              },
            },
          ],
        };
        break;
      }
      case ReportType.TOTAL: {
        const data = await this.getSalesByCriteria("total");
        const top10 = await this.getTop10Perfumes();
        reportData = {
          title: "Ukupni izvestaj prodaje",
          generatedAt: new Date().toISOString(),
          sections: [
            {
              heading: "Sumarni podaci",
              table: {
                headers: ["Metrika", "Vrednost"],
                rows: [
                  ["Ukupan broj faktura", data[0]?.invoiceCount.toString() ?? "0"],
                  ["Ukupno prodato artikala", data[0]?.totalSales.toString() ?? "0"],
                  ["Ukupan prihod (RSD)", data[0]?.totalRevenue.toLocaleString("sr-RS") ?? "0"],
                ],
              },
            },
            {
              heading: "Top parfemi po kolicini",
              table: {
                headers: ["Parfem", "Prodato komada"],
                rows: top10.map((p) => [p.perfumeName, p.totalQuantity.toString()]),
              },
              chart: {
                type: "pie",
                labels: top10.map((p) => p.perfumeName),
                data: top10.map((p) => p.totalQuantity),
              },
            },
          ],
        };
        break;
      }
      case ReportType.TREND: {
        const trend = await this.getSalesTrend();
        reportData = {
          title: "Trend prodaje",
          generatedAt: new Date().toISOString(),
          sections: [
            {
              heading: "Mesecni trend prihoda",
              table: {
                headers: ["Mesec", "Prihod (RSD)", "Promena (%)"],
                rows: trend.map((t) => [
                  t.month,
                  t.revenue.toLocaleString("sr-RS"),
                  t.changePercent !== null ? `${t.changePercent > 0 ? "+" : ""}${t.changePercent}%` : "—",
                ]),
              },
              chart: {
                type: "line",
                labels: trend.map((t) => t.month),
                data: trend.map((t) => t.revenue),
              },
            },
          ],
        };
        break;
      }
      case ReportType.TOP10: {
        const top10Qty = await this.getTop10Perfumes();
        const top10Rev = await this.getTop10Revenue();
        reportData = {
          title: "Top 10 parfema",
          generatedAt: new Date().toISOString(),
          sections: [
            {
              heading: "Top 10 po kolicini",
              table: {
                headers: ["Parfem", "Prodato komada"],
                rows: top10Qty.map((p) => [p.perfumeName, p.totalQuantity.toString()]),
              },
              chart: {
                type: "bar",
                labels: top10Qty.map((p) => p.perfumeName),
                data: top10Qty.map((p) => p.totalQuantity),
              },
            },
            {
              heading: "Top 10 po prihodu",
              table: {
                headers: ["Parfem", "Prihod (RSD)"],
                rows: top10Rev.map((p) => [p.perfumeName, p.totalRevenue.toLocaleString("sr-RS")]),
              },
              chart: {
                type: "bar",
                labels: top10Rev.map((p) => p.perfumeName),
                data: top10Rev.map((p) => p.totalRevenue),
              },
            },
          ],
        };
        break;
      }
    }

    const report = this.reportRepo.create({
      reportType: type,
      data: JSON.stringify(reportData),
    });

    const saved = await this.reportRepo.save(report);
    sendAuditLog("INFO", `Analytics: generisan izveštaj tipa ${type}, ID: ${saved.id}`);
    return saved;
  }

  async listReports(): Promise<AnalyticsReport[]> {
    return this.reportRepo.find({ order: { createdAt: "DESC" } });
  }

  async getReportById(id: string): Promise<AnalyticsReport | null> {
    return this.reportRepo.findOne({ where: { id } });
  }
}
