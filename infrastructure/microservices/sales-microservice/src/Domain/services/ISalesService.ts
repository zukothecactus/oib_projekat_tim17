import { Invoice } from "../models/Invoice";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export interface PurchaseItemInput {
  perfumeId: string;
  quantity: number;
}

export interface PurchaseInput {
  items: PurchaseItemInput[];
  saleType: SaleType;
  paymentMethod: PaymentMethod;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: string;
  volume: number;
  serialNumber: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}

export interface ISalesService {
  getCatalog(): Promise<CatalogItem[]>;
  purchase(data: PurchaseInput): Promise<Invoice>;
  listInvoices(): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | null>;
}
