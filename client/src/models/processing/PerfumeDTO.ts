export type PerfumeType = "Parfem" | "Kolonjska voda";
export type PerfumeStatus = "U izradi" | "Zavrseno";

export type PerfumeDTO = {
  id: string;
  name: string;
  type: PerfumeType;
  volume: number;
  serialNumber: string;
  expiresAt: string;
  status: PerfumeStatus;
  createdAt: string;
};
