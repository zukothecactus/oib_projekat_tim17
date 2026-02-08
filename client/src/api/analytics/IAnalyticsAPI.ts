import {
  SalesByCriteriaDTO,
  SalesTrendDTO,
  Top10PerfumeDTO,
  Top10RevenueDTO,
  AnalyticsReportDTO,
} from "../../models/analytics/AnalyticsDTO";

export interface IAnalyticsAPI {
  getSalesByCriteria(token: string, criteria: string): Promise<SalesByCriteriaDTO[]>;
  getSalesTrend(token: string): Promise<SalesTrendDTO[]>;
  getTop10Perfumes(token: string): Promise<Top10PerfumeDTO[]>;
  getTop10Revenue(token: string): Promise<Top10RevenueDTO[]>;
  generateReport(token: string, type: string): Promise<AnalyticsReportDTO>;
  listReports(token: string): Promise<AnalyticsReportDTO[]>;
  getReportById(token: string, id: string): Promise<AnalyticsReportDTO>;
}
