import axios from "axios";

const AUDIT_API = process.env.AUDIT_SERVICE_API || "http://localhost:5004/api/v1";

export function sendAuditLog(type: "INFO" | "WARNING" | "ERROR", description: string): void {
  axios.post(`${AUDIT_API}/audit/logs`, { type, description }).catch(() => {});
}
