import React, { useMemo, useState, useEffect } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO, PlantStatus } from "../models/plants/PlantDTO";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";
import { PerfumeDTO, type PerfumeStatus, type PerfumeType } from "../models/processing/PerfumeDTO";
import { IPackagingAPI } from "../api/packaging/IPackagingAPI";
import { PackageDTO, type PackageStatus as PackageStatusType } from "../models/packaging/PackageDTO";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { useAuth } from "../hooks/useAuthHook";

export type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
  processingAPI: IProcessingAPI;
  packagingAPI: IPackagingAPI;
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

type Warehouse = {
  id: string;
  name: string;
  address: string;
  capacity: number;
  used: number;
};

type PackageStatus = "Spakovana" | "Poslata";

type CatalogItem = {
  id: string;
  name: string;
  type: PerfumeType;
  volume: number;
  price: number;
  stock: number;
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

const warehousesSeed: Warehouse[] = [
  { id: "wh-1", name: "Centralno skladište", address: "Pariz, Rue de la Paix 45", capacity: 100, used: 67 },
  { id: "wh-2", name: "Severno skladište", address: "Pariz, Avenue Foch 12", capacity: 75, used: 45 },
  { id: "wh-3", name: "Južno skladište", address: "Pariz, Blvd. Saint-Germain 89", capacity: 50, used: 28 },
];

const catalogSeed: CatalogItem[] = [
  { id: "cat-1", name: "Rosa Mistika", type: "Parfem", volume: 250, price: 12500, stock: 45 },
  { id: "cat-2", name: "Lavander Noir", type: "Kolonjska voda", volume: 150, price: 8900, stock: 67 },
  { id: "cat-3", name: "Bergamot Esenc", type: "Parfem", volume: 250, price: 13200, stock: 23 },
  { id: "cat-4", name: "Jasmin De Nuj", type: "Kolonjska voda", volume: 150, price: 9500, stock: 38 },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI, processingAPI, packagingAPI }) => {
  const appIconUrl = `${import.meta.env.BASE_URL}icon.png`;
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"Pregled" | "Proizvodnja" | "Prerada" | "Pakovanje" | "Skladištenje" | "Prodaja">("Pregled");
  const [plantQuery, setPlantQuery] = useState("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
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
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([
    { id: "log-1", type: "INFO", message: "Zasađena biljka: Lavanda", time: "14:23" },
    { id: "log-2", type: "INFO", message: "Prerada završena: 5 bočica parfema", time: "14:20" },
    { id: "log-3", type: "WARNING", message: "Upozorenje: Jačina ulja prešla 4.0", time: "14:15" },
  ]);
  const [processingForm, setProcessingForm] = useState({
    perfumeName: "",
    perfumeType: "Parfem" as PerfumeType,
    bottleCount: 1,
    bottleVolume: 150 as 150 | 250,
    latinName: "",
  });
  const [processingLogs, setProcessingLogs] = useState<ProductionLog[]>([
    { id: "proc-1", type: "INFO", message: "Pokrenuta prerada: Lavande Noire", time: "12:05" },
    { id: "proc-2", type: "INFO", message: "Završena prerada: Rose Imperial", time: "11:52" },
  ]);
  const [processingPerfumes, setProcessingPerfumes] = useState<PerfumeDTO[]>([]);
  const [processingLoading, setProcessingLoading] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingNotice, setProcessingNotice] = useState<string | null>(null);

  
  const filteredInvoices = useMemo(() => {
    const q = invoiceQuery.trim().toLowerCase();
    if (!q) return invoicesSeed;
    return invoicesSeed.filter((i) =>
      [i.id, i.saleType, i.payment, i.amount.toString(), i.date]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [invoiceQuery]);

  const addProductionLog = (type: ProductionLogType, message: string) => {
    const time = new Date().toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
    setProductionLogs((prev) => [
      { id: `log-${Date.now()}`, type, message, time },
      ...prev,
    ].slice(0, 50));
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
      setProcessingForm({
        perfumeName: "",
        perfumeType: "Parfem" as PerfumeType,
        bottleCount: 1,
        bottleVolume: 150,
        latinName: "",
      });
      await fetchProcessingPerfumes();
      await fetchProductionPlants();
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

  const warehouseFillPercent = (warehouse: Warehouse) => {
    if (!warehouse.capacity) return 0;
    return Math.round((warehouse.used / warehouse.capacity) * 100);
  };

  const warehouses = useMemo<Warehouse[]>(() => {
    return warehousesSeed.map((wh) => {
      const sentPackages = packages.filter(
        (pkg) => pkg.warehouseId === wh.id && pkg.status === "POSLATA"
      );
      return { ...wh, used: sentPackages.length };
    });
  }, [packages]);

  const sentPackages = useMemo(() => {
    return packages.filter((pkg) => pkg.status === "POSLATA" && pkg.warehouseId);
  }, [packages]);

  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId) ?? packages[0];

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

  useEffect(() => {
    if (activeTab === "Prerada") {
      fetchProcessingPerfumes();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === "Pakovanje" || activeTab === "Skladištenje") {
      fetchPackages();
      fetchAvailablePerfumes();
    }
  }, [activeTab, token]);

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
          {(["Pregled", "Proizvodnja", "Prerada", "Pakovanje", "Skladištenje", "Prodaja"] as const).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
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
                      {filteredInvoices.map((i) => (
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
                  Ukupno računa: {filteredInvoices.length} | Ukupan promet: {filteredInvoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString("sr-RS")} RSD
                </footer>
              </section>
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

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Naziv</th>
                            <th>Latinski naziv</th>
                            <th>Jačina</th>
                            <th>Zasađeno</th>
                            <th>Ubrano</th>
                            <th>Prerađeno</th>
                            <th>Ukupno</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedPlants.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-muted">
                                Nema biljaka za prikaz.
                              </td>
                            </tr>
                          ) : (
                            groupedPlants.map((plant) => (
                              <tr key={plant.latinName}>
                                <td>{plant.commonName}</td>
                                <td className="text-muted">{plant.latinName}</td>
                                <td>{plant.avgStrength.toFixed(2)}</td>
                                <td>
                                  <span className="status-chip status-green">{plant.planted}</span>
                                </td>
                                <td>
                                  <span className="status-chip status-yellow">{plant.harvested}</span>
                                </td>
                                <td>
                                  <span className="status-chip status-purple">{plant.processed}</span>
                                </td>
                                <td>{plant.count}</td>
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
                      <button className="btn btn-ghost" onClick={fetchProductionPlants} disabled={productionLoading}>
                        Osveži
                      </button>
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

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Naziv</th>
                            <th>Tip</th>
                            <th>Zapremina</th>
                            <th>Serijski broj</th>
                            <th>Rok trajanja</th>
                            <th>Biljka</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processingPerfumes.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-muted">
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
                                <td>{p.plantId ? productionPlants.find((pl) => pl.id === p.plantId)?.commonName ?? p.plantId : "—"}</td>
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

              {storageTab === "Servis skladištenja" ? (
                <div className="storage-grid">
                  <section className="panel storage-panel">
                    <header className="storage-header storage-header-orange">
                      <div className="storage-header-title">Skladišta</div>
                    </header>

                    <div className="storage-list">
                      {warehouses.map((warehouse) => (
                        <article key={warehouse.id} className="warehouse-card">
                          <div className="warehouse-title">
                            <div>
                              <div className="warehouse-name">{warehouse.name}</div>
                              <div className="warehouse-address">{warehouse.address}</div>
                            </div>
                            <div className="warehouse-icon">▣</div>
                          </div>

                          <div className="warehouse-meta">
                            <span>Kapacitet:</span>
                            <strong>
                              {warehouse.used} / {warehouse.capacity}
                            </strong>
                          </div>

                          <div className="progress">
                            <div
                              className="progress-bar"
                              style={{ width: `${warehouseFillPercent(warehouse)}%` }}
                            ></div>
                          </div>
                          <div className="warehouse-percent">{warehouseFillPercent(warehouse)}% popunjeno</div>
                        </article>
                      ))}
                    </div>

                    <footer className="panel-footer">
                      Ukupno skladišta: {warehouses.length}
                    </footer>
                  </section>

                  <section className="panel storage-panel">
                    <header className="storage-header storage-header-purple">
                      <div className="storage-header-title">Ambalaže u skladištu</div>
                      <button className="btn btn-ghost">Pošalji</button>
                    </header>

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID ambalaže</th>
                            <th>Pošiljalac</th>
                            <th>Broj parfema</th>
                            <th>Skladište</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sentPackages.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-muted">
                                Nema ambalaza u skladištu.
                              </td>
                            </tr>
                          ) : (
                            sentPackages.map((pack) => (
                              <tr key={pack.id}>
                                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{pack.id.substring(0, 8)}...</td>
                                <td className="text-muted">{pack.senderAddress}</td>
                                <td>{pack.perfumeIds.length}</td>
                                <td>{warehousesSeed.find((w) => w.id === pack.warehouseId)?.name ?? pack.warehouseId}</td>
                                <td>
                                  <span className={`status-chip ${packageStatusClass(pack.status)}`}>
                                    {packageStatusLabel(pack.status)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <footer className="panel-footer">
                      Ukupno ambalaža: {sentPackages.length}
                    </footer>
                  </section>
                </div>
              ) : (
                <div className="sales-grid">
                  <section className="panel storage-panel">
                    <header className="storage-header sales-header-green">
                      <div className="storage-header-title">Katalog parfema</div>
                    </header>

                    <div className="catalog-grid">
                      {catalogSeed.map((item) => (
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
                          <div className="catalog-price">{item.price.toLocaleString("sr-RS")} RSD</div>
                          <div className="catalog-stock">Na stanju: {item.stock}</div>
                          <button className="btn btn-accent catalog-btn">Dodaj u korpu</button>
                        </article>
                      ))}
                    </div>

                    <footer className="panel-footer">
                      Ukupno proizvoda u katalogu: {catalogSeed.length}
                    </footer>
                  </section>

                  <section className="panel storage-panel">
                    <header className="storage-header sales-header-blue">
                      <div className="storage-header-title">Korpa (0)</div>
                    </header>

                    <div className="cart-empty">
                      <div className="cart-icon">🛒</div>
                      <div>Korpa je prazna</div>
                    </div>
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

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Naziv</th>
                        <th>Adresa pošiljaoca</th>
                        <th>Parfema</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((pkg) => (
                        <tr key={pkg.id}>
                          <td>{pkg.name}</td>
                          <td>{pkg.senderAddress}</td>
                          <td>{pkg.perfumeIds.length}</td>
                          <td>
                            <span className={`status-chip ${packageStatusClass(pkg.status)}`}>
                              {packageStatusLabel(pkg.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-ghost ${selectedPackageId === pkg.id ? "selected-btn" : ""}`}
                              onClick={() => setSelectedPackageId(pkg.id)}
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
                  Ukupno ambalaza: {packages.length}
                </footer>
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

                {selectedPackage ? (
                  <div style={{ padding: 16 }}>
                    <p><strong>ID:</strong> {selectedPackage.id}</p>
                    <p><strong>Naziv:</strong> {selectedPackage.name}</p>
                    <p><strong>Adresa pošiljaoca:</strong> {selectedPackage.senderAddress}</p>
                    <p><strong>Skladište ID:</strong> {selectedPackage.warehouseId ?? "—"}</p>
                    <p><strong>Status:</strong> {packageStatusLabel(selectedPackage.status)}</p>
                    <p><strong>Broj parfema:</strong> {selectedPackage.perfumeIds.length}</p>
                    <p><strong>Kreirano:</strong> {new Date(selectedPackage.createdAt).toLocaleString("sr-RS")}</p>

                    <h4 style={{ marginTop: 16 }}>ID-evi parfema:</h4>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Parfem ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPackage.perfumeIds.map((pid, i) => (
                            <tr key={pid}>
                              <td>{i + 1}</td>
                              <td style={{ fontFamily: "monospace", fontSize: 12 }}>{pid}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
                    Nema izabrane ambalaze
                  </div>
                )}
              </section>
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
