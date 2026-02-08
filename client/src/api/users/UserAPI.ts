import axios, { AxiosInstance } from "axios";
import { IUserAPI, UpdateUserData } from "./IUserAPI";
import { UserDTO } from "../../models/users/UserDTO";

export class UserAPI implements IUserAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAllUsers(token: string): Promise<UserDTO[]> {
    return (
      await this.axiosInstance.get<UserDTO[]>("/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async getUserById(token: string, id: number): Promise<UserDTO> {
    return (
      await this.axiosInstance.get<UserDTO>(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async updateUser(token: string, id: number, data: UpdateUserData): Promise<UserDTO> {
    return (
      await this.axiosInstance.put<UserDTO>(`/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async deleteUser(token: string, id: number): Promise<void> {
    await this.axiosInstance.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async searchUsers(token: string, query: string): Promise<UserDTO[]> {
    return (
      await this.axiosInstance.get<UserDTO[]>("/users/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query },
      })
    ).data;
  }
}
