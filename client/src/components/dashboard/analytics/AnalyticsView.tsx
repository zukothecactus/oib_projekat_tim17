import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { IAnalyticsAPI } from "../../../api/analytics/IAnalyticsAPI";
import {
  SalesByCriteriaDTO,
  SalesTrendDTO,
  Top10PerfumeDTO,
  Top10RevenueDTO,
  AnalyticsReportDTO,
  ReportData,
} from "../../../models/analytics/AnalyticsDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AnalyticsViewProps = {
  analyticsAPI: IAnalyticsAPI;
};

const COLORS = ["#4fc3f7", "#81c784", "#ffb74d", "#e57373", "#ba68c8", "#4db6ac", "#ff8a65", "#a1887f", "#90a4ae", "#aed581"];

const reportTypeLabels: Record<string, string> = {
  MONTHLY: "Mesečni",
  WEEKLY: "Nedeljni",
  YEARLY: "Godišnji",
  TOTAL: "Ukupni",
  TREND: "Trend",
  TOP10: "Top 10",
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analyticsAPI }) => {
  const { token } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<"Pregled" | "Po periodu" | "Trend" | "Top 10" | "Izveštaji">("Pregled");
  const [criteria, setCriteria] = useState<string>("month");
  const [salesData, setSalesData] = useState<SalesByCriteriaDTO[]>([]);
  const [trendData, setTrendData] = useState<SalesTrendDTO[]>([]);
  const [top10Qty, setTop10Qty] = useState<Top10PerfumeDTO[]>([]);
  const [top10Rev, setTop10Rev] = useState<Top10RevenueDTO[]>([]);
  const [reports, setReports] = useState<AnalyticsReportDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchSalesData = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const data = await analyticsAPI.getSalesByCriteria(token, criteria);
      setSalesData(data);
    } catch { setError("Greška pri učitavanju podataka o prodaji."); }
    finally { setLoading(false); }
  }, [token, criteria, analyticsAPI]);

  const fetchTrend = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const data = await analyticsAPI.getSalesTrend(token);
      setTrendData(data);
    } catch { setError("Greška pri učitavanju trenda."); }
    finally { setLoading(false); }
  }, [token, analyticsAPI]);

  const fetchTop10 = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const [qty, rev] = await Promise.all([
        analyticsAPI.getTop10Perfumes(token),
        analyticsAPI.getTop10Revenue(token),
      ]);
      setTop10Qty(qty);
      setTop10Rev(rev);
    } catch { setError("Greška pri učitavanju Top 10."); }
    finally { setLoading(false); }
  }, [token, analyticsAPI]);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const list = await analyticsAPI.listReports(token);
      setReports(list);
    } catch { setError("Greška pri učitavanju izveštaja."); }
    finally { setLoading(false); }
  }, [token, analyticsAPI]);

  useEffect(() => {
    if (activeSubTab === "Pregled" || activeSubTab === "Po periodu") fetchSalesData();
    if (activeSubTab === "Pregled" || activeSubTab === "Trend") fetchTrend();
    if (activeSubTab === "Pregled" || activeSubTab === "Top 10") fetchTop10();
    if (activeSubTab === "Izveštaji") fetchReports();
  }, [activeSubTab, criteria]);

  const handleGenerateReport = async (type: string) => {
    if (!token) return;
    setGenerating(type); setError(null); setNotice(null);
    try {
      await analyticsAPI.generateReport(token, type);
      setNotice(`Izveštaj "${reportTypeLabels[type]}" uspešno generisan.`);
      await fetchReports();
      setTimeout(() => setNotice(null), 3000);
    } catch { setError("Greška pri generisanju izveštaja."); }
    finally { setGenerating(null); }
  };

  const handleDownloadPDF = (report: AnalyticsReportDTO) => {
    try {
      const reportData: ReportData = JSON.parse(report.data);
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text(reportData.title, 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generisano: ${new Date(reportData.generatedAt).toLocaleString("sr-RS")}`, 14, 30);
      doc.setTextColor(0);

      let yOffset = 40;

      for (const section of reportData.sections) {
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }

        doc.setFontSize(14);
        doc.text(section.heading, 14, yOffset);
        yOffset += 8;

        if (section.table) {
          autoTable(doc, {
            startY: yOffset,
            head: [section.table.headers],
            body: section.table.rows,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [66, 133, 244], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [245, 245, 245] },
          });
          yOffset = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      doc.save(`${reportData.title.replace(/\s+/g, "_")}_${report.id.substring(0, 8)}.pdf`);
    } catch {
      setError("Greška pri kreiranju PDF-a.");
    }
  };

  const criteriaLabels: Record<string, string> = {
    month: "Mesečno",
    week: "Nedeljno",
    year: "Godišnje",
    total: "Ukupno",
  };

  const subTabs = ["Pregled", "Po periodu", "Trend", "Top 10", "Izveštaji"] as const;

  return (
    <div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", flexWrap: "wrap" }}>
        {subTabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeSubTab === tab ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab)}
            style={{ fontSize: "12px", padding: "6px 14px" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "12px" }}>{error}</div>}
      {notice && <div className="alert alert-success" style={{ marginBottom: "12px" }}>{notice}</div>}
      {loading && <div style={{ textAlign: "center", padding: "20px" }}><div className="spinner"></div></div>}

      {/* ======== PREGLED ======== */}
      {activeSubTab === "Pregled" && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Revenue trend chart */}
          <section className="panel" style={{ gridColumn: "1 / -1" }}>
            <header className="panel-header"><div className="panel-title">Trend prihoda</div></header>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#2d2d30", border: "1px solid #555", borderRadius: 6 }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4fc3f7" strokeWidth={2} name="Prihod (RSD)" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top 10 by quantity */}
          <section className="panel">
            <header className="panel-header"><div className="panel-title">Top parfemi (količina)</div></header>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Qty} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#aaa" fontSize={12} />
                  <YAxis dataKey="perfumeName" type="category" width={120} stroke="#aaa" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#2d2d30", border: "1px solid #555", borderRadius: 6 }} />
                  <Bar dataKey="totalQuantity" name="Količina" fill="#81c784" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top 10 by revenue */}
          <section className="panel">
            <header className="panel-header"><div className="panel-title">Top parfemi (prihod)</div></header>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={top10Rev} dataKey="totalRevenue" nameKey="perfumeName" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: any) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>
                    {top10Rev.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#2d2d30", border: "1px solid #555", borderRadius: 6 }} formatter={(value: any) => `${Number(value).toLocaleString("sr-RS")} RSD`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {/* ======== PO PERIODU ======== */}
      {activeSubTab === "Po periodu" && !loading && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--win11-text-secondary)" }}>Period:</span>
            {Object.entries(criteriaLabels).map(([key, label]) => (
              <button
                key={key}
                className={`btn ${criteria === key ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setCriteria(key)}
                style={{ fontSize: "12px", padding: "4px 12px" }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <section className="panel" style={{ marginBottom: "16px" }}>
            <header className="panel-header"><div className="panel-title">Grafikon prodaje — {criteriaLabels[criteria]}</div></header>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="period" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#2d2d30", border: "1px solid #555", borderRadius: 6 }} />
                  <Legend />
                  <Bar dataKey="totalRevenue" name="Prihod (RSD)" fill="#4fc3f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalSales" name="Prodato komada" fill="#81c784" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Table */}
          <section className="panel">
            <header className="panel-header"><div className="panel-title">Tabela prodaje</div></header>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Br. faktura</th>
                    <th>Prodato</th>
                    <th>Prihod (RSD)</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.length === 0 ? (
                    <tr><td colSpan={4} className="text-muted">Nema podataka.</td></tr>
                  ) : (
                    salesData.map((row) => (
                      <tr key={row.period}>
                        <td>{row.period}</td>
                        <td>{row.invoiceCount}</td>
                        <td>{row.totalSales}</td>
                        <td>{Number(row.totalRevenue).toLocaleString("sr-RS")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Generate report button */}
          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <button
              className="btn btn-primary"
              disabled={generating !== null}
              onClick={() => {
                const typeMap: Record<string, string> = { month: "MONTHLY", week: "WEEKLY", year: "YEARLY", total: "TOTAL" };
                handleGenerateReport(typeMap[criteria] ?? "MONTHLY");
              }}
            >
              {generating ? "Generisanje..." : `Generiši ${criteriaLabels[criteria]} izveštaj`}
            </button>
          </div>
        </div>
      )}

      {/* ======== TREND ======== */}
      {activeSubTab === "Trend" && !loading && (
        <div>
          <section className="panel" style={{ marginBottom: "16px" }}>
            <header className="panel-header"><div className="panel-title">Mesečni trend prihoda</div></header>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#2d2d30", border: "1px solid #555", borderRadius: 6 }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4fc3f7" strokeWidth={2} name="Prihod (RSD)" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel">
            <header className="panel-header"><div className="panel-title">Detalji trenda</div></header>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mesec</th>
                    <th>Prihod (RSD)</th>
                    <th>Promena</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.length === 0 ? (
                    <tr><td colSpan={3} className="text-muted">Nema podataka.</td></tr>
                  ) : (
                    trendData.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td>{Number(row.revenue).toLocaleString("sr-RS")}</td>
                        <td>
                          {row.changePercent !== null ? (
                            <span style={{ color: row.changePercent >= 0 ? "#81c784" : "#e57373", fontWeight: 600 }}>
                              {row.changePercent > 0 ? "+" : ""}{row.changePercent}%
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ marginTop: "12px" }}>
            <button className="btn btn-primary" disabled={generating !== null} onClick={() => handleGenerateReport("TREND")}>
              {generating === "TREND" ? "Generisanje..." : "Generiši Trend izveštaj"}
            </button>
          </div>
        </div>
      )}

      {/* ======== TOP 10 ======== */}
      {activeSubTab === "Top 10" && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <section className="panel">
            <header className="panel-header"><div className="panel-title">Top 10 — Količina</div></header>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Qty} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#aaa" fontSize={12} />
                  <YAxis dataKey="perfumeName" type="category" width={130} stroke="#aaa" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#2d2d30", border: "1px solid #555", borderRadius: 6 }} />
                  <Bar dataKey="totalQuantity" name="Količina" fill="#81c784" radius={[0, 4, 4, 0]}>
                    {top10Qty.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-wrapper" style={{ marginTop: "8px" }}>
              <table className="data-table">
                <thead><tr><th>Parfem</th><th>Količina</th></tr></thead>
                <tbody>
                  {top10Qty.map((p) => (
                    <tr key={p.perfumeId}><td>{p.perfumeName}</td><td>{p.totalQuantity}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <header className="panel-header"><div className="panel-title">Top 10 — Prihod</div></header>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Rev} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#aaa" fontSize={12} />
                  <YAxis dataKey="perfumeName" type="category" width={130} stroke="#aaa" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#2d2d30", border: "1px solid #555", borderRadius: 6 }} formatter={(value: any) => `${Number(value).toLocaleString("sr-RS")} RSD`} />
                  <Bar dataKey="totalRevenue" name="Prihod (RSD)" fill="#ffb74d" radius={[0, 4, 4, 0]}>
                    {top10Rev.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-wrapper" style={{ marginTop: "8px" }}>
              <table className="data-table">
                <thead><tr><th>Parfem</th><th>Prihod (RSD)</th></tr></thead>
                <tbody>
                  {top10Rev.map((p) => (
                    <tr key={p.perfumeId}><td>{p.perfumeName}</td><td>{Number(p.totalRevenue).toLocaleString("sr-RS")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
            <button className="btn btn-primary" disabled={generating !== null} onClick={() => handleGenerateReport("TOP10")}>
              {generating === "TOP10" ? "Generisanje..." : "Generiši Top 10 izveštaj"}
            </button>
          </div>
        </div>
      )}

      {/* ======== IZVEŠTAJI ======== */}
      {activeSubTab === "Izveštaji" && !loading && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {Object.entries(reportTypeLabels).map(([key, label]) => (
              <button
                key={key}
                className="btn btn-primary"
                disabled={generating !== null}
                onClick={() => handleGenerateReport(key)}
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                {generating === key ? "..." : `Generiši ${label}`}
              </button>
            ))}
          </div>

          <section className="panel">
            <header className="panel-header"><div className="panel-title">Prethodni izveštaji</div></header>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tip</th>
                    <th>Datum</th>
                    <th>Akcija</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan={4} className="text-muted">Nema izveštaja.</td></tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: "monospace", fontSize: "11px" }}>{r.id.substring(0, 8)}...</td>
                        <td>
                          <span className="status-badge status-green" style={{ fontSize: "11px" }}>
                            {reportTypeLabels[r.reportType] ?? r.reportType}
                          </span>
                        </td>
                        <td>{new Date(r.createdAt).toLocaleString("sr-RS")}</td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            onClick={() => handleDownloadPDF(r)}
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: "4px", verticalAlign: "middle" }}>
                              <path d="M8 12l-4-4h2.5V3h3v5H12L8 12zm-5 2h10v1H3v-1z"/>
                            </svg>
                            Preuzmi PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
