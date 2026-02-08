import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ISalesAPI, PurchaseInput } from "./ISalesAPI";
import { InvoiceDTO, CatalogItemDTO } from "../../models/sales/SalesDTO";

export class SalesAPI implements ISalesAPI {
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

  async getCatalog(token: string): Promise<CatalogItemDTO[]> {
    const response: AxiosResponse<{ list: CatalogItemDTO[] }> = await this.axiosInstance.get(
      "/sales/catalog",
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }

  async purchase(data: PurchaseInput, token: string): Promise<InvoiceDTO> {
    const response: AxiosResponse<{ invoice: InvoiceDTO }> = await this.axiosInstance.post(
      "/sales/purchase",
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.invoice;
  }

  async listInvoices(token: string): Promise<InvoiceDTO[]> {
    const response: AxiosResponse<{ list: InvoiceDTO[] }> = await this.axiosInstance.get(
      "/sales/invoices",
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }

  async getInvoiceById(id: string, token: string): Promise<InvoiceDTO> {
    const response: AxiosResponse<{ invoice: InvoiceDTO }> = await this.axiosInstance.get(
      `/sales/invoices/${id}`,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.invoice;
  }
}
