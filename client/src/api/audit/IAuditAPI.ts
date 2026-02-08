import { AuditLogDTO } from "../../models/audit/AuditLogDTO";

export interface IAuditAPI {
  getAllLogs(token: string): Promise<AuditLogDTO[]>;
  getLogById(token: string, id: string): Promise<AuditLogDTO>;
  createLog(token: string, data: { type: string; description: string }): Promise<AuditLogDTO>;
  updateLog(token: string, id: string, data: { type?: string; description?: string }): Promise<AuditLogDTO>;
  deleteLog(token: string, id: string): Promise<{ message: string }>;
  searchLogs(
    token: string,
    query: { type?: string; keyword?: string; dateFrom?: string; dateTo?: string }
  ): Promise<AuditLogDTO[]>;
}
