import { InvoiceDTO, CatalogItemDTO } from "../../models/sales/SalesDTO";

export interface PurchaseInput {
  items: { perfumeId: string; quantity: number }[];
  saleType: string;
  paymentMethod: string;
}

export interface ISalesAPI {
  getCatalog(token: string): Promise<CatalogItemDTO[]>;
  purchase(data: PurchaseInput, token: string): Promise<InvoiceDTO>;
  listInvoices(token: string): Promise<InvoiceDTO[]>;
  getInvoiceById(id: string, token: string): Promise<InvoiceDTO>;
}
