import { Like, Between, FindOptionsWhere } from "typeorm";
import { Db } from "../Database/DbConnectionPool";
import { AuditLog } from "../Domain/models/AuditLog";
import { AuditLogDTO } from "../Domain/DTOs/AuditLogDTO";
import { AuditLogType } from "../Domain/enums/AuditLogType";
import { IAuditService } from "../Domain/services/IAuditService";

export class AuditService implements IAuditService {
  private repo = Db.getRepository(AuditLog);

  async createLog(type: AuditLogType, description: string): Promise<AuditLogDTO> {
    const log = this.repo.create({ type, description });
    const saved = await this.repo.save(log);
    return saved as AuditLogDTO;
  }

  async getAllLogs(): Promise<AuditLogDTO[]> {
    const logs = await this.repo.find({ order: { createdAt: "DESC" } });
    return logs as AuditLogDTO[];
  }

  async getLogById(id: string): Promise<AuditLogDTO | null> {
    const log = await this.repo.findOneBy({ id });
    return log ? (log as AuditLogDTO) : null;
  }

  async updateLog(id: string, type?: AuditLogType, description?: string): Promise<AuditLogDTO | null> {
    const log = await this.repo.findOneBy({ id });
    if (!log) return null;

    if (type !== undefined) log.type = type;
    if (description !== undefined) log.description = description;

    const updated = await this.repo.save(log);
    return updated as AuditLogDTO;
  }

  async deleteLog(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async searchLogs(query: {
    type?: AuditLogType;
    keyword?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AuditLogDTO[]> {
    const where: FindOptionsWhere<AuditLog> = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.keyword) {
      where.description = Like(`%${query.keyword}%`);
    }

    if (query.dateFrom && query.dateTo) {
      where.createdAt = Between(new Date(query.dateFrom), new Date(query.dateTo));
    }

    const logs = await this.repo.find({ where, order: { createdAt: "DESC" } });
    return logs as AuditLogDTO[];
  }
}
