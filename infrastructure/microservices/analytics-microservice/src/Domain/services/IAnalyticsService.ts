import { AnalyticsReport } from "../models/AnalyticsReport";
import { ReportType } from "../enums/ReportType";

export interface RecordSaleInput {
  invoiceId: string;
  saleType: string;
  paymentMethod: string;
  items: { perfumeId: string; perfumeName: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  saleDate: string;
}

export interface SalesByCriteriaResult {
  period: string;
  totalSales: number;
  totalRevenue: number;
  invoiceCount: number;
}

export interface SalesTrendResult {
  month: string;
  revenue: number;
  changePercent: number | null;
}

export interface Top10PerfumeResult {
  perfumeId: string;
  perfumeName: string;
  totalQuantity: number;
}

export interface Top10RevenueResult {
  perfumeId: string;
  perfumeName: string;
  totalRevenue: number;
}

export interface IAnalyticsService {
  recordSale(data: RecordSaleInput): Promise<void>;
  getSalesByCriteria(criteria: 'month' | 'week' | 'year' | 'total'): Promise<SalesByCriteriaResult[]>;
  getSalesTrend(): Promise<SalesTrendResult[]>;
  getTop10Perfumes(): Promise<Top10PerfumeResult[]>;
  getTop10Revenue(): Promise<Top10RevenueResult[]>;
  generateReport(type: ReportType): Promise<AnalyticsReport>;
  listReports(): Promise<AnalyticsReport[]>;
  getReportById(id: string): Promise<AnalyticsReport | null>;
}
