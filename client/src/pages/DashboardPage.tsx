import React, { useMemo, useState, useEffect } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { PlantDTO, PlantStatus } from "../models/plants/PlantDTO";
import { IProcessingAPI } from "../api/processing/IProcessingAPI";
import { PerfumeDTO, type PerfumeStatus, type PerfumeType } from "../models/processing/PerfumeDTO";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { UserManagement } from "../components/dashboard/users/UserManagement";
import { AuditLogViewer } from "../components/dashboard/audit/AuditLogViewer";
import { IAuditAPI } from "../api/audit/IAuditAPI";
import { useAuth } from "../hooks/useAuthHook";

export type DashboardPageProps = {
  userAPI: IUserAPI;
  plantAPI: IPlantAPI;
  processingAPI: IProcessingAPI;
  auditAPI: IAuditAPI;
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

type PackageRow = {
  id: string;
  sender: string;
  perfumeCount: number;
  warehouse: string;
  status: PackageStatus;
};

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


const warehousesSeed: Warehouse[] = [
  {
    id: "wh-1",
    name: "Centralno skladište",
    address: "Pariz, Rue de la Paix 45",
    capacity: 100,
    used: 67,
  },
  {
    id: "wh-2",
    name: "Severno skladište",
    address: "Pariz, Avenue Foch 12",
    capacity: 75,
    used: 45,
  },
  {
    id: "wh-3",
    name: "Južno skladište",
    address: "Pariz, Blvd. Saint-Germain 89",
    capacity: 50,
    used: 28,
  },
];

const packagesSeed: PackageRow[] = [
  { id: "AMB-2025-001", sender: "Centar za pakovanje 1", perfumeCount: 24, warehouse: "Centralno skladište", status: "Spakovana" },
  { id: "AMB-2025-002", sender: "Centar za pakovanje 1", perfumeCount: 18, warehouse: "Centralno skladište", status: "Poslata" },
  { id: "AMB-2025-003", sender: "Centar za pakovanje 2", perfumeCount: 30, warehouse: "Severno skladište", status: "Spakovana" },
  { id: "AMB-2025-004", sender: "Centar za pakovanje 2", perfumeCount: 12, warehouse: "Severno skladište", status: "Spakovana" },
  { id: "AMB-2025-005", sender: "Centar za pakovanje 3", perfumeCount: 20, warehouse: "Južno skladište", status: "Poslata" },
];

const catalogSeed: CatalogItem[] = [
  { id: "cat-1", name: "Rosa Mistika", type: "Parfem", volume: 250, price: 12500, stock: 45 },
  { id: "cat-2", name: "Lavander Noir", type: "Kolonjska voda", volume: 150, price: 8900, stock: 67 },
  { id: "cat-3", name: "Bergamot Esenc", type: "Parfem", volume: 250, price: 13200, stock: 23 },
  { id: "cat-4", name: "Jasmin De Nuj", type: "Kolonjska voda", volume: 150, price: 9500, stock: 38 },
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

export const DashboardPage: React.FC<DashboardPageProps> = ({ userAPI, plantAPI, processingAPI, auditAPI }) => {
  const appIconUrl = `${import.meta.env.BASE_URL}icon.png`;
  const { token, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"Pregled" | "Proizvodnja" | "Prerada" | "Pakovanje" | "Skladištenje" | "Prodaja" | "Korisnici" | "Evidencija">("Pregled");
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
    // Osvježi iz audit servisa nakon kratkog delay-a
    setTimeout(() => fetchProductionAuditLogs(), 1500);
  };

  const addProcessingLog = (type: ProductionLogType, message: string) => {
    const time = new Date().toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
    setProcessingLogs((prev) => [
      { id: `proc-${Date.now()}`, type, message, time },
      ...prev,
    ].slice(0, 50));
    setTimeout(() => fetchProcessingAuditLogs(), 1500);
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

  const warehouseFillPercent = (warehouse: Warehouse) => {
    if (!warehouse.capacity) return 0;
    return Math.round((warehouse.used / warehouse.capacity) * 100);
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
    if (!token) return;
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
    if (!token) return;
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
  }, [activeTab, productionTab, token]);

  useEffect(() => {
    if (activeTab === "Proizvodnja" && productionTab === "Servis prerade") {
      fetchProcessingPerfumes();
      fetchProcessingAuditLogs();
    }
  }, [activeTab, productionTab, token]);

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
                      <button className="btn btn-ghost" onClick={fetchProductionAuditLogs} disabled={productionLoading}>
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
                      <button className="btn btn-ghost" onClick={fetchProcessingAuditLogs}>
                        Osveži
                      </button>
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

              {storageTab === "Servis skladištenja" ? (
                <div className="storage-grid">
                  <section className="panel storage-panel">
                    <header className="storage-header storage-header-orange">
                      <div className="storage-header-title">Skladišta</div>
                    </header>

                    <div className="storage-list">
                      {warehousesSeed.map((warehouse) => (
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
                      Ukupno skladišta: {warehousesSeed.length}
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
                          {packagesSeed.map((pack) => (
                            <tr key={pack.id}>
                              <td>{pack.id}</td>
                              <td className="text-muted">{pack.sender}</td>
                              <td>{pack.perfumeCount}</td>
                              <td>{pack.warehouse}</td>
                              <td>
                                <span className={`status-chip ${packageStatusClass(pack.status)}`}>
                                  {pack.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <footer className="panel-footer">
                      Ukupno ambalaža: {packagesSeed.length}
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
