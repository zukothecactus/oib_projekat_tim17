import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { IProcessingService } from '../Domain/services/IProcessingService';
import { Perfume } from '../Domain/models/Perfume';
import { PerfumeType } from '../Domain/enums/PerfumeType';
import { PerfumeStatus } from '../Domain/enums/PerfumeStatus';
import { sendAuditLog } from '../utils/AuditClient';

interface HarvestedPlant {
  id: string;
  commonName: string;
  latinName: string;
  originCountry: string;
  aromaticStrength: number;
  status: string;
}

export class ProcessingService implements IProcessingService {
  private repo: Repository<Perfume>;
  private productionClient: AxiosInstance;

  constructor(repo: Repository<Perfume>) {
    this.repo = repo;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API || 'http://localhost:5100/api/v1';
    this.productionClient = axios.create({
      baseURL: productionBaseURL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
  }

  async createPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber: string;
    expiresAt: string;
    status: string;
    plantId?: string;
  }): Promise<Perfume> {
    const perfume = this.repo.create({
      name: data.name,
      type: data.type as PerfumeType,
      volume: data.volume,
      serialNumber: data.serialNumber,
      expiresAt: data.expiresAt,
      status: data.status as PerfumeStatus,
      plantId: data.plantId,
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

  async startProcessing(params: {
    perfumeName: string;
    perfumeType: 'Parfem' | 'Kolonjska voda';
    bottleCount: number;
    bottleVolume: 150 | 250;
    latinName: string;
  }): Promise<Perfume[]> {
    const totalVolume = params.bottleCount * params.bottleVolume;
    const requiredPlants = Math.ceil(totalVolume / 50);

    // Process (consume) harvested plants from production microservice
    const processResponse = await this.productionClient.post('/production/process-plants', {
      latinName: params.latinName,
      count: requiredPlants,
    });

    const harvested: HarvestedPlant[] = processResponse.data.processed ?? [];

    if (harvested.length < requiredPlants) {
      throw new Error(
        `Nedovoljno biljaka za preradu. Potrebno: ${requiredPlants}, ubrano: ${harvested.length}`
      );
    }

    // Process aromatic strength for each harvested plant
    for (const plant of harvested) {
      if (plant.aromaticStrength > 4.0) {
        // Plant a new replacement plant
        const plantResponse = await this.productionClient.post('/production/plant', {
          commonName: plant.commonName,
          latinName: plant.latinName,
          originCountry: plant.originCountry,
        });
        const newPlant = plantResponse.data.plant;

        // Calculate strength reduction percentage
        // If strength is 4.65, deviation from 4.00 is 0.65, that's 65%
        // Need to reduce to 65% of current, so percent = -35 (reduce by 35%)
        const deviation = plant.aromaticStrength - 4.0;
        const deviationPercent = Math.round((deviation / 1.0) * 100);
        const percent = -(100 - deviationPercent);

        await this.productionClient.post('/production/change-strength', {
          plantId: newPlant.id,
          percent,
        });

        sendAuditLog('INFO',
          `Prerada: biljka ${plant.commonName} (jacina ${plant.aromaticStrength}) prelazi granicu 4.0 — ` +
          `zasadjena zamenska biljka (ID: ${newPlant.id}), jacina smanjena na ${deviationPercent}% trenutne vrednosti`
        );
      }
    }

    // Create perfume bottles
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);
    const expiresAtStr = expiresAt.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const createdPerfumes: Perfume[] = [];

    for (let i = 0; i < params.bottleCount; i++) {
      // Distribute plants across bottles
      const plantIndex = i % harvested.length;
      const perfume = this.repo.create({
        name: params.perfumeName,
        type: params.perfumeType as PerfumeType,
        volume: params.bottleVolume,
        serialNumber: `PP-2025-${uuidv4()}`,
        expiresAt: expiresAtStr,
        status: PerfumeStatus.DONE,
        plantId: harvested[plantIndex].id,
      });
      const saved = await this.repo.save(perfume);
      createdPerfumes.push(saved);
    }

    sendAuditLog('INFO', `Prerada: zavrsena prerada ${createdPerfumes.length} bocica parfema "${params.perfumeName}" (${params.bottleVolume}ml, ${params.perfumeType}) od ${harvested.length} biljaka`);
    return createdPerfumes;
  }

  async getPerfumesByTypeAndCount(type: PerfumeType, count: number): Promise<Perfume[]> {
    return await this.repo.find({
      where: { type, status: PerfumeStatus.DONE },
      take: count,
      order: { createdAt: 'DESC' },
    });
  }
}
