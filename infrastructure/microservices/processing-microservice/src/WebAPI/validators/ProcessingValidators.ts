import { PerfumeType } from "../../Domain/enums/PerfumeType";
import { PerfumeStatus } from "../../Domain/enums/PerfumeStatus";

export function validatePerfumeCreate(data: any): { success: boolean; message?: string } {
  if (!data) return { success: false, message: "No data" };
  const { name, type, volume, serialNumber, expiresAt, status } = data;
  if (!name || !type || !volume || !expiresAt) {
    return { success: false, message: "Missing required fields" };
  }
  if (!Object.values(PerfumeType).includes(type)) {
    return { success: false, message: "Invalid type" };
  }
  if (status && !Object.values(PerfumeStatus).includes(status)) {
    return { success: false, message: "Invalid status" };
  }
  if (typeof volume !== "number" || volume <= 0) {
    return { success: false, message: "Invalid volume" };
  }
  if (volume !== 150 && volume !== 250) {
    return { success: false, message: "Invalid volume" };
  }
  if (serialNumber && typeof serialNumber !== "string") {
    return { success: false, message: "Invalid serial number" };
  }
  return { success: true };
}
