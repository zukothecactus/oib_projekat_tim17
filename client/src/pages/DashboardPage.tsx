import React, { useMemo, useState, useEffect } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO, PlantStatus } from "../models/plants/PlantDTO";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";
import { PerfumeDTO, type PerfumeStatus, type PerfumeType } from "../models/processing/PerfumeDTO";
import { IStorageAPI } from "../api/storage/IStorageAPI";
import { WarehouseDTO } from "../models/storage/WarehouseDTO";
import { StoredPackageDTO } from "../models/storage/StoredPackageDTO";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { UserManagement } from "../components/dashboard/users/UserManagement";
import { AuditLogViewer } from "../components/dashboard/audit/AuditLogViewer";
import { IAuditAPI } from "../api/audit/IAuditAPI";
import { ISalesAPI } from "../api/sales/ISalesAPI";
import { IAnalyticsAPI } from "../api/analytics/IAnalyticsAPI";
import { CatalogItemDTO, InvoiceDTO, SaleType, PaymentMethod } from "../models/sales/SalesDTO";
import { useAuth } from "../hooks/useAuthHook";
import { AnalyticsView } from "../components/dashboard/analytics/AnalyticsView";

export type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
  processingAPI: IProcessingAPI;
  storageAPI: IStorageAPI;
  auditAPI: IAuditAPI;
  salesAPI: ISalesAPI;
  analyticsAPI: IAnalyticsAPI;
};

type PlantStatusLabel = "Posađena" | "Ubrana" | "Prerađena";

type PlantRow = {
  id: string;
  name: string;
  latinName: string;
  strength: number;
  country: string;
  status: PlantStatusLabel;
};

type InvoiceRow = {
  id: string;
  saleType: "Maloprodaja" | "Veleprodaja";
  payment: "Gotovina" | "Uplata na račun" | "Kartično";
  amount: number;
  date: string;
};

type PackageStatus = "Spakovana" | "Poslata";

type PackageItem = {
  id: string;
  perfumeName: string;
  volume: number;
  count: number;
};

type PackagingRow = {
  id: string;
  warehouse: string;
  status: PackageStatus;
  items: PackageItem[];
};

type ProductionLogType = "INFO" | "WARNING" | "ERROR";

type ProductionLog = {
  id: string;
  type: ProductionLogType;
  message: string;
  time: string;
};

const plantsSeed: PlantRow[] = [];

const invoicesSeed: InvoiceRow[] = [
  { id: "FR-2025-001", saleType: "Maloprodaja", payment: "Kartično", amount: 12500, date: "22.10.2025" },
  { id: "FR-2025-002", saleType: "Veleprodaja", payment: "Uplata na račun", amount: 45800, date: "21.10.2025" },
  { id: "FR-2025-003", saleType: "Maloprodaja", payment: "Gotovina", amount: 8900, date: "21.10.2025" },
];



const packagingSeed: PackagingRow[] = [
  {
    id: "AMB-2025-101",
    warehouse: "Centralno skladište",
    status: "Spakovana",
    items: [
      { id: "pkg-1", perfumeName: "Rosa Mistika", volume: 250, count: 12 },
      { id: "pkg-2", perfumeName: "Lavander Noir", volume: 150, count: 18 },
    ],
  },
  {
    id: "AMB-2025-102",
    warehouse: "Severno skladište",
    status: "Poslata",
    items: [
      { id: "pkg-3", perfumeName: "Bergamot Esenc", volume: 250, count: 10 },
      { id: "pkg-4", perfumeName: "Jasmin De Nuj", volume: 150, count: 16 },
    ],
  },
  {
    id: "AMB-2025-103",
    warehouse: "Južno skladište",
    status: "Spakovana",
    items: [
      { id: "pkg-5", perfumeName: "Lavander Noir", volume: 150, count: 20 },
    ],
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI, processingAPI, auditAPI, storageAPI, salesAPI, analyticsAPI }) => {
  const appIconUrl = `${import.meta.env.BASE_URL}icon.png`;
  const { token, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"Pregled" | "Proizvodnja" | "Prerada" | "Pakovanje" | "Skladištenje" | "Prodaja" | "Korisnici" | "Evidencija" | "Analiza prodaje">("Pregled");
  const [plantQuery, setPlantQuery] = useState("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [productionTab, setProductionTab] = useState<"Servis proizvodnje" | "Servis prerade">("Servis proizvodnje");
  const [productionAction, setProductionAction] = useState<"plant" | "harvest" | "change-strength">("plant");
  const [storageTab, setStorageTab] = useState<"Servis skladištenja" | "Servis prodaje">("Servis skladištenja");
  const [packagingForm, setPackagingForm] = useState({
    perfumeName: "",
    volume: 150,
    count: 1,
    warehouse: "Centralno skladište",
  });
  const [selectedPackageId, setSelectedPackageId] = useState(packagingSeed[0]?.id ?? "");
  const [productionPlants, setProductionPlants] = useState<PlantDTO[]>([]);
  const [productionLoading, setProductionLoading] = useState(false);
  const [productionError, setProductionError] = useState<string | null>(null);
  const [productionNotice, setProductionNotice] = useState<string | null>(null);
  const [plantForm, setPlantForm] = useState({ commonName: "", latinName: "", originCountry: "" });
  const [harvestForm, setHarvestForm] = useState({ latinName: "", count: 1 });
  const [changeForm, setChangeForm] = useState({ plantId: "", percent: 0 });
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);
  const [processingForm, setProcessingForm] = useState({
    name: "",
    type: "Parfem" as PerfumeType,
    volume: 150,
    serial: "",
    expiresAt: "",
    status: "U izradi" as PerfumeStatus,
  });
  const [processingLogs, setProcessingLogs] = useState<ProductionLog[]>([]);
  const [processingPerfumes, setProcessingPerfumes] = useState<PerfumeDTO[]>([]);
  const [processingLoading, setProcessingLoading] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingNotice, setProcessingNotice] = useState<string | null>(null);

  // Storage state
  const [storageWarehouses, setStorageWarehouses] = useState<WarehouseDTO[]>([]);
  const [storagePackages, setStoragePackages] = useState<StoredPackageDTO[]>([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageSendCount, setStorageSendCount] = useState(1);
  const [storageSending, setStorageSending] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [receiveForm, setReceiveForm] = useState({ warehouseId: "", packageName: "", volume: 150, count: 1 });

  // Sales state
  const [salesCatalog, setSalesCatalog] = useState<CatalogItemDTO[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<InvoiceDTO[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [salesNotice, setSalesNotice] = useState<string | null>(null);
  const [salesCart, setSalesCart] = useState<{ perfumeId: string; perfumeName: string; quantity: number; unitPrice: number }[]>([]);
  const [salesSaleType, setSalesSaleType] = useState<string>(SaleType.MALOPRODAJA);
  const [salesPaymentMethod, setSalesPaymentMethod] = useState<string>(PaymentMethod.GOTOVINA);
  const [salesCheckoutLoading, setSalesCheckoutLoading] = useState(false);
  const [salesTab, setSalesTab] = useState<"Katalog" | "Korpa" | "Fakture">("Katalog");

  // Available tabs based on user role
  const availableTabs = useMemo(() => {
    const allTabs = ["Pregled", "Proizvodnja", "Prerada", "Pakovanje", "Skladištenje", "Prodaja"] as const;
    if (authUser?.role?.toUpperCase() === "ADMIN") {
      return allTabs.filter(tab => tab !== "Skladištenje" && tab !== "Prodaja");
    }
    return allTabs;
  }, [authUser?.role]);

  const addProductionLog = (type: ProductionLogType, message: string) => {
    const time = new Date().toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
    setProductionLogs((prev) => [
      { id: `log-${Date.now()}`, type, message, time },
      ...prev,
    ].slice(0, 50));
    // Osvježi iz audit servisa nakon kratkog delay-a (samo za admin)
    if (authUser?.role?.toUpperCase() === "ADMIN") {
      setTimeout(() => fetchProductionAuditLogs(), 1500);
    }
  };

  const addProcessingLog = (type: ProductionLogType, message: string) => {
    const time = new Date().toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
    setProcessingLogs((prev) => [
      { id: `proc-${Date.now()}`, type, message, time },
      ...prev,
    ].slice(0, 50));
    // Osvježi iz audit servisa nakon kratkog delay-a (samo za admin)
    if (authUser?.role?.toUpperCase() === "ADMIN") {
      setTimeout(() => fetchProcessingAuditLogs(), 1500);
    }
  };

  function pickStatus(statuses: Set<PlantStatus>): PlantStatus {
    if (statuses.has("PRERADJENA")) return "PRERADJENA";
    if (statuses.has("UBRANA")) return "UBRANA";
    return "POSADJENA";
  }

  function statusLabel(status: PlantStatus): PlantStatusLabel {
    if (status === "POSADJENA") return "Posađena";
    if (status === "UBRANA") return "Ubrana";
    return "Prerađena";
  }

  function statusClass(status: PlantStatus): string {
    if (status === "POSADJENA") return "status-green";
    if (status === "UBRANA") return "status-yellow";
    return "status-purple";
  }

  const processingStatusClass = (status: PerfumeStatus) => {
    if (status === "Zavrseno") return "status-green";
    return "status-yellow";
  };

  const handleProcessingSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setProcessingError("Niste prijavljeni.");
      setProcessingNotice(null);
      return;
    }
    if (!processingForm.name.trim() || !processingForm.expiresAt.trim()) {
      setProcessingError("Popunite naziv i rok trajanja.");
      setProcessingNotice(null);
      return;
    }

    setProcessingLoading(true);
    setProcessingError(null);
    setProcessingNotice(null);
    try {
      await processingAPI.createPerfume(
        {
          name: processingForm.name.trim(),
          type: processingForm.type,
          volume: processingForm.volume,
          serialNumber: processingForm.serial.trim() || undefined,
          expiresAt: processingForm.expiresAt.trim(),
          status: processingForm.status,
        },
        token
      );
      addProcessingLog("INFO", `Zahtev za preradu: ${processingForm.name.trim()}`);
      setProcessingNotice("Parfem je uspešno dodat.");
      setProcessingForm({
        name: "",
        type: "Parfem" as PerfumeType,
        volume: 150,
        serial: "",
        expiresAt: "",
        status: "U izradi" as PerfumeStatus,
      });
      await fetchProcessingPerfumes();
    } catch (err) {
      setProcessingError("Neuspešna prerada parfema.");
      setProcessingNotice(null);
    } finally {
      setProcessingLoading(false);
    }
  };

  const packageStatusClass = (status: PackageStatus) => {
    return status === "Poslata" ? "status-purple" : "status-green";
  };

  const selectedPackage = packagingSeed.find((pack) => pack.id === selectedPackageId) ?? packagingSeed[0];

  const fetchProcessingPerfumes = async () => {
    if (!token) return;
    setProcessingLoading(true);
    setProcessingError(null);
    try {
      const list = await processingAPI.listPerfumes(token);
      setProcessingPerfumes(list);
    } catch (err) {
      setProcessingError("Ne mogu da učitam listu parfema.");
    } finally {
      setProcessingLoading(false);
    }
  };

  // Storage API functions
  const fetchWarehouses = async () => {
    if (!token) return;
    setStorageLoading(true);
    setStorageError(null);
    try {
      const list = await storageAPI.listWarehouses(token);
      setStorageWarehouses(list);
      if (list.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(list[0].id);
      }
    } catch (err) {
      setStorageError("Ne mogu da učitam skladišta.");
    } finally {
      setStorageLoading(false);
    }
  };

  const fetchWarehousePackages = async (whId?: string) => {
    const id = whId ?? selectedWarehouseId;
    if (!token || !id) return;
    try {
      const list = await storageAPI.getWarehousePackages(id, token);
      setStoragePackages(list);
    } catch {
      setStoragePackages([]);
    }
  };

  const handleSendToSales = async () => {
    if (!token) return;
    setStorageSending(true);
    try {
      await storageAPI.sendToSales(storageSendCount, token);
      await fetchWarehousePackages();
    } catch {
      setStorageError("Greška pri slanju u prodaju.");
    } finally {
      setStorageSending(false);
    }
  };

  const handleReceivePackage = async () => {
    if (!token || !receiveForm.warehouseId) return;
    try {
      await storageAPI.receivePackage(
        receiveForm.warehouseId,
        { name: receiveForm.packageName, volume: receiveForm.volume, count: receiveForm.count },
        token
      );
      await fetchWarehousePackages(receiveForm.warehouseId);
      setReceiveForm({ warehouseId: "", packageName: "", volume: 150, count: 1 });
    } catch {
      setStorageError("Greška pri prijemu ambalaže.");
    }
  };

  const overviewPlants = useMemo<PlantRow[]>(() => {
    if (!productionPlants.length) return plantsSeed;
    return productionPlants.map((plant) => ({
      id: plant.id,
      name: plant.commonName,
      latinName: plant.latinName,
      strength: Number(plant.aromaticStrength),
      country: plant.originCountry,
      status: statusLabel(plant.status),
    }));
  }, [productionPlants]);

  const filteredPlants = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    if (!q) return overviewPlants;
    return overviewPlants.filter((p) =>
      [p.name, p.latinName, p.country, p.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [plantQuery, overviewPlants]);

  const groupedPlants = useMemo(() => {
    const map = new Map<string, { commonName: string; latinName: string; originCountry: string; count: number; strengthSum: number; statuses: Set<PlantStatus> }>();
    for (const plant of productionPlants) {
      const key = plant.latinName;
      if (!map.has(key)) {
        map.set(key, {
          commonName: plant.commonName,
          latinName: plant.latinName,
          originCountry: plant.originCountry,
          count: 0,
          strengthSum: 0,
          statuses: new Set<PlantStatus>(),
        });
      }
      const entry = map.get(key)!;
      entry.count += 1;
      entry.strengthSum += Number(plant.aromaticStrength);
      entry.statuses.add(plant.status);
    }

    return Array.from(map.values()).map((entry) => {
      const avgStrength = entry.count ? entry.strengthSum / entry.count : 0;
      const status = pickStatus(entry.statuses);
      return {
        ...entry,
        avgStrength,
        status,
      };
    });
  }, [productionPlants]);

  const harvestOptions = useMemo(() => {
    const set = new Set<string>();
    productionPlants.forEach((p) => {
      if (p.status === "POSADJENA") set.add(p.latinName);
    });
    return Array.from(set);
  }, [productionPlants]);

  const fetchProductionPlants = async () => {
    if (!token) return;
    setProductionLoading(true);
    setProductionError(null);
    try {
      const list = await plantAPI.listPlants(token);
      setProductionPlants(list);
    } catch (err) {
      setProductionError("Ne mogu da učitam listu biljaka.");
      addProductionLog("ERROR", "Greška pri učitavanju biljaka.");
    } finally {
      setProductionLoading(false);
    }
  };

  const handlePlantSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const commonName = plantForm.commonName.trim();
    const latinName = plantForm.latinName.trim();
    const originCountry = plantForm.originCountry.trim();
    if (!token) {
      setProductionError("Niste prijavljeni.");
      setProductionNotice(null);
      addProductionLog("ERROR", "Neuspešna akcija: nema tokena.");
      return;
    }
    if (!commonName || !latinName || !originCountry) {
      setProductionError("Popunite sva polja za sadnju.");
      setProductionNotice(null);
      return;
    }

    setProductionLoading(true);
    setProductionError(null);
    setProductionNotice(null);
    try {
      await plantAPI.plantNew({ commonName, latinName, originCountry }, token);
      addProductionLog("INFO", `Zasađena biljka: ${commonName}`);
      setProductionNotice("Biljka je uspešno zasađena.");
      setPlantForm({ commonName: "", latinName: "", originCountry: "" });
      await fetchProductionPlants();
    } catch (err) {
      setProductionError("Neuspešno sađenje biljke.");
      setProductionNotice(null);
      addProductionLog("ERROR", "Greška pri sadnji biljke.");
    } finally {
      setProductionLoading(false);
    }
  };

  const handleHarvestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setProductionError("Niste prijavljeni.");
      setProductionNotice(null);
      addProductionLog("ERROR", "Neuspešna akcija: nema tokena.");
      return;
    }
    if (!harvestForm.latinName.trim() || harvestForm.count < 1) {
      setProductionError("Izaberite biljku i unesite količinu.");
      setProductionNotice(null);
      return;
    }

    setProductionLoading(true);
    setProductionError(null);
    setProductionNotice(null);
    try {
      const harvested = await plantAPI.harvest(harvestForm.latinName, harvestForm.count, token);
      addProductionLog("INFO", `Ubrano biljaka: ${harvested.length}`);
      await fetchProductionPlants();
    } catch (err) {
      setProductionError("Neuspešna berba biljaka.");
      setProductionNotice(null);
      addProductionLog("ERROR", "Greška pri berbi biljaka.");
    } finally {
      setProductionLoading(false);
    }
  };

  const handleChangeStrengthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setProductionError("Niste prijavljeni.");
      setProductionNotice(null);
      addProductionLog("ERROR", "Neuspešna akcija: nema tokena.");
      return;
    }
    if (!changeForm.plantId.trim()) {
      setProductionError("Izaberite biljku.");
      setProductionNotice(null);
      return;
    }

    setProductionLoading(true);
    setProductionError(null);
    setProductionNotice(null);
    try {
      await plantAPI.changeStrength(changeForm.plantId, changeForm.percent, token);
      addProductionLog("INFO", `Promenjena jačina: ${changeForm.percent}%`);
      setProductionNotice("Jačina je uspešno promenjena.");
      await fetchProductionPlants();
    } catch (err) {
      setProductionError("Neuspešna promena jačine.");
      setProductionNotice(null);
      addProductionLog("ERROR", "Greška pri promeni jačine.");
    } finally {
      setProductionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Proizvodnja" || activeTab === "Pregled") {
      fetchProductionPlants();
    }
  }, [activeTab, token]);

  // Fetch audit logova za proizvodnju (ključne riječi: biljk, zasađ, ubran, jačin)
  const fetchProductionAuditLogs = async () => {
    if (!token || authUser?.role?.toUpperCase() !== "ADMIN") return;
    try {
      const keywords = ["biljk", "zasa\u0111", "ubran", "ja\u010din"];
      const allLogs: ProductionLog[] = [];
      for (const kw of keywords) {
        const data = await auditAPI.searchLogs(token, { keyword: kw });
        for (const l of data) {
          if (!allLogs.find((x) => x.id === l.id)) {
            const d = new Date(l.createdAt);
            allLogs.push({
              id: l.id,
              type: l.type as ProductionLogType,
              message: l.description,
              time: d.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
            });
          }
        }
      }
      allLogs.sort((a, b) => b.id.localeCompare(a.id));
      setProductionLogs(allLogs.slice(0, 50));
    } catch {
      // tiho ne uspije
    }
  };

  // Fetch audit logova za preradu (ključne riječi: parfem, prerad)
  const fetchProcessingAuditLogs = async () => {
    if (!token || authUser?.role?.toUpperCase() !== "ADMIN") return;
    try {
      const keywords = ["parfem", "prerad"];
      const allLogs: ProductionLog[] = [];
      for (const kw of keywords) {
        const data = await auditAPI.searchLogs(token, { keyword: kw });
        for (const l of data) {
          if (!allLogs.find((x) => x.id === l.id)) {
            const d = new Date(l.createdAt);
            allLogs.push({
              id: l.id,
              type: l.type as ProductionLogType,
              message: l.description,
              time: d.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
            });
          }
        }
      }
      allLogs.sort((a, b) => b.id.localeCompare(a.id));
      setProcessingLogs(allLogs.slice(0, 50));
    } catch {
      // tiho ne uspije
    }
  };

  useEffect(() => {
    if (activeTab === "Proizvodnja" && productionTab === "Servis proizvodnje") {
      fetchProductionAuditLogs();
    }
  }, [activeTab, productionTab, token, authUser?.role]);

  useEffect(() => {
    if (activeTab === "Proizvodnja" && productionTab === "Servis prerade") {
      fetchProcessingPerfumes();
      fetchProcessingAuditLogs();
    }
  }, [activeTab, productionTab, token, authUser?.role]);

  useEffect(() => {
    if (activeTab === "Skladištenje") {
      fetchWarehouses();
      fetchSalesCatalog();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === "Skladištenje" && selectedWarehouseId) {
      fetchWarehousePackages(selectedWarehouseId);
    }
  }, [selectedWarehouseId, activeTab]);

  // Sales functions
  const fetchSalesCatalog = async () => {
    if (!token) return;
    setSalesLoading(true);
    setSalesError(null);
    try {
      const list = await salesAPI.getCatalog(token);
      setSalesCatalog(list);
    } catch {
      setSalesError("Ne mogu da učitam katalog.");
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchSalesInvoices = async () => {
    if (!token) return;
    setSalesLoading(true);
    setSalesError(null);
    try {
      const list = await salesAPI.listInvoices(token);
      setSalesInvoices(list);
    } catch {
      setSalesError("Ne mogu da učitam fakture.");
    } finally {
      setSalesLoading(false);
    }
  };

  const addToCart = (item: CatalogItemDTO) => {
    setSalesCart((prev) => {
      const existing = prev.find((c) => c.perfumeId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.perfumeId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      const unitPrice = item.volume === 250 ? 13200 : 8900;
      return [...prev, { perfumeId: item.id, perfumeName: item.name, quantity: 1, unitPrice }];
    });
    setSalesNotice(`${item.name} dodat u korpu.`);
    setTimeout(() => setSalesNotice(null), 2000);
  };

  const removeFromCart = (perfumeId: string) => {
    setSalesCart((prev) => prev.filter((c) => c.perfumeId !== perfumeId));
  };

  const updateCartQuantity = (perfumeId: string, quantity: number) => {
    if (quantity < 1) return;
    setSalesCart((prev) =>
      prev.map((c) => (c.perfumeId === perfumeId ? { ...c, quantity } : c))
    );
  };

  const cartTotal = useMemo(() => {
    return salesCart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [salesCart]);

  const handleCheckout = async () => {
    if (!token || salesCart.length === 0) return;
    setSalesCheckoutLoading(true);
    setSalesError(null);
    setSalesNotice(null);
    try {
      const invoice = await salesAPI.purchase(
        {
          items: salesCart.map((c) => ({ perfumeId: c.perfumeId, quantity: c.quantity })),
          saleType: salesSaleType,
          paymentMethod: salesPaymentMethod,
        },
        token
      );
      setSalesNotice(`Faktura ${invoice.id.substring(0, 8)}... kreirana uspešno! Iznos: ${Number(invoice.totalAmount).toLocaleString("sr-RS")} RSD`);
      setSalesCart([]);
      await fetchSalesInvoices();
      setSalesTab("Fakture");
    } catch (err: any) {
      setSalesError(err?.response?.data?.message ?? "Greška pri kupovini.");
    } finally {
      setSalesCheckoutLoading(false);
    }
  };

  const saleTypeLabel = (st: string) => {
    if (st === "MALOPRODAJA") return "Maloprodaja";
    if (st === "VELEPRODAJA") return "Veleprodaja";
    return st;
  };

  const paymentLabel = (pm: string) => {
    if (pm === "GOTOVINA") return "Gotovina";
    if (pm === "UPLATA_NA_RACUN") return "Uplata na račun";
    if (pm === "KARTICNO") return "Kartično";
    return pm;
  };

  useEffect(() => {
    if (activeTab === "Prodaja") {
      fetchSalesCatalog();
      fetchSalesInvoices();
    }
  }, [activeTab, token]);

  // Use real invoices in overview if available
  const overviewInvoices = useMemo(() => {
    if (salesInvoices.length > 0) {
      return salesInvoices.map((inv) => ({
        id: inv.id.substring(0, 12),
        saleType: saleTypeLabel(inv.saleType) as "Maloprodaja" | "Veleprodaja",
        payment: paymentLabel(inv.paymentMethod) as "Gotovina" | "Uplata na račun" | "Kartično",
        amount: Number(inv.totalAmount),
        date: new Date(inv.createdAt).toLocaleDateString("sr-RS"),
      }));
    }
    return invoicesSeed;
  }, [salesInvoices]);

  const filteredInvoicesReal = useMemo(() => {
    const q = invoiceQuery.trim().toLowerCase();
    if (!q) return overviewInvoices;
    return overviewInvoices.filter((i) =>
      [i.id, i.saleType, i.payment, i.amount.toString(), i.date]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [invoiceQuery, overviewInvoices]);

  // Fetch invoices on overview too (only for non-admin users)
  useEffect(() => {
    if (activeTab === "Pregled" && token && authUser?.role?.toUpperCase() !== "ADMIN") {
      fetchSalesInvoices();
    }
  }, [activeTab, token, authUser?.role]);

  return (
    <div className="dashboard-root">
      <div className="window dashboard-window">
        <div className="titlebar dashboard-titlebar">
          <div className="titlebar-icon">
            <img src={appIconUrl} width="16" height="16" />
          </div>
          <span className="titlebar-title">Parfimerija O&apos;Сињел Де Ор - Информациони систем</span>
        </div>

        <DashboardNavbar userAPI={userAPI} />

        <div className="dashboard-tabs">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          {authUser?.role?.toLowerCase() === "admin" && (
            <button
              className={`tab-btn ${activeTab === "Korisnici" ? "active" : ""}`}
              onClick={() => setActiveTab("Korisnici")}
            >
              Korisnici
            </button>
          )}
          {authUser?.role?.toLowerCase() === "admin" && (
            <button
              className={`tab-btn ${activeTab === "Evidencija" ? "active" : ""}`}
              onClick={() => setActiveTab("Evidencija")}
            >
              Evidencija
            </button>
          )}
          {authUser?.role?.toLowerCase() === "admin" && (
            <button
              className={`tab-btn ${activeTab === "Analiza prodaje" ? "active" : ""}`}
              onClick={() => setActiveTab("Analiza prodaje")}
            >
              Analiza prodaje
            </button>
          )}
        </div>

        <div className="window-content dashboard-content">
          {activeTab === "Pregled" ? (
            <div className="dashboard-grid">
              <section className="panel">
                <header className="panel-header">
                  <div className="panel-title">Lista biljaka</div>
                  <input
                    type="search"
                    placeholder="Pretraga biljaka..."
                    value={plantQuery}
                    onChange={(e) => setPlantQuery(e.target.value)}
                  />
                </header>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Naziv</th>
                        <th>Latinski naziv</th>
                        <th>Jačina</th>
                        <th>Zemlja</th>
                        <th>Stanje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlants.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-muted">
                            Nema biljaka za prikaz.
                          </td>
                        </tr>
                      ) : (
                        filteredPlants.map((p) => (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td className="text-muted">{p.latinName}</td>
                            <td>{p.strength.toFixed(1)}</td>
                            <td>{p.country}</td>
                            <td>
                              <span className={`status-chip ${p.status === "Posađena" ? "status-green" : p.status === "Ubrana" ? "status-yellow" : "status-purple"}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <footer className="panel-footer">
                  Ukupno biljaka: {filteredPlants.length}
                </footer>
              </section>

              {authUser?.role?.toUpperCase() !== "ADMIN" && (
                <section className="panel">
                  <header className="panel-header">
                    <div className="panel-title">Fiskalni računi</div>
                    <input
                      type="search"
                      placeholder="Pretraga računa..."
                      value={invoiceQuery}
                      onChange={(e) => setInvoiceQuery(e.target.value)}
                    />
                  </header>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Broj računa</th>
                          <th>Tip prodaje</th>
                          <th>Način plaćanja</th>
                          <th>Iznos (RSD)</th>
                          <th>Datum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInvoicesReal.map((i) => (
                          <tr key={i.id}>
                            <td>{i.id}</td>
                            <td>{i.saleType}</td>
                            <td>{i.payment}</td>
                            <td>{i.amount.toLocaleString("sr-RS")}</td>
                            <td>{i.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <footer className="panel-footer">
                    Ukupno računa: {filteredInvoicesReal.length} | Ukupan promet: {filteredInvoicesReal.reduce((sum, i) => sum + i.amount, 0).toLocaleString("sr-RS")} RSD
                  </footer>
                </section>
              )}
            </div>
          ) : activeTab === "Proizvodnja" ? (
            <div className="production-shell">
              <div className="production-tabs">
                {(["Servis proizvodnje", "Servis prerade"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${productionTab === tab ? "active" : ""}`}
                    onClick={() => setProductionTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {productionTab === "Servis proizvodnje" ? (
                <div className="production-grid">
                  <section className="panel">
                    <header className="panel-header">
                      <div className="panel-title">Upravljanje biljkama</div>
                      <div className="action-tabs">
                        <button
                          className={`tab-btn ${productionAction === "plant" ? "active" : ""}`}
                          onClick={() => setProductionAction("plant")}
                        >
                          Zasadi biljku
                        </button>
                        <button
                          className={`tab-btn ${productionAction === "harvest" ? "active" : ""}`}
                          onClick={() => setProductionAction("harvest")}
                        >
                          Uberi biljku
                        </button>
                        <button
                          className={`tab-btn ${productionAction === "change-strength" ? "active" : ""}`}
                          onClick={() => setProductionAction("change-strength")}
                        >
                          Promeni jačinu
                        </button>
                      </div>
                    </header>

                    <div className="production-form">
                      {productionAction === "plant" ? (
                        <form className="form-grid" onSubmit={handlePlantSubmit}>
                          <label>
                            Naziv
                            <input
                              type="text"
                              value={plantForm.commonName}
                              onChange={(e) => setPlantForm({ ...plantForm, commonName: e.target.value })}
                            />
                          </label>
                          <label>
                            Latinski naziv
                            <input
                              type="text"
                              value={plantForm.latinName}
                              onChange={(e) => setPlantForm({ ...plantForm, latinName: e.target.value })}
                            />
                          </label>
                          <label>
                            Zemlja
                            <input
                              type="text"
                              value={plantForm.originCountry}
                              onChange={(e) => setPlantForm({ ...plantForm, originCountry: e.target.value })}
                            />
                          </label>
                          <div className="form-actions">
                            <button className="btn btn-accent" type="submit" disabled={productionLoading}>
                              Zasadi
                            </button>
                          </div>
                        </form>
                      ) : null}

                      {productionAction === "harvest" ? (
                        <form className="form-grid" onSubmit={handleHarvestSubmit}>
                          <label>
                            Latinski naziv
                            <select
                              value={harvestForm.latinName}
                              onChange={(e) => setHarvestForm({ ...harvestForm, latinName: e.target.value })}
                            >
                              <option value="">Izaberite biljku</option>
                              {harvestOptions.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Količina
                            <input
                              type="number"
                              min={1}
                              value={harvestForm.count}
                              onChange={(e) => setHarvestForm({ ...harvestForm, count: Number(e.target.value) })}
                            />
                          </label>
                          <div className="form-actions">
                            <button className="btn btn-accent" type="submit" disabled={productionLoading}>
                              Uberi
                            </button>
                          </div>
                        </form>
                      ) : null}

                      {productionAction === "change-strength" ? (
                        <form className="form-grid" onSubmit={handleChangeStrengthSubmit}>
                          <label>
                            Biljka
                            <select
                              value={changeForm.plantId}
                              onChange={(e) => setChangeForm({ ...changeForm, plantId: e.target.value })}
                            >
                              <option value="">Izaberite biljku</option>
                              {productionPlants.map((plant) => (
                                <option key={plant.id} value={plant.id}>
                                  {plant.commonName} ({plant.latinName})
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Promena (%)
                            <input
                              type="number"
                              value={changeForm.percent}
                              onChange={(e) => setChangeForm({ ...changeForm, percent: Number(e.target.value) })}
                            />
                          </label>
                          <div className="form-actions">
                            <button className="btn btn-accent" type="submit" disabled={productionLoading}>
                              Primeni
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>

                    {productionError ? (
                      <div className="notice error">{productionError}</div>
                    ) : null}
                    {productionNotice ? (
                      <div className="notice success">{productionNotice}</div>
                    ) : null}

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Naziv</th>
                            <th>Latinski naziv</th>
                            <th>Jačina</th>
                            <th>Količina</th>
                            <th>Stanje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedPlants.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-muted">
                                Nema biljaka za prikaz.
                              </td>
                            </tr>
                          ) : (
                            groupedPlants.map((plant) => (
                              <tr key={plant.latinName}>
                                <td>{plant.commonName}</td>
                                <td className="text-muted">{plant.latinName}</td>
                                <td>{plant.avgStrength.toFixed(2)}</td>
                                <td>{plant.count}</td>
                                <td>
                                  <span className={`status-chip ${statusClass(plant.status)}`}>
                                    {statusLabel(plant.status)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <footer className="panel-footer">
                      Ukupno biljaka: {productionPlants.length} | Prikazano grupa: {groupedPlants.length}
                    </footer>
                  </section>

                  <section className="panel">
                    <header className="panel-header">
                      <div className="panel-title">Dnevnik proizvodnje</div>
                      {authUser?.role?.toUpperCase() === "ADMIN" && (
                        <button className="btn btn-ghost" onClick={fetchProductionAuditLogs} disabled={productionLoading}>
                          Osveži
                        </button>
                      )}
                    </header>

                    <div className="log-list">
                      {productionLogs.map((log) => (
                        <div key={log.id} className={`log-item log-${log.type.toLowerCase()}`}>
                          <div className="log-meta">{log.time}</div>
                          <div className="log-message">{log.message}</div>
                        </div>
                      ))}
                    </div>

                    <footer className="panel-footer">
                      Ukupno akcija: {productionLogs.length}
                    </footer>
                  </section>
                </div>
              ) : (
                <div className="production-grid">
                  <section className="panel">
                    <header className="panel-header">
                      <div className="panel-title">Servis prerade</div>
                    </header>

                    <form className="production-form" onSubmit={handleProcessingSubmit}>
                      <div className="form-grid">
                        <label>
                          Naziv
                          <input
                            type="text"
                            value={processingForm.name}
                            onChange={(e) => setProcessingForm({ ...processingForm, name: e.target.value })}
                          />
                        </label>
                        <label>
                          Tip
                          <select
                            value={processingForm.type}
                            onChange={(e) => setProcessingForm({ ...processingForm, type: e.target.value as PerfumeType })}
                          >
                            <option value="Parfem">Parfem</option>
                            <option value="Kolonjska voda">Kolonjska voda</option>
                          </select>
                        </label>
                        <label>
                          Zapremina (ml)
                          <select
                            value={processingForm.volume}
                            onChange={(e) => setProcessingForm({ ...processingForm, volume: Number(e.target.value) })}
                          >
                            <option value={150}>150</option>
                            <option value={250}>250</option>
                          </select>
                        </label>
                        <label>
                          Serijski broj
                          <input
                            type="text"
                            value={processingForm.serial}
                            onChange={(e) => setProcessingForm({ ...processingForm, serial: e.target.value })}
                          />
                        </label>
                        <label>
                          Rok trajanja
                          <input
                            type="text"
                            placeholder="dd.mm.yyyy"
                            value={processingForm.expiresAt}
                            onChange={(e) => setProcessingForm({ ...processingForm, expiresAt: e.target.value })}
                          />
                        </label>
                        <label>
                          Status
                          <select
                            value={processingForm.status}
                            onChange={(e) => setProcessingForm({ ...processingForm, status: e.target.value as PerfumeStatus })}
                          >
                            <option value="U izradi">U izradi</option>
                            <option value="Zavrseno">Zavrseno</option>
                          </select>
                        </label>
                      </div>
                      <div className="form-actions">
                        <button className="btn btn-accent" type="submit" disabled={processingLoading}>
                          Pokreni preradu
                        </button>
                      </div>
                    </form>

                    {processingError ? (
                      <div className="notice error">{processingError}</div>
                    ) : null}
                    {processingNotice ? (
                      <div className="notice success">{processingNotice}</div>
                    ) : null}

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Naziv</th>
                            <th>Tip</th>
                            <th>Zapremina</th>
                            <th>Serijski broj</th>
                            <th>Rok trajanja</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processingPerfumes.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-muted">
                                Nema parfema za prikaz.
                              </td>
                            </tr>
                          ) : (
                            processingPerfumes.map((p) => (
                              <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.type}</td>
                                <td>{p.volume} ml</td>
                                <td>{p.serialNumber}</td>
                                <td>{p.expiresAt}</td>
                                <td>
                                  <span className={`status-chip ${processingStatusClass(p.status)}`}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="panel">
                    <header className="panel-header">
                      <div className="panel-title">Dnevnik prerade</div>
                      {authUser?.role?.toUpperCase() === "ADMIN" && (
                        <button className="btn btn-ghost" onClick={fetchProcessingAuditLogs}>
                          Osveži
                        </button>
                      )}
                    </header>
                    <div className="log-list">
                      {processingLogs.map((log) => (
                        <div key={log.id} className={`log-item log-${log.type.toLowerCase()}`}>
                          <div className="log-meta">{log.time}</div>
                          <div className="log-message">{log.message}</div>
                        </div>
                      ))}
                    </div>
                    <footer className="panel-footer">
                      Ukupno akcija: {processingLogs.length}
                    </footer>
                  </section>
                </div>
              )}
            </div>
          ) : activeTab === "Skladištenje" ? (
            <div className="storage-shell">
              <div className="storage-tabs">
                {(["Servis skladištenja", "Servis prodaje"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${storageTab === tab ? "active" : ""}`}
                    onClick={() => setStorageTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {storageLoading ? (
                <div className="panel panel-empty"><p>Učitavanje...</p></div>
              ) : storageError ? (
                <div className="panel panel-empty"><p style={{ color: "#e74c3c" }}>{storageError}</p></div>
              ) : storageTab === "Servis skladištenja" ? (
                <div className="storage-grid">
                  <section className="panel storage-panel">
                    <header className="storage-header storage-header-orange">
                      <div className="storage-header-title">Skladišta</div>
                    </header>

                    <div className="storage-list">
                      {storageWarehouses.map((warehouse) => (
                        <article
                          key={warehouse.id}
                          className={`warehouse-card ${selectedWarehouseId === warehouse.id ? "selected-warehouse" : ""}`}
                          style={{ cursor: "pointer", border: selectedWarehouseId === warehouse.id ? "2px solid #f39c12" : undefined }}
                          onClick={() => setSelectedWarehouseId(warehouse.id)}
                        >
                          <div className="warehouse-title">
                            <div>
                              <div className="warehouse-name">{warehouse.name}</div>
                              <div className="warehouse-address">{warehouse.location}</div>
                            </div>
                            <div className="warehouse-icon">▣</div>
                          </div>

                          <div className="warehouse-meta">
                            <span>Kapacitet:</span>
                            <strong>{warehouse.maxCapacity}</strong>
                          </div>
                        </article>
                      ))}
                    </div>

                    <footer className="panel-footer">
                      Ukupno skladišta: {storageWarehouses.length}
                    </footer>
                  </section>

                  <section className="panel storage-panel">
                    <header className="storage-header storage-header-purple">
                      <div className="storage-header-title">Ambalaže u skladištu</div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="number"
                          min={1}
                          value={storageSendCount}
                          onChange={(e) => setStorageSendCount(Number(e.target.value))}
                          style={{ width: "60px", padding: "4px" }}
                        />
                        <button
                          className="btn btn-ghost"
                          onClick={handleSendToSales}
                          disabled={storageSending}
                        >
                          {storageSending ? "Šaljem..." : "Pošalji u prodaju"}
                        </button>
                      </div>
                    </header>

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID ambalaže</th>
                            <th>ID paketa</th>
                            <th>Podaci</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {storagePackages.map((pack) => (
                            <tr key={pack.id}>
                              <td>{pack.id.substring(0, 8)}...</td>
                              <td>{pack.packageId}</td>
                              <td className="text-muted">
                                {typeof pack.packageData === "object"
                                  ? `${pack.packageData.name ?? "?"} (${pack.packageData.volume ?? "?"}ml × ${pack.packageData.count ?? "?"})`
                                  : String(pack.packageData)}
                              </td>
                              <td>
                                <span className={`status-chip ${pack.isDispatched ? "status-green" : "status-orange"}`}>
                                  {pack.isDispatched ? "Poslata" : "U skladištu"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <footer className="panel-footer">
                      Ukupno ambalaža: {storagePackages.length}
                    </footer>
                  </section>
                </div>
              ) : (
                <div className="storage-grid">
                  <section className="panel storage-panel">
                    <header className="storage-header sales-header-green">
                      <div className="storage-header-title">Prijem ambalaže</div>
                    </header>

                    <form className="production-form" onSubmit={(e) => { e.preventDefault(); handleReceivePackage(); }}>
                      <div className="form-grid">
                        <label>
                          Skladište
                          <select
                            value={receiveForm.warehouseId}
                            onChange={(e) => setReceiveForm({ ...receiveForm, warehouseId: e.target.value })}
                          >
                            <option value="">-- izaberi --</option>
                            {storageWarehouses.map((wh) => (
                              <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Naziv parfema
                          <input
                            type="text"
                            value={receiveForm.packageName}
                            onChange={(e) => setReceiveForm({ ...receiveForm, packageName: e.target.value })}
                          />
                        </label>
                        <label>
                          Zapremina (ml)
                          <select
                            value={receiveForm.volume}
                            onChange={(e) => setReceiveForm({ ...receiveForm, volume: Number(e.target.value) })}
                          >
                            <option value={150}>150</option>
                            <option value={250}>250</option>
                          </select>
                        </label>
                        <label>
                          Količina
                          <input
                            type="number"
                            min={1}
                            value={receiveForm.count}
                            onChange={(e) => setReceiveForm({ ...receiveForm, count: Number(e.target.value) })}
                          />
                        </label>
                      </div>
                      <div className="form-actions">
                        <button className="btn btn-accent" type="submit">Primi ambalažu</button>
                      </div>
                    </form>
                  </section>

                  <section className="panel storage-panel">
                    <header className="storage-header sales-header-blue">
                      <div className="storage-header-title">Katalog parfema</div>
                    </header>

                    <div className="catalog-grid">
                      {salesCatalog.map((item) => (
                        <article key={item.id} className="catalog-card">
                          <div className="catalog-top">
                            <div>
                              <div className="catalog-name">{item.name}</div>
                              <div className="catalog-meta">
                                {item.type} | {item.volume} ml
                              </div>
                            </div>
                            <div className="catalog-icon">▣</div>
                          </div>
                          <div className="catalog-price">{(item.volume === 250 ? 13200 : 8900).toLocaleString("sr-RS")} RSD</div>
                          <div className="catalog-stock">Serijski: {item.serialNumber}</div>
                        </article>
                      ))}
                    </div>

                    <footer className="panel-footer">
                      Ukupno proizvoda u katalogu: {salesCatalog.length}
                    </footer>
                  </section>
                </div>
              )}
            </div>
          ) : activeTab === "Pakovanje" ? (
            <div className="packaging-grid">
              <section className="panel packaging-panel">
                <header className="storage-header packaging-header">
                  <div className="storage-header-title">Pakovanje parfema</div>
                </header>

                <form className="production-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-grid">
                    <label>
                      Parfem
                      <input
                        type="text"
                        value={packagingForm.perfumeName}
                        onChange={(e) => setPackagingForm({ ...packagingForm, perfumeName: e.target.value })}
                      />
                    </label>
                    <label>
                      Zapremina (ml)
                      <select
                        value={packagingForm.volume}
                        onChange={(e) => setPackagingForm({ ...packagingForm, volume: Number(e.target.value) })}
                      >
                        <option value={150}>150</option>
                        <option value={250}>250</option>
                      </select>
                    </label>
                    <label>
                      Kolicina
                      <input
                        type="number"
                        min={1}
                        value={packagingForm.count}
                        onChange={(e) => setPackagingForm({ ...packagingForm, count: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Skladiste
                      <select
                        value={packagingForm.warehouse}
                        onChange={(e) => setPackagingForm({ ...packagingForm, warehouse: e.target.value })}
                      >
                        <option value="Centralno skladište">Centralno skladište</option>
                        <option value="Severno skladište">Severno skladište</option>
                        <option value="Južno skladište">Južno skladište</option>
                      </select>
                    </label>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-accent" type="submit">Spakuj</button>
                  </div>
                </form>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID ambalaze</th>
                        <th>Skladiste</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {packagingSeed.map((pack) => (
                        <tr key={pack.id}>
                          <td>{pack.id}</td>
                          <td>{pack.warehouse}</td>
                          <td>
                            <span className={`status-chip ${packageStatusClass(pack.status)}`}>
                              {pack.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-ghost ${selectedPackageId === pack.id ? "selected-btn" : ""}`}
                              onClick={() => setSelectedPackageId(pack.id)}
                            >
                              Detalji
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <footer className="panel-footer">
                  Ukupno ambalaza: {packagingSeed.length}
                </footer>
              </section>

              <section className="panel packaging-panel">
                <header className="storage-header packaging-header-alt">
                  <div className="storage-header-title">Sadrzaj ambalaze</div>
                  <button className="btn btn-ghost">Posalji u skladiste</button>
                </header>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Parfem</th>
                        <th>Zapremina</th>
                        <th>Kolicina</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPackage?.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.perfumeName}</td>
                          <td>{item.volume} ml</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : activeTab === "Korisnici" && authUser?.role?.toLowerCase() === "admin" ? (
            <UserManagement userAPI={userAPI} />
          ) : activeTab === "Evidencija" && authUser?.role?.toLowerCase() === "admin" ? (
            <AuditLogViewer auditAPI={auditAPI} />
          ) : activeTab === "Prodaja" ? (
            <div className="storage-shell">
              <div className="storage-tabs">
                {(["Katalog", "Korpa", "Fakture"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${salesTab === tab ? "active" : ""}`}
                    onClick={() => setSalesTab(tab)}
                  >
                    {tab}
                    {tab === "Korpa" && salesCart.length > 0 ? ` (${salesCart.length})` : ""}
                  </button>
                ))}
              </div>

              {salesError && (
                <div className="notice error" style={{ margin: "8px 16px" }}>{salesError}</div>
              )}
              {salesNotice && (
                <div className="notice success" style={{ margin: "8px 16px" }}>{salesNotice}</div>
              )}

              {salesTab === "Katalog" ? (
                <div className="storage-grid">
                  <section className="panel storage-panel" style={{ gridColumn: "1 / -1" }}>
                    <header className="storage-header sales-header-blue">
                      <div className="storage-header-title">Katalog parfema (završeni)</div>
                      <button className="btn btn-ghost" onClick={fetchSalesCatalog} disabled={salesLoading}>
                        Osveži
                      </button>
                    </header>

                    {salesLoading ? (
                      <p style={{ padding: 20, textAlign: "center", color: "#888" }}>Učitavanje kataloga...</p>
                    ) : salesCatalog.length === 0 ? (
                      <p style={{ padding: 20, textAlign: "center", color: "#888" }}>Nema dostupnih parfema u katalogu.</p>
                    ) : (
                      <div className="catalog-grid">
                        {salesCatalog.map((item) => (
                          <article key={item.id} className="catalog-card" style={{ cursor: "pointer" }} onClick={() => addToCart(item)}>
                            <div className="catalog-top">
                              <div>
                                <div className="catalog-name">{item.name}</div>
                                <div className="catalog-meta">
                                  {item.type} | {item.volume} ml
                                </div>
                              </div>
                              <div className="catalog-icon" style={{ fontSize: "1.5rem" }}>🛒</div>
                            </div>
                            <div className="catalog-price">{(item.volume === 250 ? 13200 : 8900).toLocaleString("sr-RS")} RSD</div>
                            <div className="catalog-stock" style={{ fontSize: "0.8rem", color: "#9ca3af" }}>SN: {item.serialNumber}</div>
                          </article>
                        ))}
                      </div>
                    )}

                    <footer className="panel-footer">
                      Ukupno u katalogu: {salesCatalog.length} | U korpi: {salesCart.length} stavki
                    </footer>
                  </section>
                </div>
              ) : salesTab === "Korpa" ? (
                <div className="storage-grid">
                  <section className="panel storage-panel">
                    <header className="storage-header storage-header-orange">
                      <div className="storage-header-title">Korpa</div>
                    </header>

                    {salesCart.length === 0 ? (
                      <p style={{ padding: 20, textAlign: "center", color: "#888" }}>Korpa je prazna. Dodajte parfeme iz kataloga.</p>
                    ) : (
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Parfem</th>
                              <th>Cena (RSD)</th>
                              <th>Količina</th>
                              <th>Ukupno (RSD)</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesCart.map((item) => (
                              <tr key={item.perfumeId}>
                                <td>{item.perfumeName}</td>
                                <td>{item.unitPrice.toLocaleString("sr-RS")}</td>
                                <td>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) => updateCartQuantity(item.perfumeId, Number(e.target.value))}
                                    style={{ width: "60px", padding: "4px", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                                  />
                                </td>
                                <td>{(item.quantity * item.unitPrice).toLocaleString("sr-RS")}</td>
                                <td>
                                  <button className="btn btn-ghost" onClick={() => removeFromCart(item.perfumeId)} style={{ color: "#ef4444" }}>
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <footer className="panel-footer">
                      Ukupno stavki: {salesCart.length} | Ukupan iznos: {cartTotal.toLocaleString("sr-RS")} RSD
                    </footer>
                  </section>

                  <section className="panel storage-panel">
                    <header className="storage-header sales-header-green">
                      <div className="storage-header-title">Checkout</div>
                    </header>

                    <div className="production-form" style={{ padding: 16 }}>
                      <div className="form-grid">
                        <label>
                          Tip prodaje
                          <select
                            value={salesSaleType}
                            onChange={(e) => setSalesSaleType(e.target.value)}
                            style={{ width: "100%", padding: "8px", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                          >
                            <option value="MALOPRODAJA">Maloprodaja</option>
                            <option value="VELEPRODAJA">Veleprodaja</option>
                          </select>
                        </label>
                        <label>
                          Način plaćanja
                          <select
                            value={salesPaymentMethod}
                            onChange={(e) => setSalesPaymentMethod(e.target.value)}
                            style={{ width: "100%", padding: "8px", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                          >
                            <option value="GOTOVINA">Gotovina</option>
                            <option value="UPLATA_NA_RACUN">Uplata na račun</option>
                            <option value="KARTICNO">Kartično</option>
                          </select>
                        </label>
                      </div>

                      <div style={{ marginTop: 16, padding: "12px", background: "#1a1a2e", borderRadius: 8, border: "1px solid #333" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: "#9ca3af" }}>Stavki:</span>
                          <span>{salesCart.length}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: "#9ca3af" }}>Bočica ukupno:</span>
                          <span>{salesCart.reduce((s, c) => s + c.quantity, 0)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem", borderTop: "1px solid #444", paddingTop: 8 }}>
                          <span>Ukupno:</span>
                          <span>{cartTotal.toLocaleString("sr-RS")} RSD</span>
                        </div>
                      </div>

                      <div className="form-actions" style={{ marginTop: 16 }}>
                        <button
                          className="btn btn-accent"
                          onClick={handleCheckout}
                          disabled={salesCheckoutLoading || salesCart.length === 0}
                        >
                          {salesCheckoutLoading ? "Obrađujem..." : "Potvrdi kupovinu"}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="storage-grid">
                  <section className="panel storage-panel" style={{ gridColumn: "1 / -1" }}>
                    <header className="storage-header storage-header-purple">
                      <div className="storage-header-title">Fakture</div>
                      <button className="btn btn-ghost" onClick={fetchSalesInvoices} disabled={salesLoading}>
                        Osveži
                      </button>
                    </header>

                    {salesLoading ? (
                      <p style={{ padding: 20, textAlign: "center", color: "#888" }}>Učitavanje faktura...</p>
                    ) : (
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID fakture</th>
                              <th>Tip prodaje</th>
                              <th>Način plaćanja</th>
                              <th>Stavke</th>
                              <th>Iznos (RSD)</th>
                              <th>Datum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesInvoices.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-muted">Nema faktura za prikaz.</td>
                              </tr>
                            ) : (
                              salesInvoices.map((inv) => (
                                <tr key={inv.id}>
                                  <td>{inv.id.substring(0, 8)}...</td>
                                  <td>
                                    <span className={`status-chip ${inv.saleType === "MALOPRODAJA" ? "status-green" : "status-purple"}`}>
                                      {saleTypeLabel(inv.saleType)}
                                    </span>
                                  </td>
                                  <td>{paymentLabel(inv.paymentMethod)}</td>
                                  <td className="text-muted">
                                    {inv.items.map((it) => `${it.perfumeName} ×${it.quantity}`).join(", ")}
                                  </td>
                                  <td>{Number(inv.totalAmount).toLocaleString("sr-RS")}</td>
                                  <td>{new Date(inv.createdAt).toLocaleDateString("sr-RS")}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <footer className="panel-footer">
                      Ukupno faktura: {salesInvoices.length} | Ukupan promet: {salesInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0).toLocaleString("sr-RS")} RSD
                    </footer>
                  </section>
                </div>
              )}
            </div>
          ) : activeTab === "Analiza prodaje" ? (
            <div>
              <AnalyticsView analyticsAPI={analyticsAPI} />
            </div>
          ) : (
            <div className="panel panel-empty">
              <h2>{activeTab}</h2>
              <p>Ovaj deo je u izradi. Trenutno je implementiran samo pregled (A1).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
