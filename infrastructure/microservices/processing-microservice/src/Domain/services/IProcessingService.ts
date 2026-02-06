import { Perfume } from "../models/Perfume";

export interface IProcessingService {
  createPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber: string;
    expiresAt: string;
    status: string;
  }): Promise<Perfume>;

  listPerfumes(): Promise<Perfume[]>;
}
