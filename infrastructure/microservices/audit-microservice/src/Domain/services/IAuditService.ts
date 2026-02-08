import { AuditLogDTO } from "../DTOs/AuditLogDTO";
import { AuditLogType } from "../enums/AuditLogType";

export interface IAuditService {
  createLog(type: AuditLogType, description: string): Promise<AuditLogDTO>;
  getAllLogs(): Promise<AuditLogDTO[]>;
  getLogById(id: string): Promise<AuditLogDTO | null>;
  updateLog(id: string, type?: AuditLogType, description?: string): Promise<AuditLogDTO | null>;
  deleteLog(id: string): Promise<boolean>;
  searchLogs(query: {
    type?: AuditLogType;
    keyword?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AuditLogDTO[]>;
}
