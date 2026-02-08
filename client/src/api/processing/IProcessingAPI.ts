import { PerfumeDTO } from "../../models/processing/PerfumeDTO";

export interface IProcessingAPI {
  listPerfumes(token: string): Promise<PerfumeDTO[]>;
  createPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber?: string;
    expiresAt: string;
    status?: string;
    plantId?: string;
  }, token: string): Promise<PerfumeDTO>;
  startProcessing(data: {
    perfumeName: string;
    perfumeType: string;
    bottleCount: number;
    bottleVolume: number;
    latinName: string;
  }, token: string): Promise<PerfumeDTO[]>;
  getAvailablePerfumes(type: string, count: number, token: string): Promise<PerfumeDTO[]>;
}
