import { AuditLogDTO } from "../../models/audit/AuditLogDTO";
import { IAuditAPI } from "./IAuditAPI";

const BASE_URL = "http://localhost:5000/api/v1";

export class AuditAPI implements IAuditAPI {
  async getAllLogs(token: string): Promise<AuditLogDTO[]> {
    const res = await fetch(`${BASE_URL}/audit/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Greška pri dohvatu logova.");
    return res.json();
  }

  async getLogById(token: string, id: string): Promise<AuditLogDTO> {
    const res = await fetch(`${BASE_URL}/audit/logs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Log nije pronađen.");
    return res.json();
  }

  async createLog(token: string, data: { type: string; description: string }): Promise<AuditLogDTO> {
    const res = await fetch(`${BASE_URL}/audit/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Greška pri kreiranju loga.");
    }
    return res.json();
  }

  async updateLog(
    token: string,
    id: string,
    data: { type?: string; description?: string }
  ): Promise<AuditLogDTO> {
    const res = await fetch(`${BASE_URL}/audit/logs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Greška pri ažuriranju loga.");
    }
    return res.json();
  }

  async deleteLog(token: string, id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/audit/logs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Greška pri brisanju loga.");
    return res.json();
  }

  async searchLogs(
    token: string,
    query: { type?: string; keyword?: string; dateFrom?: string; dateTo?: string }
  ): Promise<AuditLogDTO[]> {
    const params = new URLSearchParams();
    if (query.type) params.set("type", query.type);
    if (query.keyword) params.set("keyword", query.keyword);
    if (query.dateFrom) params.set("dateFrom", query.dateFrom);
    if (query.dateTo) params.set("dateTo", query.dateTo);

    const res = await fetch(`${BASE_URL}/audit/logs/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Greška pri pretrazi logova.");
    return res.json();
  }
}
