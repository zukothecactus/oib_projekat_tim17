import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole: string;
  redirectTo?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = "/",
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="overlay">
        <div className="window" style={{ width: "400px" }}>
          <div className="titlebar">
            <div className="titlebar-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="12" height="12" rx="2" />
              </svg>
            </div>
            <span className="titlebar-title">Loading</span>
          </div>
          <div className="window-content">
            <div className="flex flex-col items-center justify-center gap-4" style={{ padding: "20px 0" }}>
              <div className="spinner"></div>
              <p>Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requiredRole || !requiredRole.toLowerCase().includes(user?.role.toLowerCase() ?? "")) {
    return (
      <div className="overlay">
        <div className="window" style={{ width: "450px" }}>
          <div className="titlebar">
            <div className="titlebar-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z"/>
              </svg>
            </div>
            <span className="titlebar-title">Access Denied</span>
            <div className="titlebar-controls">
              <button className="titlebar-btn close" onClick={handleLogout} aria-label="Close">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </div>
          </div>
          <div className="window-content">
            <div className="flex flex-col items-center text-center gap-4">
              <div style={{ color: "var(--win11-accent)", opacity: 0.9 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                  <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 3c9.389 0 17 7.611 17 17s-7.611 17-17 17S7 33.389 7 24 14.611 7 24 7zm-1.5 7a1.5 1.5 0 00-1.5 1.5v11a1.5 1.5 0 003 0v-11a1.5 1.5 0 00-1.5-1.5zM24 32a2 2 0 100 4 2 2 0 000-4z"/>
                </svg>
              </div>
              <h2>Access Denied</h2>
              <p>
                You need the <strong>"{requiredRole}"</strong> role to access this page.
              </p>
              <button className="btn btn-accent" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};