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

  async getAllPlants(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<PlantDTO[]> = await this.axiosInstance.get("/plants", {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async getPlantById(id: number, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.get(`/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async createPlant(plant: PlantDTO, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.post("/plants", plant, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async updatePlant(id: number, plant: PlantDTO, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.put(`/plants/${id}`, plant, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async deletePlant(id: number, token: string): Promise<void> {
    await this.axiosInstance.delete(`/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }
}