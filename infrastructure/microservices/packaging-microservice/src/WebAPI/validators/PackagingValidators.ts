export function validatePackPerfumes(data: any): { success: boolean; message?: string } {
  if (!data) return { success: false, message: "No data" };
  const { name, senderAddress, perfumeType, count } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    return { success: false, message: "Missing or invalid name" };
  }
  if (!senderAddress || typeof senderAddress !== "string" || !senderAddress.trim()) {
    return { success: false, message: "Missing or invalid senderAddress" };
  }
  if (!perfumeType || typeof perfumeType !== "string") {
    return { success: false, message: "Missing or invalid perfumeType" };
  }
  if (perfumeType !== "Parfem" && perfumeType !== "Kolonjska voda") {
    return { success: false, message: "perfumeType must be 'Parfem' or 'Kolonjska voda'" };
  }
  if (typeof count !== "number" || count < 1 || !Number.isInteger(count)) {
    return { success: false, message: "Invalid count (must be a positive integer)" };
  }
  return { success: true };
}

export function validateSendToWarehouse(data: any): { success: boolean; message?: string } {
  if (!data) return { success: false, message: "No data" };
  const { packageId, warehouseId } = data;

  if (!packageId || typeof packageId !== "string" || !packageId.trim()) {
    return { success: false, message: "Missing or invalid packageId" };
  }
  if (!warehouseId || typeof warehouseId !== "string" || !warehouseId.trim()) {
    return { success: false, message: "Missing or invalid warehouseId" };
  }
  return { success: true };
}
