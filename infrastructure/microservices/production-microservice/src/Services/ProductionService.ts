import { Repository } from 'typeorm';
import { IProductionService } from '../Domain/services/IProductionService';
import { Plant } from '../Domain/models/Plant';
import { PlantStatus } from '../Domain/enums/PlantStatus';
import { sendAuditLog } from '../utils/AuditClient';

export class ProductionService implements IProductionService {
  private repo: Repository<Plant>;

  constructor(repo: Repository<Plant>) {
    this.repo = repo;
  }

  public async plantNew(commonName: string, latinName: string, originCountry: string): Promise<Plant> {
    const aromaticStrength = Number((Math.random() * 4 + 1).toFixed(2));
    const plant = this.repo.create({ commonName, latinName, originCountry, aromaticStrength, status: PlantStatus.POSADJENA });
    const saved = await this.repo.save(plant);
    sendAuditLog('INFO', `Zasađena nova biljka: ${commonName} (${latinName}) iz ${originCountry}`);
    return saved;
  }

  public async changeAromaticStrengthPercent(plantId: string, percent: number): Promise<Plant | null> {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) return null;

    const multiplier = 1 + percent / 100;
    let newVal = Number((Number(plant.aromaticStrength) * multiplier).toFixed(2));
    if (newVal < 1.0) newVal = 1.0;
    if (newVal > 5.0) newVal = 5.0;

    plant.aromaticStrength = newVal as any;
    const saved = await this.repo.save(plant);
    sendAuditLog('INFO', `Promijenjena aromatska jačina biljke ${plant.commonName} za ${percent}% (nova: ${newVal})`);
    return saved;
  }

  public async harvestByLatinName(latinName: string, count: number): Promise<Plant[]> {
    const candidates = await this.repo.find({ where: { latinName, status: PlantStatus.POSADJENA }, take: count });
    for (const p of candidates) {
      p.status = PlantStatus.UBRANA;
      await this.repo.save(p);
    }
    sendAuditLog('INFO', `Ubrano ${candidates.length} biljaka vrste ${latinName}`);
    return candidates;
  }

  public async listPlants(): Promise<Plant[]> {
    return await this.repo.find();
  }
}
