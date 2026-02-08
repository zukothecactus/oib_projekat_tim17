import { Repository, In } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { IPackagingService } from '../Domain/services/IPackagingService';
import { Package } from '../Domain/models/Package';
import { PackageStatus } from '../Domain/enums/PackageStatus';
import { sendAuditLog } from '../utils/AuditClient';

export class PackagingService implements IPackagingService {
  private repo: Repository<Package>;
  private processingClient: AxiosInstance;

  constructor(repo: Repository<Package>) {
    this.repo = repo;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API || 'http://localhost:5003/api/v1';
    this.processingClient = axios.create({
      baseURL: processingBaseURL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
  }

  async packPerfumes(data: {
    name: string;
    senderAddress: string;
    perfumeType: string;
    count: number;
    perfumeIds?: string[];
  }): Promise<Package> {
    let perfumeIds: string[];

    if (data.perfumeIds && data.perfumeIds.length > 0) {
      // Use directly selected perfume IDs
      perfumeIds = data.perfumeIds;
    } else {
      // Fallback: get available perfumes from processing microservice
      const response = await this.processingClient.get('/processing/perfumes/available', {
        params: { type: data.perfumeType, count: data.count },
      });

      const availablePerfumes: { id: string }[] = response.data.list ?? [];

      if (availablePerfumes.length < data.count) {
        throw new Error(
          `Nedovoljno dostupnih parfema. Potrebno: ${data.count}, dostupno: ${availablePerfumes.length}`
        );
      }

      perfumeIds = availablePerfumes.slice(0, data.count).map((p) => p.id);
    }

    // 2. Check for duplicates — ensure no perfume is already in another package
    const existingPackages = await this.repo.find();
    const alreadyPackedIds = new Set<string>();
    for (const pkg of existingPackages) {
      if (pkg.perfumeIds && Array.isArray(pkg.perfumeIds)) {
        for (const pid of pkg.perfumeIds) {
          alreadyPackedIds.add(pid);
        }
      }
    }

    const duplicates = perfumeIds.filter((id) => alreadyPackedIds.has(id));
    if (duplicates.length > 0) {
      throw new Error(
        `Parfemi su vec spakovani u drugu ambalazu: ${duplicates.join(', ')}`
      );
    }

    // 3. Create package
    const pkg = this.repo.create({
      name: data.name,
      senderAddress: data.senderAddress,
      warehouseId: null,
      perfumeIds,
      status: PackageStatus.SPAKOVANA,
    });

    const saved = await this.repo.save(pkg);
    sendAuditLog('INFO', `Pakovanje: spakovana ambalaza "${saved.name}" sa ${perfumeIds.length} parfema (ID: ${saved.id})`);
    return saved;
  }

  async sendToWarehouse(packageId: string, warehouseId: string): Promise<Package> {
    const target = await this.repo.findOne({ where: { id: packageId } });

    if (!target) {
      throw new Error(`Ambalaza sa ID-em ${packageId} nije pronadjena`);
    }

    if (target.status !== PackageStatus.SPAKOVANA) {
      throw new Error('Ambalaza je vec poslata u skladiste');
    }

    if (target.warehouseId) {
      throw new Error('Ambalaza je vec dodeljena skladistu');
    }

    target.warehouseId = warehouseId;
    target.status = PackageStatus.POSLATA;

    const saved = await this.repo.save(target);
    sendAuditLog('INFO', `Pakovanje: ambalaza "${saved.name}" (ID: ${saved.id}) poslata u skladiste ${warehouseId}`);
    return saved;
  }

  async listPackages(): Promise<Package[]> {
    return await this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async getPackageById(id: string): Promise<Package> {
    const pkg = await this.repo.findOne({ where: { id } });
    if (!pkg) {
      throw new Error(`Ambalaza sa ID-em ${id} nije pronadjena`);
    }
    return pkg;
  }
}
