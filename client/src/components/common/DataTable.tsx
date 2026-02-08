import React, { useMemo, useState, useCallback } from "react";

/* ───────── Types ───────── */

export interface DataTableColumn<T = any> {
  /** Ključ polja iz objekta (ili slobodan string ako koristiš render) */
  key: string;
  /** Labela u header-u tabele */
  label: string;
  /** Da li je kolona sortabilna (default: true) */
  sortable?: boolean;
  /** Prilagođen prikaz celije – ako nije definisan, prikazuje row[key] */
  render?: (row: T, index: number) => React.ReactNode;
  /** CSS klasa za <td> */
  className?: string;
  /** CSS stil za <th> */
  headerStyle?: React.CSSProperties;
}

export type SortDirection = "asc" | "desc" | null;

export interface DataTableProps<T = any> {
  /** Definicija kolona */
  columns: DataTableColumn<T>[];
  /** Podaci za prikazivanje */
  data: T[];
  /** Placeholder za search input */
  searchPlaceholder?: string;
  /** Unique key za svaki red (default: "id") */
  rowKey?: string | ((row: T, index: number) => string);
  /** Poruka kad nema podataka */
  emptyMessage?: string;
  /** Footer sadržaj */
  footer?: React.ReactNode;
  /** Sakrij pretragu */
  hideSearch?: boolean;
  /** Stilovi za wrapper */
  style?: React.CSSProperties;
  /** Maksimalna visina tabele za scroll */
  maxHeight?: number;
}

/* ───────── Component ───────── */

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Pretraga...",
  rowKey = "id",
  emptyMessage = "Nema podataka za prikaz.",
  footer,
  hideSearch = false,
  style,
  maxHeight,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  /* ── Search – filtrira po SVIM vidljivim poljima ── */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, searchQuery, columns]);

  /* ── Sort ── */
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numerički sort
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      // String sort
      const cmp = String(aVal).localeCompare(String(bVal), "sr-RS", { sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  /* ── Header klik → ASC → DESC → none ── */
  const handleSort = useCallback(
    (key: string) => {
      if (sortKey !== key) {
        setSortKey(key);
        setSortDir("asc");
      } else if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortKey(null);
        setSortDir(null);
      }
    },
    [sortKey, sortDir]
  );

  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row[rowKey] != null ? String(row[rowKey]) : String(index);
  };

  const sortIndicator = (colKey: string): string => {
    if (sortKey !== colKey || !sortDir) return " ⇅";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  return (
    <div style={style}>
      {!hideSearch && (
        <div className="search-filter-bar" style={{ padding: "8px 0", marginBottom: 4 }}>
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", maxWidth: 360 }}
          />
        </div>
      )}

      <div className="table-wrapper" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    style={{
                      cursor: isSortable ? "pointer" : undefined,
                      userSelect: isSortable ? "none" : undefined,
                      whiteSpace: "nowrap",
                      ...col.headerStyle,
                    }}
                    onClick={isSortable ? () => handleSort(col.key) : undefined}
                  >
                    {col.label}
                    {isSortable && (
                      <span style={{ fontSize: 11, opacity: sortKey === col.key ? 1 : 0.35, marginLeft: 4 }}>
                        {sortIndicator(col.key)}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr key={getRowKey(row, idx)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render ? col.render(row, idx) : (row[col.key] != null ? String(row[col.key]) : "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer && <footer className="panel-footer">{footer}</footer>}
    </div>
  );
}
