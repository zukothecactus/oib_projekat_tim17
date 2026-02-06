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
  }, token: string): Promise<PerfumeDTO>;
}
