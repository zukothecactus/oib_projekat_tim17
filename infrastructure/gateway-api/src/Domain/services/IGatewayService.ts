import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Production
  listProductionPlants(): Promise<any>;
  plantNew(data: { commonName: string; latinName: string; originCountry: string }): Promise<any>;
  changeStrength(data: { plantId: string; percent: number }): Promise<any>;
  harvest(data: { latinName: string; count: number }): Promise<any>;

  // Processing
  listProcessingPerfumes(): Promise<any>;
  createProcessingPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber?: string;
    expiresAt: string;
    status?: string;
    plantId?: string;
  }): Promise<any>;
  startProcessing(data: {
    perfumeName: string;
    perfumeType: string;
    bottleCount: number;
    bottleVolume: number;
    latinName: string;
  }): Promise<any>;
  getAvailablePerfumes(type: string, count: number): Promise<any>;

  // Packaging
  packPerfumes(data: { name: string; senderAddress: string; perfumeType: string; count: number; perfumeIds?: string[] }): Promise<any>;
  sendToWarehouse(data: { packageId: string; warehouseId: string }): Promise<any>;
  listPackages(): Promise<any>;
  getPackageById(id: string): Promise<any>;
}
