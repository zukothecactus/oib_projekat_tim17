import React, { useEffect, useState } from "react";
import { IAuditAPI } from "../../../api/audit/IAuditAPI";
import { AuditLogDTO, AuditLogType } from "../../../models/audit/AuditLogDTO";
import { useAuth } from "../../../hooks/useAuthHook";

type AuditLogViewerProps = {
  auditAPI: IAuditAPI;
};

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ auditAPI }) => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Filter state
  const [filterType, setFilterType] = useState<string>("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState<string>(AuditLogType.INFO);
  const [newDescription, setNewDescription] = useState("");

  // Edit modal state
  const [editLog, setEditLog] = useState<AuditLogDTO | null>(null);
  const [editType, setEditType] = useState<string>("");
  const [editDescription, setEditDescription] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AuditLogDTO | null>(null);

  const fetchLogs = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditAPI.getAllLogs(token);
      setLogs(data);
    } catch {
      setError("Ne mogu da učitam evidenciju.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const handleSearch = async () => {
    if (!token) return;
    const hasFilter = filterType || filterKeyword || filterDateFrom || filterDateTo;
    if (!hasFilter) {
      fetchLogs();
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditAPI.searchLogs(token, {
        type: filterType || undefined,
        keyword: filterKeyword || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      });
      setLogs(data);
    } catch {
      setError("Greška pri pretrazi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !newDescription.trim()) return;
    try {
      await auditAPI.createLog(token, { type: newType, description: newDescription.trim() });
      setShowCreate(false);
      setNewType(AuditLogType.INFO);
      setNewDescription("");
      setNotice("Log uspješno kreiran.");
      fetchLogs();
    } catch (e: any) {
      setError(e.message || "Greška pri kreiranju loga.");
    }
  };

  const openEdit = (log: AuditLogDTO) => {
    setEditLog(log);
    setEditType(log.type);
    setEditDescription(log.description);
  };

  const handleUpdate = async () => {
    if (!token || !editLog) return;
    try {
      await auditAPI.updateLog(token, editLog.id, { type: editType, description: editDescription });
      setEditLog(null);
      setNotice("Log uspješno ažuriran.");
      fetchLogs();
    } catch (e: any) {
      setError(e.message || "Greška pri ažuriranju loga.");
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    try {
      await auditAPI.deleteLog(token, deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Log uspješno obrisan.");
      fetchLogs();
    } catch (e: any) {
      setError(e.message || "Greška pri brisanju loga.");
    }
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      INFO: "#3b82f6",
      WARNING: "#f59e0b",
      ERROR: "#ef4444",
    };
    return (
      <span
        style={{
          background: colors[type] || "#6b7280",
          color: "#fff",
          padding: "2px 10px",
          borderRadius: "12px",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        {type}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("sr-Latn-BA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ padding: "20px", color: "#e0e0e0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Evidencija logova</h2>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Novi log
        </button>
      </div>

      {error && (
        <div style={{ background: "#dc262622", border: "1px solid #dc2626", padding: 10, borderRadius: 6, marginBottom: 12, color: "#fca5a5" }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ background: "#16a34a22", border: "1px solid #16a34a", padding: 10, borderRadius: 6, marginBottom: 12, color: "#86efac" }}>
          {notice}
          <button onClick={() => setNotice(null)} style={{ marginLeft: 12, background: "none", border: "none", color: "#86efac", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: "0.8rem", display: "block", marginBottom: 4 }}>Tip</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "6px 10px", borderRadius: 4 }}
          >
            <option value="">Svi</option>
            {Object.values(AuditLogType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", display: "block", marginBottom: 4 }}>Ključna riječ</label>
          <input
            type="text"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            placeholder="Pretraži opis..."
            style={{ background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "6px 10px", borderRadius: 4, width: 180 }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", display: "block", marginBottom: 4 }}>Od datuma</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            style={{ background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "6px 10px", borderRadius: 4 }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", display: "block", marginBottom: 4 }}>Do datuma</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            style={{ background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "6px 10px", borderRadius: 4 }}
          />
        </div>
        <button
          onClick={handleSearch}
          style={{ background: "#6366f1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
        >
          Filtriraj
        </button>
        <button
          onClick={() => { setFilterType(""); setFilterKeyword(""); setFilterDateFrom(""); setFilterDateTo(""); fetchLogs(); }}
          style={{ background: "#374151", color: "#e0e0e0", border: "1px solid #555", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Učitavanje...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #444" }}>
              <th style={{ padding: "10px 8px", textAlign: "left", color: "#9ca3af" }}>Tip</th>
              <th style={{ padding: "10px 8px", textAlign: "left", color: "#9ca3af" }}>Opis</th>
              <th style={{ padding: "10px 8px", textAlign: "left", color: "#9ca3af" }}>Datum</th>
              <th style={{ padding: "10px 8px", textAlign: "center", color: "#9ca3af" }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 20, color: "#666" }}>Nema logova za prikaz.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #333" }}>
                  <td style={{ padding: "10px 8px" }}>{typeBadge(log.type)}</td>
                  <td style={{ padding: "10px 8px", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.description}
                  </td>
                  <td style={{ padding: "10px 8px", color: "#9ca3af", fontSize: "0.9rem" }}>{formatDate(log.createdAt)}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <button
                      onClick={() => openEdit(log)}
                      style={{ background: "#2563eb", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", marginRight: 6, fontSize: "0.85rem" }}
                    >
                      Uredi
                    </button>
                    <button
                      onClick={() => setDeleteTarget(log)}
                      style={{ background: "#dc2626", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e1e1e", padding: 24, borderRadius: 10, width: 420, border: "1px solid #444" }}>
            <h3 style={{ marginTop: 0 }}>Novi audit log</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem" }}>Tip</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{ width: "100%", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "8px", borderRadius: 4 }}
              >
                {Object.values(AuditLogType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem" }}>Opis</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                style={{ width: "100%", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "8px", borderRadius: 4, resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreate(false)} style={{ background: "#374151", color: "#e0e0e0", border: "1px solid #555", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>
                Otkaži
              </button>
              <button onClick={handleCreate} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                Kreiraj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editLog && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e1e1e", padding: 24, borderRadius: 10, width: 420, border: "1px solid #444" }}>
            <h3 style={{ marginTop: 0 }}>Uredi log</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem" }}>Tip</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                style={{ width: "100%", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "8px", borderRadius: 4 }}
              >
                {Object.values(AuditLogType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem" }}>Opis</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                style={{ width: "100%", background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #444", padding: "8px", borderRadius: 4, resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditLog(null)} style={{ background: "#374151", color: "#e0e0e0", border: "1px solid #555", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>
                Otkaži
              </button>
              <button onClick={handleUpdate} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e1e1e", padding: 24, borderRadius: 10, width: 380, border: "1px solid #444" }}>
            <h3 style={{ marginTop: 0, color: "#fca5a5" }}>Potvrda brisanja</h3>
            <p>Da li ste sigurni da želite obrisati ovaj log?</p>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af", fontStyle: "italic" }}>
              {deleteTarget.description.substring(0, 80)}{deleteTarget.description.length > 80 ? "..." : ""}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ background: "#374151", color: "#e0e0e0", border: "1px solid #555", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>
                Otkaži
              </button>
              <button onClick={handleDelete} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
