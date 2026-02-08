export enum SaleType {
  MALOPRODAJA = "MALOPRODAJA",
  VELEPRODAJA = "VELEPRODAJA",
}

export enum PaymentMethod {
  GOTOVINA = "GOTOVINA",
  UPLATA_NA_RACUN = "UPLATA_NA_RACUN",
  KARTICNO = "KARTICNO",
}

export interface InvoiceItemDTO {
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceDTO {
  id: string;
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  items: InvoiceItemDTO[];
  totalAmount: number;
  createdAt: string;
}

export interface CatalogItemDTO {
  id: string;
  name: string;
  type: string;
  volume: number;
  serialNumber: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}
