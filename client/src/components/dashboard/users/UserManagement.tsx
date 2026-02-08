import React, { useEffect, useState, useMemo } from "react";
import { IUserAPI, UpdateUserData } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserDTO } from "../../../models/users/UserDTO";
import { UserRole } from "../../../enums/UserRole";

type UserManagementProps = {
  userAPI: IUserAPI;
};

export const UserManagement: React.FC<UserManagementProps> = ({ userAPI }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Edit modal state
  const [editUser, setEditUser] = useState<UserDTO | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserData>({});

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await userAPI.getAllUsers(token);
      setUsers(data);
    } catch {
      setError("Ne mogu da učitam listu korisnika.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Search (client-side for instant feedback, server-side for larger datasets)
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.username, u.email, u.firstName, u.lastName, u.role]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [searchQuery, users]);

  const handleSearch = async () => {
    if (!token || !searchQuery.trim()) {
      fetchUsers();
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await userAPI.searchUsers(token, searchQuery.trim());
      setUsers(data);
    } catch {
      setError("Greška pri pretrazi korisnika.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit
  const openEdit = (user: UserDTO) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage ?? "",
    });
    setError(null);
    setNotice(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editUser) return;
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      await userAPI.updateUser(token, editUser.id, editForm);
      setNotice(`Korisnik "${editUser.username}" je uspešno ažuriran.`);
      setEditUser(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Greška pri ažuriranju korisnika.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      await userAPI.deleteUser(token, deleteTarget.id);
      setNotice(`Korisnik "${deleteTarget.username}" je obrisan.`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Greška pri brisanju korisnika.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "seller": return "Seller";
      case "sales_manager": return "Sales Manager";
      default: return role;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Notifications */}
      {error && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(196, 43, 28, 0.15)",
            borderColor: "var(--win11-close-hover)",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z" />
            </svg>
            <span style={{ fontSize: "13px", color: "var(--win11-text-primary)" }}>{error}</span>
          </div>
        </div>
      )}

      {notice && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(16, 124, 16, 0.15)",
            borderColor: "#107c10",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#107c10">
              <path d="M8 2a6 6 0 110 12A6 6 0 018 2zm2.354 4.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7 8.793l2.646-2.647a.5.5 0 01.708 0z" />
            </svg>
            <span style={{ fontSize: "13px", color: "var(--win11-text-primary)" }}>{notice}</span>
          </div>
        </div>
      )}

      {/* User table panel */}
      <section className="panel">
        <header className="panel-header">
          <div className="panel-title">Upravljanje korisnicima</div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Pretraga korisnika..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </header>

        <div className="table-wrapper">
          {isLoading && !users.length ? (
            <div className="flex items-center justify-center" style={{ padding: "40px" }}>
              <div className="spinner" style={{ width: "24px", height: "24px", borderWidth: "2px" }}></div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Korisničko ime</th>
                  <th>Ime</th>
                  <th>Prezime</th>
                  <th>Email</th>
                  <th>Uloga</th>
                  <th style={{ textAlign: "right" }}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-muted">
                      Nema korisnika za prikaz.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.firstName}</td>
                      <td>{u.lastName}</td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`status-chip ${u.role === "admin" ? "status-purple" : u.role === "sales_manager" ? "status-yellow" : "status-green"}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex items-center gap-1" style={{ justifyContent: "flex-end" }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                            onClick={() => openEdit(u)}
                          >
                            Izmeni
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: "4px 10px", fontSize: "12px", color: "var(--win11-close-hover)" }}
                            onClick={() => setDeleteTarget(u)}
                          >
                            Obriši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <footer className="panel-footer">
          Ukupno korisnika: {filteredUsers.length}
        </footer>
      </section>

      {/* Edit Modal */}
      {editUser && (
        <div className="overlay" onClick={() => setEditUser(null)}>
          <div className="window" style={{ width: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="titlebar">
              <span className="titlebar-title">Izmena korisnika: {editUser.username}</span>
              <div className="titlebar-controls">
                <button className="titlebar-btn close" onClick={() => setEditUser(null)}>
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="window-content" style={{ padding: "20px" }}>
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                    Korisničko ime
                  </label>
                  <input
                    type="text"
                    value={editForm.username ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                      Ime
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                      Prezime
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                    Uloga
                  </label>
                  <select
                    value={editForm.role ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                  >
                    <option value={UserRole.SELLER}>Seller</option>
                    <option value={UserRole.SALES_MANAGER}>Sales Manager</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                    Profilna slika URL
                    <span style={{ color: "var(--win11-text-tertiary)", fontWeight: 400 }}> (opciono)</span>
                  </label>
                  <input
                    type="url"
                    value={editForm.profileImage ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, profileImage: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="flex items-center gap-2" style={{ marginTop: "8px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditUser(null)} disabled={isLoading}>
                    Otkaži
                  </button>
                  <button type="submit" className="btn btn-accent" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }}></div>
                        Čuvam...
                      </div>
                    ) : (
                      "Sačuvaj"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="overlay" onClick={() => setDeleteTarget(null)}>
          <div className="window" style={{ width: "400px" }} onClick={(e) => e.stopPropagation()}>
            <div className="titlebar">
              <span className="titlebar-title">Potvrda brisanja</span>
              <div className="titlebar-controls">
                <button className="titlebar-btn close" onClick={() => setDeleteTarget(null)}>
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="window-content" style={{ padding: "20px" }}>
              <p style={{ marginBottom: "16px", fontSize: "14px" }}>
                Da li ste sigurni da želite da obrišete korisnika <strong>{deleteTarget.username}</strong> ({deleteTarget.firstName} {deleteTarget.lastName})?
              </p>
              <p style={{ marginBottom: "20px", fontSize: "12px", color: "var(--win11-text-tertiary)" }}>
                Ova radnja se ne može poništiti.
              </p>
              <div className="flex items-center gap-2" style={{ justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={isLoading}>
                  Otkaži
                </button>
                <button
                  className="btn btn-accent"
                  onClick={handleDelete}
                  disabled={isLoading}
                  style={{ backgroundColor: "var(--win11-close-hover)" }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }}></div>
                      Brišem...
                    </div>
                  ) : (
                    "Obriši"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
