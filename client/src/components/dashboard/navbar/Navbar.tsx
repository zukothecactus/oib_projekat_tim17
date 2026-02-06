import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserDTO } from "../../../models/users/UserDTO";

type DashboardNavbarProps = {
  userAPI: IUserAPI;
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ userAPI }) => {
  const { user: authUser, logout, token } = useAuth();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser?.id) {
        try {
          const userData = await userAPI.getUserById(token ?? "", authUser.id, );
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUser();
  }, [authUser, userAPI]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="titlebar" style={{ height: "60px", borderRadius: 0 }}>
      <div className="flex items-center gap-3" style={{ marginLeft: "auto" }}>
        {isLoading ? (
          <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></div>
        ) : user ? (
          <>
            {/* Profile Image */}
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--win11-divider)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--win11-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#000",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User Info */}
            <div className="flex flex-col" style={{ gap: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--win11-text-primary)" }}>
                {user.email}
              </span>
              <span style={{ fontSize: "11px", color: "var(--win11-text-tertiary)" }}>
                {user.role}
              </span>
            </div>

            {/* Logout Button */}
            <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: "8px 16px" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2v2H3v8h3v2H2V2h4zm4 3l4 3-4 3V9H6V7h4V5z"/>
              </svg>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};