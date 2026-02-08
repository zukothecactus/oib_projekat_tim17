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
  const { plantId } = data;
  if (plantId !== undefined && plantId !== null && typeof plantId !== "string") {
    return { success: false, message: "Invalid plantId" };
  }
  return { success: true };
}

export function validateStartProcessing(data: any): { success: boolean; message?: string } {
  if (!data) return { success: false, message: "No data" };
  const { perfumeName, perfumeType, bottleCount, bottleVolume, latinName } = data;
  if (!perfumeName || typeof perfumeName !== "string") {
    return { success: false, message: "Missing or invalid perfumeName" };
  }
  if (!perfumeType || !Object.values(PerfumeType).includes(perfumeType)) {
    return { success: false, message: "Invalid perfumeType" };
  }
  if (typeof bottleCount !== "number" || bottleCount < 1 || !Number.isInteger(bottleCount)) {
    return { success: false, message: "Invalid bottleCount" };
  }
  if (bottleVolume !== 150 && bottleVolume !== 250) {
    return { success: false, message: "Invalid bottleVolume (must be 150 or 250)" };
  }
  if (!latinName || typeof latinName !== "string") {
    return { success: false, message: "Missing or invalid latinName" };
  }
  return { success: true };
}
