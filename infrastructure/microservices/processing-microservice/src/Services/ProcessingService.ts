import { Repository } from 'typeorm';
import { IProcessingService } from '../Domain/services/IProcessingService';
import { Perfume } from '../Domain/models/Perfume';
import { PerfumeType } from '../Domain/enums/PerfumeType';
import { PerfumeStatus } from '../Domain/enums/PerfumeStatus';
import { sendAuditLog } from '../utils/AuditClient';

export class ProcessingService implements IProcessingService {
  private repo: Repository<Perfume>;

  constructor(repo: Repository<Perfume>) {
    this.repo = repo;
  }

  async createPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber: string;
    expiresAt: string;
    status: string;
  }): Promise<Perfume> {
    const perfume = this.repo.create({
      name: data.name,
      type: data.type as PerfumeType,
      volume: data.volume,
      serialNumber: data.serialNumber,
      expiresAt: data.expiresAt,
      status: data.status as PerfumeStatus,
    });
    const saved = await this.repo.save(perfume);
    if (!saved.serialNumber) {
      saved.serialNumber = `PP-2025-${saved.id}`;
      const final = await this.repo.save(saved);
      sendAuditLog('INFO', `Kreiran parfem: ${final.name}, ${final.volume}ml, tip: ${final.type}`);
      return final;
    }
    sendAuditLog('INFO', `Kreiran parfem: ${saved.name}, ${saved.volume}ml, tip: ${saved.type}`);
    return saved;
  }

  async listPerfumes(): Promise<Perfume[]> {
    return await this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
