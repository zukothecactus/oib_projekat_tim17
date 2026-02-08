import React, { useMemo, useState, useEffect } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO, PlantStatus } from "../models/plants/PlantDTO";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";
import { PerfumeDTO, type PerfumeStatus, type PerfumeType } from "../models/processing/PerfumeDTO";
import { IPackagingAPI } from "../api/packaging/IPackagingAPI";
import { PackageDTO, type PackageStatus as PackageStatusType } from "../models/packaging/PackageDTO";
import { IStorageAPI } from "../api/storage/IStorageAPI";
import { WarehouseDTO } from "../models/storage/WarehouseDTO";
import { StoredPackageDTO } from "../models/storage/StoredPackageDTO";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { UserManagement } from "../components/dashboard/users/UserManagement";
import { AuditLogViewer } from "../components/dashboard/audit/AuditLogViewer";
import { IAuditAPI } from "../api/audit/IAuditAPI";
import { ISalesAPI } from "../api/sales/ISalesAPI";
import { IAnalyticsAPI } from "../api/analytics/IAnalyticsAPI";
import { IPerformanceAPI } from "../api/performance/IPerformanceAPI";
import { CatalogItemDTO, InvoiceDTO, SaleType, PaymentMethod } from "../models/sales/SalesDTO";
import { useAuth } from "../hooks/useAuthHook";
import { AnalyticsView } from "../components/dashboard/analytics/AnalyticsView";
import { PerformanceView } from "../components/dashboard/performance/PerformanceView";
import { DataTable } from "../components/common/DataTable";

export type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
  processingAPI: IProcessingAPI;
  packagingAPI: IPackagingAPI;
  storageAPI: IStorageAPI;
  auditAPI: IAuditAPI;
  salesAPI: ISalesAPI;
  analyticsAPI: IAnalyticsAPI;
  performanceAPI: IPerformanceAPI;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CatalogItem = {
  id: string;
  name: string;
  type: PerfumeType;
  volume: number;
  price: number;
  stock: number;
};

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

const warehousesSeed: WarehouseDTO[] = [
  { id: "wh-1", name: "Centralno skladište", location: "Pariz, Rue de la Paix 45", maxCapacity: 100, createdAt: new Date().toISOString() },
  { id: "wh-2", name: "Severno skladište", location: "Pariz, Avenue Foch 12", maxCapacity: 75, createdAt: new Date().toISOString() },
  { id: "wh-3", name: "Južno skladište", location: "Pariz, Blvd. Saint-Germain 89", maxCapacity: 50, createdAt: new Date().toISOString() },
];

// const catalogSeed: CatalogItem[] = [
//   { id: "cat-1", name: "Rosa Mistika", type: "Parfem", volume: 250, price: 12500, stock: 45 },
//   { id: "cat-2", name: "Lavander Noir", type: "Kolonjska voda", volume: 150, price: 8900, stock: 67 },
//   { id: "cat-3", name: "Bergamot Esenc", type: "Parfem", volume: 250, price: 13200, stock: 23 },
//   { id: "cat-4", name: "Jasmin De Nuj", type: "Kolonjska voda", volume: 150, price: 9500, stock: 38 },
// ];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI, processingAPI, packagingAPI, storageAPI, auditAPI, salesAPI, analyticsAPI, performanceAPI }) => {
  const appIconUrl = `${import.meta.env.BASE_URL}icon.png`;
  const { token, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"Pregled" | "Proizvodnja" | "Prerada" | "Pakovanje" | "Skladištenje" | "Prodaja" | "Korisnici" | "Evidencija" | "Analiza prodaje" | "Analiza performansi">("Pregled");

  const [productionAction, setProductionAction] = useState<"plant" | "harvest" | "change-strength">("plant");
  const [storageTab, setStorageTab] = useState<"Servis skladištenja" | "Servis prodaje">("Servis skladištenja");
  const [packagingForm, setPackagingForm] = useState({
    name: "",
    senderAddress: "",
  });
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [availablePerfumes, setAvailablePerfumes] = useState<PerfumeDTO[]>([]);
  const [selectedPerfumeIds, setSelectedPerfumeIds] = useState<Set<string>>(new Set());
  const [packagingLoading, setPackagingLoading] = useState(false);
  const [packagingError, setPackagingError] = useState<string | null>(null);
  const [packagingNotice, setPackagingNotice] = useState<string | null>(null);
  const [sendWarehouseId, setSendWarehouseId] = useState("wh-1");
  const [productionPlants, setProductionPlants] = useState<PlantDTO[]>([]);
  const [productionLoading, setProductionLoading] = useState(false);
  const [productionError, setProductionError] = useState<string | null>(null);
  const [productionNotice, setProductionNotice] = useState<string | null>(null);
  const [plantForm, setPlantForm] = useState({ commonName: "", latinName: "", originCountry: "" });
  const [harvestForm, setHarvestForm] = useState({ latinName: "", count: 1 });
  const [changeForm, setChangeForm] = useState({ plantId: "", percent: 0 });
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);
  const [processingForm, setProcessingForm] = useState({
    perfumeName: "",
    perfumeType: "Parfem" as PerfumeType,
    bottleCount: 1,
    bottleVolume: 150 as 150 | 250,
    latinName: "",
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

  // const filteredInvoices = useMemo(() => {
  //   const q = invoiceQuery.trim().toLowerCase();
  //   if (!q) return invoicesSeed;
  //   return invoicesSeed.filter((i) =>
  //     [i.id, i.saleType, i.payment, i.amount.toString(), i.date]
  //       .join(" ")
  //       .toLowerCase();
  //      .includes(q)
  //   );
  // }, [invoiceQuery]);

  const addProductionLog = (type: ProductionLogType, message: string) => {
    const time = new Date().toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
    setProductionLogs((prev) => [
      { id: `log-${Date.now()}`, type, message, time },
      ...prev,
    ].slice(0, 50));
    // Osvježi iz audit servisa nakon kratkog delay-a (samo za admin)
    if (authUser?.role?.toUpperCase() === "ADMIN") {
      // setTimeout(() => fetchProductionAuditLogs(), 1500);
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
      // setTimeout(() => fetchProcessingAuditLogs(), 1500);
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
    if (!processingForm.perfumeName.trim()) {
      setProcessingError("Popunite naziv parfema.");
      setProcessingNotice(null);
      return;
    }
    if (!processingForm.latinName) {
      setProcessingError("Izaberite biljku za preradu.");
      setProcessingNotice(null);
      return;
    }
    if (processingForm.bottleCount < 1) {
      setProcessingError("Broj bočica mora biti bar 1.");
      setProcessingNotice(null);
      return;
    }

    setProcessingLoading(true);
    setProcessingError(null);
    setProcessingNotice(null);
    try {
      const created = await processingAPI.startProcessing(
        {
          perfumeName: processingForm.perfumeName.trim(),
          perfumeType: processingForm.perfumeType,
          bottleCount: processingForm.bottleCount,
          bottleVolume: processingForm.bottleVolume,
          latinName: processingForm.latinName,
        },
        token
      );
      const entry: ProductionLog = {
        id: `proc-${Date.now()}`,
        type: "INFO",
        message: `Prerada završena: ${created.length} bočica parfema "${processingForm.perfumeName.trim()}"`,
        time: new Date().toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
      };
      setProcessingLogs((prev) => [entry, ...prev].slice(0, 20));
      setProcessingNotice(`Uspešno kreirano ${created.length} parfema.`);
      addProcessingLog("INFO", `Zahtev za preradu: ${processingForm.perfumeName.trim()}`);
      setProcessingNotice("Parfem je uspešno dodat.");
      setProcessingForm({
        perfumeName: "",
        perfumeType: "Parfem" as PerfumeType,
        bottleCount: 1,
        bottleVolume: 150,
        latinName: "",
      });
      await fetchProcessingPerfumes();
      // await fetchPlants();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Neuspešna prerada parfema.";
      setProcessingError(msg);
      setProcessingNotice(null);
    } finally {
      setProcessingLoading(false);
    }
  };

  const packageStatusClass = (status: PackageStatus | PackageStatusType) => {
    return (status === "Poslata" || status === "POSLATA") ? "status-purple" : "status-green";
  };

  const packageStatusLabel = (status: PackageStatusType): string => {
    return status === "SPAKOVANA" ? "Spakovana" : "Poslata";
  };

  // const warehouseFillPercent = (warehouse: WarehouseDTO) => {
  //   if (!warehouse.capacity) return 0;
  //   return Math.round((warehouse.used / warehouse.capacity) * 100);
  // };

  // const warehouses = useMemo<WarehouseDTO[]>(() => {
  //   return warehousesSeed.map((wh) => {
  //     const sentPackages = packages.filter(
  //       (pkg) => pkg.warehouseId === wh.id && pkg.status === "POSLATA"
  //     );
  //     return { ...wh, used: sentPackages.length };
  //   });
  // }, [packages]);

  // const sentPackages = useMemo(() => {
  //   return packages.filter((pkg) => pkg.status === "POSLATA" && pkg.warehouseId);
  // }, [packages]);

  const selectedPackageItem = packages.find((pkg) => pkg.id === selectedPackageId) ?? packages[0];

  const fetchPackages = async () => {
    if (!token) return;
    setPackagingLoading(true);
    setPackagingError(null);
    try {
      const list = await packagingAPI.listPackages(token);
      setPackages(list);
      if (list.length > 0 && !selectedPackageId) {
        setSelectedPackageId(list[0].id);
      }
    } catch (err) {
      setPackagingError("Ne mogu da učitam listu ambalaza.");
    } finally {
      setPackagingLoading(false);
    }
  };

  const handlePackSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setPackagingError("Niste prijavljeni.");
      setPackagingNotice(null);
      return;
    }
    if (!packagingForm.name.trim()) {
      setPackagingError("Popunite naziv paketa.");
      setPackagingNotice(null);
      return;
    }
    if (!packagingForm.senderAddress.trim()) {
      setPackagingError("Popunite adresu pošiljaoca.");
      setPackagingNotice(null);
      return;
    }
    if (selectedPerfumeIds.size < 1) {
      setPackagingError("Izaberite bar jedan parfem za pakovanje.");
      setPackagingNotice(null);
      return;
    }

    setPackagingLoading(true);
    setPackagingError(null);
    setPackagingNotice(null);
    try {
      const ids = Array.from(selectedPerfumeIds);
      const pkg = await packagingAPI.packPerfumes(
        {
          name: packagingForm.name.trim(),
          senderAddress: packagingForm.senderAddress.trim(),
          perfumeType: "Parfem",
          count: ids.length,
          perfumeIds: ids,
        },
        token
      );
      setPackagingNotice(`Uspešno spakovano ${pkg.perfumeIds.length} parfema u ambalažu.`);
      setPackagingForm({ name: "", senderAddress: "" });
      setSelectedPerfumeIds(new Set());
      await fetchPackages();
      await fetchAvailablePerfumes();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Neuspešno pakovanje.";
      setPackagingError(msg);
      setPackagingNotice(null);
    } finally {
      setPackagingLoading(false);
    }
  };

  const handleSendToWarehouse = async () => {
    if (!token) {
      setPackagingError("Niste prijavljeni.");
      setPackagingNotice(null);
      return;
    }

    setPackagingLoading(true);
    setPackagingError(null);
    setPackagingNotice(null);
    try {
      const pkg = await packagingAPI.sendToWarehouse({ packageId: selectedPackageId, warehouseId: sendWarehouseId }, token);
      setPackagingNotice(`Ambalaza "${pkg.name}" poslata u skladiste.`);
      await fetchPackages();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Neuspešno slanje u skladište.";
      setPackagingError(msg);
      setPackagingNotice(null);
    } finally {
      setPackagingLoading(false);
    }
  };
  // const selectedPackagingItem = packagingSeed.find((pack) => pack.id === selectedPackageId) ?? packagingSeed[0];

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

  const fetchAvailablePerfumes = async () => {
    if (!token) return;
    try {
      // Fetch both perfumes and packages fresh to avoid stale state
      const [perfumeList, pkgList] = await Promise.all([
        processingAPI.listPerfumes(token),
        packagingAPI.listPackages(token),
      ]);
      const packedIds = new Set<string>();
      pkgList.forEach((pkg) => {
        if (pkg.perfumeIds) pkg.perfumeIds.forEach((pid) => packedIds.add(pid));
      });
      const available = perfumeList.filter(
        (p) => p.status === "Zavrseno" && !packedIds.has(p.id)
      );
      setAvailablePerfumes(available);
    } catch (err) {
      // silently ignore — packaging page will just show empty list
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



  const groupedPlants = useMemo(() => {
    const map = new Map<string, { commonName: string; latinName: string; originCountry: string; count: number; strengthSum: number; statuses: Set<PlantStatus>; planted: number; harvested: number; processed: number }>();
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
          planted: 0,
          harvested: 0,
          processed: 0,
        });
      }
      const entry = map.get(key)!;
      entry.count += 1;
      entry.strengthSum += Number(plant.aromaticStrength);
      entry.statuses.add(plant.status);
      if (plant.status === "POSADJENA") entry.planted += 1;
      else if (plant.status === "UBRANA") entry.harvested += 1;
      else if (plant.status === "PRERADJENA") entry.processed += 1;
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
    if (activeTab === "Proizvodnja" || activeTab === "Pregled" || activeTab === "Prerada") {
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
    if (activeTab === "Proizvodnja") {
      // fetchProductionAuditLogs();
    }
  }, [activeTab, token, authUser?.role]);

  useEffect(() => {
    if (activeTab === "Prerada") {
      fetchProcessingPerfumes();
      // fetchProcessingAuditLogs();
    }
  }, [activeTab, token, authUser?.role]);

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

  useEffect(() => {
    if (activeTab === "Pakovanje" || activeTab === "Skladištenje") {
      fetchPackages();
      fetchAvailablePerfumes();
    }
  }, [activeTab, token]);

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
          {authUser?.role?.toLowerCase() === "admin" && (
            <button
              className={`tab-btn ${activeTab === "Analiza performansi" ? "active" : ""}`}
              onClick={() => setActiveTab("Analiza performansi")}
            >
              Analiza performansi
            </button>
          )}
        </div>

        <div className="window-content dashboard-content">
          {activeTab === "Pregled" ? (
            <div className="dashboard-grid">
              <section className="panel">
                <header className="panel-header">
                  <div className="panel-title">Lista biljaka</div>
                </header>

                <DataTable
                  columns={[
                    { key: "name", label: "Naziv" },
                    { key: "latinName", label: "Latinski naziv", className: "text-muted" },
                    { key: "strength", label: "Jačina", render: (row) => row.strength.toFixed(1) },
                    { key: "country", label: "Zemlja" },
                    { key: "status", label: "Stanje", render: (row) => (
                      <span className={`status-chip ${row.status === "Posađena" ? "status-green" : row.status === "Ubrana" ? "status-yellow" : "status-purple"}`}>
                        {row.status}
                      </span>
                    )},
                  ]}
                  data={overviewPlants}
                  searchPlaceholder="Pretraga biljaka..."
                  emptyMessage="Nema biljaka za prikaz."
                  rowKey="id"
                  footer={<>Ukupno biljaka: {overviewPlants.length}</>}
                />
              </section>

              {authUser?.role?.toUpperCase() !== "ADMIN" && (
                <section className="panel">
                  <header className="panel-header">
                    <div className="panel-title">Fiskalni računi</div>
                  </header>

                  <DataTable
                    columns={[
                      { key: "id", label: "Broj računa" },
                      { key: "saleType", label: "Tip prodaje" },
                      { key: "payment", label: "Način plaćanja" },
                      { key: "amount", label: "Iznos (RSD)", render: (row) => row.amount.toLocaleString("sr-RS") },
                      { key: "date", label: "Datum" },
                    ]}
                    data={overviewInvoices}
                    searchPlaceholder="Pretraga računa..."
                    emptyMessage="Nema računa za prikaz."
                    rowKey="id"
                    footer={<>Ukupno računa: {overviewInvoices.length} | Ukupan promet: {overviewInvoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString("sr-RS")} RSD</>}
                  />
                </section>
              )}
            </div>
          ) : activeTab === "Proizvodnja" ? (
            <div className="production-shell">
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

                    <DataTable
                      columns={[
                        { key: "commonName", label: "Naziv" },
                        { key: "latinName", label: "Latinski naziv", className: "text-muted" },
                        { key: "avgStrength", label: "Jačina", render: (row) => row.avgStrength.toFixed(2) },
                        { key: "planted", label: "Zasađeno", render: (row) => <span className="status-chip status-green">{row.planted}</span> },
                        { key: "harvested", label: "Ubrano", render: (row) => <span className="status-chip status-yellow">{row.harvested}</span> },
                        { key: "processed", label: "Prerađeno", render: (row) => <span className="status-chip status-purple">{row.processed}</span> },
                        { key: "count", label: "Ukupno" },
                      ]}
                      data={groupedPlants}
                      searchPlaceholder="Pretraga biljaka..."
                      emptyMessage="Nema biljaka za prikaz."
                      rowKey={(row) => row.latinName}
                      footer={<>Ukupno biljaka: {productionPlants.length} | Prikazano grupa: {groupedPlants.length}</>}
                    />
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
            </div>
          ) : activeTab === "Prerada" ? (
            <div className="production-shell">
              <div className="production-grid">
                  <section className="panel">
                    <header className="panel-header">
                      <div className="panel-title">Servis prerade</div>
                    </header>

                    <form className="production-form" onSubmit={handleProcessingSubmit}>
                      <div className="form-grid">
                        <label>
                          Naziv parfema
                          <input
                            type="text"
                            value={processingForm.perfumeName}
                            onChange={(e) => setProcessingForm({ ...processingForm, perfumeName: e.target.value })}
                          />
                        </label>
                        <label>
                          Tip
                          <select
                            value={processingForm.perfumeType}
                            onChange={(e) => setProcessingForm({ ...processingForm, perfumeType: e.target.value as PerfumeType })}
                          >
                            <option value="Parfem">Parfem</option>
                            <option value="Kolonjska voda">Kolonjska voda</option>
                          </select>
                        </label>
                        <label>
                          Broj bočica
                          <input
                            type="number"
                            min={1}
                            value={processingForm.bottleCount}
                            onChange={(e) => setProcessingForm({ ...processingForm, bottleCount: Number(e.target.value) })}
                          />
                        </label>
                        <label>
                          Zapremina (ml)
                          <div className="radio-group">
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="bottleVolume"
                                value={150}
                                checked={processingForm.bottleVolume === 150}
                                onChange={() => setProcessingForm({ ...processingForm, bottleVolume: 150 })}
                              />
                              150 ml
                            </label>
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="bottleVolume"
                                value={250}
                                checked={processingForm.bottleVolume === 250}
                                onChange={() => setProcessingForm({ ...processingForm, bottleVolume: 250 })}
                              />
                              250 ml
                            </label>
                          </div>
                        </label>
                        <label>
                          Biljka (latinski naziv)
                          <select
                            value={processingForm.latinName}
                            onChange={(e) => setProcessingForm({ ...processingForm, latinName: e.target.value })}
                          >
                            <option value="">— izaberite biljku —</option>
                            {[...new Map(productionPlants
                              .filter((pl) => pl.status === "UBRANA")
                              .map((pl) => [pl.latinName, pl] as const)
                            ).values()].map((pl) => (
                              <option key={pl.latinName} value={pl.latinName}>
                                {pl.commonName} ({pl.latinName})
                              </option>
                            ))}
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

                    <DataTable
                      columns={[
                        { key: "name", label: "Naziv" },
                        { key: "type", label: "Tip" },
                        { key: "volume", label: "Zapremina", render: (row) => `${row.volume} ml` },
                        { key: "serialNumber", label: "Serijski broj" },
                        { key: "expiresAt", label: "Rok trajanja" },
                        { key: "plantId", label: "Biljka", render: (row) => row.plantId ? productionPlants.find((pl) => pl.id === row.plantId)?.commonName ?? row.plantId : "—" },
                        { key: "status", label: "Status", render: (row) => (
                          <span className={`status-chip ${processingStatusClass(row.status)}`}>
                            {row.status}
                          </span>
                        )},
                      ]}
                      data={processingPerfumes}
                      searchPlaceholder="Pretraga parfema..."
                      emptyMessage="Nema parfema za prikaz."
                      rowKey="id"
                    />
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

                    <DataTable
                      columns={[
                        { key: "id", label: "ID ambalaže", render: (row) => `${row.id.substring(0, 8)}...` },
                        { key: "packageId", label: "ID paketa" },
                        { key: "packageData", label: "Podaci", className: "text-muted", render: (row) =>
                          typeof row.packageData === "object"
                            ? `${row.packageData.name ?? "?"} (${row.packageData.volume ?? "?"}ml × ${row.packageData.count ?? "?"})`
                            : String(row.packageData)
                        },
                        { key: "isDispatched", label: "Status", render: (row) => (
                          <span className={`status-chip ${row.isDispatched ? "status-green" : "status-orange"}`}>
                            {row.isDispatched ? "Poslata" : "U skladištu"}
                          </span>
                        )},
                      ]}
                      data={storagePackages}
                      searchPlaceholder="Pretraga ambalaža..."
                      emptyMessage="Nema ambalaža u skladištu."
                      rowKey="id"
                      footer={<>Ukupno ambalaža: {storagePackages.length}</>}
                    />
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

                {packagingError && (
                  <div className="form-error" style={{ margin: "8px 16px", padding: "8px 12px", background: "#fee", color: "#c00", borderRadius: 6 }}>
                    {packagingError}
                  </div>
                )}
                {packagingNotice && (
                  <div className="form-notice" style={{ margin: "8px 16px", padding: "8px 12px", background: "#efe", color: "#070", borderRadius: 6 }}>
                    {packagingNotice}
                  </div>
                )}

                <form className="production-form" onSubmit={handlePackSubmit}>
                  <div className="form-grid">
                    <label>
                      Naziv paketa
                      <input
                        type="text"
                        value={packagingForm.name}
                        onChange={(e) => setPackagingForm({ ...packagingForm, name: e.target.value })}
                      />
                    </label>
                    <label>
                      Adresa pošiljaoca
                      <input
                        type="text"
                        value={packagingForm.senderAddress}
                        onChange={(e) => setPackagingForm({ ...packagingForm, senderAddress: e.target.value })}
                      />
                    </label>
                  </div>

                  <div style={{ margin: "12px 0" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      Izaberite parfeme za pakovanje ({selectedPerfumeIds.size} izabrano)
                    </div>
                    {availablePerfumes.length === 0 ? (
                      <div className="text-muted" style={{ padding: "8px 0" }}>Nema dostupnih parfema za pakovanje.</div>
                    ) : (
                      <div className="table-wrapper" style={{ maxHeight: 220, overflowY: "auto" }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th style={{ width: 36 }}>
                                <input
                                  type="checkbox"
                                  checked={selectedPerfumeIds.size === availablePerfumes.length && availablePerfumes.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPerfumeIds(new Set(availablePerfumes.map((p) => p.id)));
                                    } else {
                                      setSelectedPerfumeIds(new Set());
                                    }
                                  }}
                                />
                              </th>
                              <th>Naziv</th>
                              <th>Tip</th>
                              <th>Zapremina</th>
                              <th>Serijski broj</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availablePerfumes.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={selectedPerfumeIds.has(p.id)}
                                    onChange={(e) => {
                                      const next = new Set(selectedPerfumeIds);
                                      if (e.target.checked) {
                                        next.add(p.id);
                                      } else {
                                        next.delete(p.id);
                                      }
                                      setSelectedPerfumeIds(next);
                                    }}
                                  />
                                </td>
                                <td>{p.name}</td>
                                <td>{p.type}</td>
                                <td>{p.volume} ml</td>
                                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.serialNumber}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-accent" type="submit" disabled={packagingLoading}>
                      {packagingLoading ? "Pakujem..." : `Spakuj (${selectedPerfumeIds.size})`}
                    </button>
                  </div>
                </form>

                <DataTable
                  columns={[
                    { key: "name", label: "Naziv" },
                    { key: "senderAddress", label: "Adresa pošiljaoca" },
                    { key: "perfumeIds", label: "Parfema", render: (row) => row.perfumeIds.length, sortable: false },
                    { key: "status", label: "Status", render: (row) => (
                      <span className={`status-chip ${packageStatusClass(row.status)}`}>
                        {packageStatusLabel(row.status)}
                      </span>
                    )},
                    { key: "_actions", label: "", sortable: false, render: (row) => (
                      <button
                        className={`btn btn-ghost ${selectedPackageId === row.id ? "selected-btn" : ""}`}
                        onClick={() => setSelectedPackageId(row.id)}
                      >
                        Detalji
                      </button>
                    )},
                  ]}
                  data={packages}
                  searchPlaceholder="Pretraga ambalaza..."
                  emptyMessage="Nema ambalaza za prikaz."
                  rowKey="id"
                  footer={<>Ukupno ambalaza: {packages.length}</>}
                />
              </section>

              <section className="panel packaging-panel">
                <header className="storage-header packaging-header-alt">
                  <div className="storage-header-title">Detalji ambalaze</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      value={sendWarehouseId}
                      onChange={(e) => setSendWarehouseId(e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
                    >
                      {warehousesSeed.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-ghost" onClick={handleSendToWarehouse} disabled={packagingLoading}>
                      Pošalji u skladište
                    </button>
                  </div>
                </header>

                {selectedPackageItem ? (
                  <div style={{ padding: 16 }}>
                    <p><strong>ID:</strong> {selectedPackageItem.id}</p>
                    <p><strong>Naziv:</strong> {selectedPackageItem.name}</p>
                    <p><strong>Adresa pošiljaoca:</strong> {selectedPackageItem.senderAddress}</p>
                    <p><strong>Skladište ID:</strong> {selectedPackageItem.warehouseId ?? "—"}</p>
                    <p><strong>Status:</strong> {packageStatusLabel(selectedPackageItem.status)}</p>
                    <p><strong>Broj parfema:</strong> {selectedPackageItem.perfumeIds.length}</p>
                    <p><strong>Kreirano:</strong> {new Date(selectedPackageItem.createdAt).toLocaleString("sr-RS")}</p>

                    <h4 style={{ marginTop: 16 }}>ID-evi parfema:</h4>
                    <DataTable
                      columns={[
                        { key: "_index", label: "#", sortable: false, render: (_row, idx) => idx + 1 },
                        { key: "pid", label: "Parfem ID", render: (row) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{row.pid}</span> },
                      ]}
                      data={selectedPackageItem.perfumeIds.map((pid) => ({ pid }))}
                      hideSearch
                      rowKey={(row) => row.pid}
                      emptyMessage="Nema parfema."
                    />
                  </div>
                ) : (
                  <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
                    Nema izabrane ambalaze
                  </div>
                )}
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
                      <DataTable
                        columns={[
                          { key: "perfumeName", label: "Parfem" },
                          { key: "unitPrice", label: "Cena (RSD)", render: (row) => row.unitPrice.toLocaleString("sr-RS") },
                          { key: "quantity", label: "Količina", sortable: false, render: (row) => (
                            <input
                              type="number"
                              min={1}
                              value={row.quantity}
                              onChange={(e) => updateCartQuantity(row.perfumeId, Number(e.target.value))}
                              style={{ width: "60px", padding: "4px", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                            />
                          )},
                          { key: "_total", label: "Ukupno (RSD)", render: (row) => (row.quantity * row.unitPrice).toLocaleString("sr-RS") },
                          { key: "_remove", label: "", sortable: false, render: (row) => (
                            <button className="btn btn-ghost" onClick={() => removeFromCart(row.perfumeId)} style={{ color: "#ef4444" }}>
                              ✕
                            </button>
                          )},
                        ]}
                        data={salesCart}
                        hideSearch
                        rowKey={(row) => row.perfumeId}
                        footer={<>Ukupno stavki: {salesCart.length} | Ukupan iznos: {cartTotal.toLocaleString("sr-RS")} RSD</>}
                      />
                    )}
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
                      <DataTable
                        columns={[
                          { key: "id", label: "ID fakture", render: (row) => `${row.id.substring(0, 8)}...` },
                          { key: "saleType", label: "Tip prodaje", render: (row) => (
                            <span className={`status-chip ${row.saleType === "MALOPRODAJA" ? "status-green" : "status-purple"}`}>
                              {saleTypeLabel(row.saleType)}
                            </span>
                          )},
                          { key: "paymentMethod", label: "Način plaćanja", render: (row) => paymentLabel(row.paymentMethod) },
                          { key: "items", label: "Stavke", className: "text-muted", sortable: false, render: (row) =>
                            row.items.map((it: any) => `${it.perfumeName} ×${it.quantity}`).join(", ")
                          },
                          { key: "totalAmount", label: "Iznos (RSD)", render: (row) => Number(row.totalAmount).toLocaleString("sr-RS") },
                          { key: "createdAt", label: "Datum", render: (row) => new Date(row.createdAt).toLocaleDateString("sr-RS") },
                        ]}
                        data={salesInvoices}
                        searchPlaceholder="Pretraga faktura..."
                        emptyMessage="Nema faktura za prikaz."
                        rowKey="id"
                        footer={<>Ukupno faktura: {salesInvoices.length} | Ukupan promet: {salesInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0).toLocaleString("sr-RS")} RSD</>}
                      />
                    )}
                  </section>
                </div>
              )}
            </div>
          ) : activeTab === "Analiza prodaje" ? (
            <div>
              <AnalyticsView analyticsAPI={analyticsAPI} />
            </div>
          ) : activeTab === "Analiza performansi" ? (
            <div>
              <PerformanceView performanceAPI={performanceAPI} />
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
