import { AuditLogType } from "../enums/AuditLogType";

export interface AuditLogDTO {
  id: string;
  type: AuditLogType;
  description: string;
  createdAt: Date;
}
