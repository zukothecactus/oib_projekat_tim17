export enum ReportType {
  MONTHLY = "MONTHLY",
  WEEKLY = "WEEKLY",
  YEARLY = "YEARLY",
  TOTAL = "TOTAL",
  TREND = "TREND",
  TOP10 = "TOP10",
}

export interface SalesByCriteriaDTO {
  period: string;
  totalSales: number;
  totalRevenue: number;
  invoiceCount: number;
}

export interface SalesTrendDTO {
  month: string;
  revenue: number;
  changePercent: number | null;
}

export interface Top10PerfumeDTO {
  perfumeId: string;
  perfumeName: string;
  totalQuantity: number;
}

export interface Top10RevenueDTO {
  perfumeId: string;
  perfumeName: string;
  totalRevenue: number;
}

export interface ReportSectionTable {
  headers: string[];
  rows: string[][];
}

export interface ReportSectionChart {
  type: string;
  labels: string[];
  data: number[];
}

export interface ReportSection {
  heading: string;
  table?: ReportSectionTable;
  chart?: ReportSectionChart;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  sections: ReportSection[];
}

export interface AnalyticsReportDTO {
  id: string;
  reportType: ReportType;
  data: string; // JSON string of ReportData
  createdAt: string;
}
