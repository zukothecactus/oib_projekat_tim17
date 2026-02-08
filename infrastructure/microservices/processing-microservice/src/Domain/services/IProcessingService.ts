import { Perfume } from "../models/Perfume";
import { PerfumeType } from "../enums/PerfumeType";

export interface IProcessingService {
  createPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber: string;
    expiresAt: string;
    status: string;
    plantId?: string;
  }): Promise<Perfume>;

  listPerfumes(): Promise<Perfume[]>;

  startProcessing(params: {
    perfumeName: string;
    perfumeType: 'Parfem' | 'Kolonjska voda';
    bottleCount: number;
    bottleVolume: 150 | 250;
    latinName: string;
  }): Promise<Perfume[]>;

  getPerfumesByTypeAndCount(type: PerfumeType, count: number): Promise<Perfume[]>;
}
