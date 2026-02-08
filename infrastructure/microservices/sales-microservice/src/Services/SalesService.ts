import axios from "axios";
import { Repository } from "typeorm";
import { ISalesService, PurchaseInput, CatalogItem } from "../Domain/services/ISalesService";
import { Invoice, InvoiceItem } from "../Domain/models/Invoice";
import { sendAuditLog } from "../utils/AuditClient";

const PROCESSING_API = process.env.PROCESSING_SERVICE_API || "http://localhost:5003/api/v1";
const STORAGE_API = process.env.STORAGE_SERVICE_API || "http://localhost:5006/api/v1";
const ANALYTICS_API = process.env.ANALYTICS_SERVICE_API || "http://localhost:5008/api/v1";

export class SalesService implements ISalesService {
  constructor(private readonly invoiceRepo: Repository<Invoice>) {}

  /**
   * Fetches the catalog from the processing microservice.
   * Only returns perfumes with status "Zavrseno".
   */
  async getCatalog(): Promise<CatalogItem[]> {
    const response = await axios.get(`${PROCESSING_API}/processing/perfumes`);
    const allPerfumes: CatalogItem[] = response.data.list ?? [];
    return allPerfumes.filter((p) => p.status === "Zavrseno");
  }

  /**
   * Processes a purchase:
   * 1. Fetch catalog to get perfume details & prices
   * 2. Calculate total bottles and required packaging
   * 3. Call storage to dispatch packages
   * 4. Create and save the invoice
   */
  async purchase(data: PurchaseInput): Promise<Invoice> {
    // 1. Get catalog for perfume details
    const catalog = await this.getCatalog();
    const catalogMap = new Map<string, CatalogItem>();
    for (const item of catalog) {
      catalogMap.set(item.id, item);
    }

    // 2. Build invoice items and calculate totals
    const invoiceItems: InvoiceItem[] = [];
    let totalBottles = 0;

    for (const reqItem of data.items) {
      const perfume = catalogMap.get(reqItem.perfumeId);
      if (!perfume) {
        throw new Error(`Parfem sa ID "${reqItem.perfumeId}" nije pronađen u katalogu.`);
      }

      // Price based on volume: 150ml base, 250ml = 1.5x base
      const unitPrice = perfume.volume === 250 ? 13200 : 8900;

      invoiceItems.push({
        perfumeId: perfume.id,
        perfumeName: perfume.name,
        quantity: reqItem.quantity,
        unitPrice,
      });
      totalBottles += reqItem.quantity;
    }

    // 3. Calculate how many packages we need (each package holds ~12 bottles)
    const BOTTLES_PER_PACKAGE = 12;
    const packagesNeeded = Math.ceil(totalBottles / BOTTLES_PER_PACKAGE);

    // 4. Request packages from storage
    try {
      await axios.post(`${STORAGE_API}/storage/send-to-sales`, {
        count: packagesNeeded,
      });
    } catch (err) {
      // Storage dispatch is best-effort; log but don't block the sale
      sendAuditLog("WARNING", `Skladište nije moglo da isporuči ${packagesNeeded} ambalaža za prodaju.`);
    }

    // 5. Calculate total amount
    const totalAmount = invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // 6. Create and save the invoice
    const invoice = this.invoiceRepo.create({
      saleType: data.saleType,
      paymentMethod: data.paymentMethod,
      items: invoiceItems,
      totalAmount,
    });

    const saved = await this.invoiceRepo.save(invoice);

    sendAuditLog(
      "INFO",
      `Kreirana faktura ${saved.id}: ${data.saleType}, ${data.paymentMethod}, iznos ${totalAmount} RSD`
    );

    // Pošalji podatke o prodaji analitičkom mikroservisu
    try {
      await axios.post(`${ANALYTICS_API}/analytics/record-sale`, {
        invoiceId: saved.id,
        saleType: data.saleType,
        paymentMethod: data.paymentMethod,
        items: invoiceItems,
        totalAmount,
        saleDate: new Date().toISOString(),
      });
    } catch (err) {
      sendAuditLog("WARNING", `Nije uspjelo slanje podataka analitici za fakturu ${saved.id}`);
    }

    return saved;
  }

  async listInvoices(): Promise<Invoice[]> {
    return this.invoiceRepo.find({ order: { createdAt: "DESC" } });
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    return this.invoiceRepo.findOne({ where: { id } });
  }
}
