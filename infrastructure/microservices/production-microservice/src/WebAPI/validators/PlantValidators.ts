export function validatePlantCreate(data: any): { success: boolean; message?: string } {
  if (!data) return { success: false, message: 'No data' };
  if (!data.commonName || !data.latinName || !data.originCountry) return { success: false, message: 'Missing required fields' };
  return { success: true };
}

export function validateChangeStrength(data: any): { success: boolean; message?: string } {
  if (!data) return { success: false, message: 'No data' };
  if (!data.plantId || typeof data.percent !== 'number') return { success: false, message: 'plantId and percent required' };
  return { success: true };
}

export function validateHarvest(data: any): { success: boolean; message?: string } {
  if (!data) return { success: false, message: 'No data' };
  if (!data.latinName || typeof data.count !== 'number') return { success: false, message: 'latinName and count required' };
  return { success: true };
}
