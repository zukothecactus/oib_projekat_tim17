export enum AuditLogType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export interface AuditLogDTO {
  id: string;
  type: AuditLogType;
  description: string;
  createdAt: string;
}
