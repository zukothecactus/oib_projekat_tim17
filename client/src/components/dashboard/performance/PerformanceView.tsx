import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { IPerformanceAPI } from "../../../api/performance/IPerformanceAPI";
import {
  SimulationResultDTO,
  PerformanceReportDTO,
  AlgorithmResultDTO,
} from "../../../models/performance/PerformanceDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PerformanceViewProps = {
  performanceAPI: IPerformanceAPI;
};

export const PerformanceView: React.FC<PerformanceViewProps> = ({ performanceAPI }) => {
  const { token } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<"Simulacija" | "Prethodne simulacije">("Simulacija");
  const [packageCount, setPackageCount] = useState<number>(30);
  const [simulationResult, setSimulationResult] = useState<SimulationResultDTO | null>(null);
  const [reports, setReports] = useState<PerformanceReportDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await performanceAPI.listReports(token);
      setReports(list);
    } catch {
      setError("Ne mogu da učitam prethodne izveštaje.");
    } finally {
      setLoading(false);
    }
  }, [token, performanceAPI]);

  useEffect(() => {
    if (activeSubTab === "Prethodne simulacije") {
      fetchReports();
    }
  }, [activeSubTab, fetchReports]);

  const handleRunSimulation = async () => {
    if (!token) return;
    if (packageCount < 1) {
      setError("Broj ambalaža mora biti >= 1.");
      return;
    }
    setSimulating(true);
    setError(null);
    setNotice(null);
    setSimulationResult(null);
    try {
      const result = await performanceAPI.runSimulation(token, packageCount);
      setSimulationResult(result);
      setNotice("Simulacija uspešno završena!");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Greška pri pokretanju simulacije.");
    } finally {
      setSimulating(false);
    }
  };

  // Group reports by simulation (packageCount pairs)
  const groupedSimulations = (() => {
    const groups: { packageCount: number; dc: AlgorithmResultDTO | null; wc: AlgorithmResultDTO | null; conclusion: string; createdAt: string; reports: PerformanceReportDTO[] }[] = [];
    const processedIds = new Set<string>();

    for (const report of reports) {
      if (processedIds.has(report.id)) continue;

      const params = typeof report.simulationParams === "string"
        ? JSON.parse(report.simulationParams)
        : report.simulationParams;
      const pc = params.packageCount;

      // Find matching pair
      const pair = reports.find(
        (r) =>
          r.id !== report.id &&
          !processedIds.has(r.id) &&
          r.algorithmName !== report.algorithmName &&
          (() => {
            const p = typeof r.simulationParams === "string" ? JSON.parse(r.simulationParams) : r.simulationParams;
            return p.packageCount === pc;
          })()
      );

      const dcReport = report.algorithmName === "DistributionCenter" ? report : pair;
      const wcReport = report.algorithmName === "WarehouseCenter" ? report : pair;

      const dcResults = dcReport ? (typeof dcReport.results === "string" ? JSON.parse(dcReport.results) : dcReport.results) : null;
      const wcResults = wcReport ? (typeof wcReport.results === "string" ? JSON.parse(wcReport.results) : wcReport.results) : null;

      processedIds.add(report.id);
      if (pair) processedIds.add(pair.id);

      const simReports: PerformanceReportDTO[] = [report];
      if (pair) simReports.push(pair);

      groups.push({
        packageCount: pc,
        dc: dcResults,
        wc: wcResults,
        conclusion: report.conclusion,
        createdAt: report.createdAt,
        reports: simReports,
      });
    }

    return groups;
  })();

  const handleExportPDF = (sim: typeof groupedSimulations[0]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Izveštaj performansi", 14, 20);
    doc.setFontSize(11);
    doc.text(`Datum: ${new Date(sim.createdAt).toLocaleString("sr-RS")}`, 14, 30);
    doc.text(`Broj ambalaža: ${sim.packageCount}`, 14, 38);

    const tableData: string[][] = [];
    const headers = ["Metrika", "DistributionCenter", "WarehouseCenter"];

    if (sim.dc && sim.wc) {
      tableData.push(["Ambalaža po turu", String(sim.dc.packagesPerTurn), String(sim.wc.packagesPerTurn)]);
      tableData.push(["Kašnjenje po turu (s)", String(sim.dc.delayPerTurn), String(sim.wc.delayPerTurn)]);
      tableData.push(["Ukupno turova", String(sim.dc.totalTurns), String(sim.wc.totalTurns)]);
      tableData.push(["Ukupno vreme (s)", String(sim.dc.totalTime), String(sim.wc.totalTime)]);
      tableData.push(["Throughput (pkg/s)", String(sim.dc.throughput), String(sim.wc.throughput)]);
    }

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 45,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 195, 247] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 100;
    doc.setFontSize(11);
    doc.text("Zaključak:", 14, finalY + 10);
    const lines = doc.splitTextToSize(sim.conclusion, 180);
    doc.setFontSize(10);
    doc.text(lines, 14, finalY + 18);

    doc.save(`performanse_${sim.packageCount}_ambalaza.pdf`);
  };

  const chartData = simulationResult
    ? [
        {
          name: "Ukupno vreme (s)",
          DistributionCenter: simulationResult.distributionCenter.totalTime,
          WarehouseCenter: simulationResult.warehouseCenter.totalTime,
        },
        {
          name: "Throughput (pkg/s)",
          DistributionCenter: simulationResult.distributionCenter.throughput,
          WarehouseCenter: simulationResult.warehouseCenter.throughput,
        },
      ]
    : [];

  return (
    <div style={{ padding: "0" }}>
      <div className="production-tabs" style={{ marginBottom: 16 }}>
        {(["Simulacija", "Prethodne simulacije"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeSubTab === tab ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="notice error" style={{ margin: "0 0 12px 0" }}>{error}</div>}
      {notice && <div className="notice success" style={{ margin: "0 0 12px 0" }}>{notice}</div>}

      {activeSubTab === "Simulacija" ? (
        <div>
          {/* Simulation Form */}
          <section className="panel" style={{ marginBottom: 16 }}>
            <header className="panel-header">
              <div className="panel-title">Pokreni simulaciju</div>
            </header>
            <div className="production-form" style={{ padding: 16 }}>
              <div className="form-grid" style={{ maxWidth: 400 }}>
                <label>
                  Broj ambalaža
                  <input
                    type="number"
                    min={1}
                    value={packageCount}
                    onChange={(e) => setPackageCount(Number(e.target.value))}
                    style={{ width: "100%", padding: "8px", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                  />
                </label>
              </div>
              <div className="form-actions" style={{ marginTop: 12 }}>
                <button
                  className="btn btn-accent"
                  onClick={handleRunSimulation}
                  disabled={simulating}
                >
                  {simulating ? "Simulacija u toku..." : "Pokreni simulaciju"}
                </button>
              </div>
            </div>
          </section>

          {/* Simulation Results */}
          {simulationResult && (
            <>
              {/* Bar Chart */}
              <section className="panel" style={{ marginBottom: 16 }}>
                <header className="panel-header">
                  <div className="panel-title">Poređenje algoritama</div>
                </header>
                <div style={{ padding: 16 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                        labelStyle={{ color: "#e0e0e0" }}
                      />
                      <Legend />
                      <Bar dataKey="DistributionCenter" fill="#4fc3f7" name="DistributionCenter" />
                      <Bar dataKey="WarehouseCenter" fill="#e57373" name="WarehouseCenter" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Results Table */}
              <section className="panel" style={{ marginBottom: 16 }}>
                <header className="panel-header">
                  <div className="panel-title">Rezultati simulacije</div>
                </header>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Metrika</th>
                        <th>DistributionCenter</th>
                        <th>WarehouseCenter</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Broj ambalaža</td>
                        <td>{simulationResult.distributionCenter.packageCount}</td>
                        <td>{simulationResult.warehouseCenter.packageCount}</td>
                      </tr>
                      <tr>
                        <td>Ambalaža po turu</td>
                        <td>{simulationResult.distributionCenter.packagesPerTurn}</td>
                        <td>{simulationResult.warehouseCenter.packagesPerTurn}</td>
                      </tr>
                      <tr>
                        <td>Kašnjenje po turu (s)</td>
                        <td>{simulationResult.distributionCenter.delayPerTurn}</td>
                        <td>{simulationResult.warehouseCenter.delayPerTurn}</td>
                      </tr>
                      <tr>
                        <td>Ukupno turova</td>
                        <td>{simulationResult.distributionCenter.totalTurns}</td>
                        <td>{simulationResult.warehouseCenter.totalTurns}</td>
                      </tr>
                      <tr>
                        <td>Ukupno vreme (s)</td>
                        <td style={{ color: "#81c784", fontWeight: 600 }}>{simulationResult.distributionCenter.totalTime}</td>
                        <td style={{ color: "#e57373", fontWeight: 600 }}>{simulationResult.warehouseCenter.totalTime}</td>
                      </tr>
                      <tr>
                        <td>Throughput (pkg/s)</td>
                        <td style={{ color: "#81c784", fontWeight: 600 }}>{simulationResult.distributionCenter.throughput}</td>
                        <td style={{ color: "#e57373", fontWeight: 600 }}>{simulationResult.warehouseCenter.throughput}</td>
                      </tr>
                      <tr>
                        <td>Razlika u efikasnosti</td>
                        <td colSpan={2} style={{ textAlign: "center", fontWeight: 700, color: "#4fc3f7" }}>
                          {simulationResult.efficiencyDiff}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Conclusion */}
              <section className="panel" style={{ marginBottom: 16 }}>
                <header className="panel-header">
                  <div className="panel-title">Zaključak</div>
                </header>
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      background: "#1a1a2e",
                      borderRadius: 8,
                      padding: 16,
                      border: "1px solid #333",
                      color: "#e0e0e0",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {simulationResult.conclusion}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      ) : (
        <div>
          {/* Previous Simulations */}
          <section className="panel">
            <header className="panel-header">
              <div className="panel-title">Prethodne simulacije</div>
              <button className="btn btn-ghost" onClick={fetchReports} disabled={loading}>
                Osveži
              </button>
            </header>

            {loading ? (
              <p style={{ padding: 20, textAlign: "center", color: "#888" }}>Učitavanje...</p>
            ) : groupedSimulations.length === 0 ? (
              <p style={{ padding: 20, textAlign: "center", color: "#888" }}>Nema prethodnih simulacija.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
                {groupedSimulations.map((sim, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#1a1a2e",
                      borderRadius: 8,
                      border: "1px solid #333",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderBottom: "1px solid #333",
                        background: "#16162a",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: "#e0e0e0" }}>
                          Simulacija: {sim.packageCount} ambalaža
                        </span>
                        <span style={{ marginLeft: 12, fontSize: "0.85rem", color: "#888" }}>
                          {new Date(sim.createdAt).toLocaleString("sr-RS")}
                        </span>
                      </div>
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleExportPDF(sim)}
                        style={{ padding: "6px 12px" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 4 }}>
                          <path d="M4 0v16h12V4l-4-4H4zm8 1l3 3h-3V1zM5 1h6v4h4v10H5V1zm1 6v1h6V7H6zm0 2v1h6V9H6zm0 2v1h4v-1H6z"/>
                        </svg>
                        PDF
                      </button>
                    </div>

                    <div className="table-wrapper" style={{ margin: 0 }}>
                      <table className="data-table" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th>Metrika</th>
                            <th>DistributionCenter</th>
                            <th>WarehouseCenter</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Ukupno vreme (s)</td>
                            <td style={{ color: "#81c784" }}>{sim.dc?.totalTime ?? "—"}</td>
                            <td style={{ color: "#e57373" }}>{sim.wc?.totalTime ?? "—"}</td>
                          </tr>
                          <tr>
                            <td>Throughput (pkg/s)</td>
                            <td style={{ color: "#81c784" }}>{sim.dc?.throughput ?? "—"}</td>
                            <td style={{ color: "#e57373" }}>{sim.wc?.throughput ?? "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ padding: "10px 16px", fontSize: "0.9rem", color: "#9ca3af", borderTop: "1px solid #333" }}>
                      {sim.conclusion}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <footer className="panel-footer">
              Ukupno simulacija: {groupedSimulations.length}
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};
