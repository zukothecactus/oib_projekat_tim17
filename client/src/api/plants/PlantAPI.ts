import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { IPlantAPI } from "./IPlantAPI";

export class PlantAPI implements IPlantAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async listPlants(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<{ list: PlantDTO[] }> = await this.axiosInstance.get(
      "/production/plants",
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }

  async plantNew(
    data: { commonName: string; latinName: string; originCountry: string },
    token: string
  ): Promise<PlantDTO> {
    const response: AxiosResponse<{ plant: PlantDTO }> = await this.axiosInstance.post(
      "/production/plant",
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.plant;
  }

  async changeStrength(
    plantId: string,
    percent: number,
    token: string
  ): Promise<PlantDTO> {
    const response: AxiosResponse<{ plant: PlantDTO }> = await this.axiosInstance.post(
      "/production/change-strength",
      { plantId, percent },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.plant;
  }

  async harvest(latinName: string, count: number, token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<{ harvested: PlantDTO[] }> = await this.axiosInstance.post(
      "/production/harvest",
      { latinName, count },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.harvested ?? [];
  }
}