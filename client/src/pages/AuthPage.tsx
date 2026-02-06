import React, { useState } from "react";
import { IAuthAPI } from "../api/auth/IAuthAPI";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";

type AuthPageProps = {
  authAPI: IAuthAPI;
};

export const AuthPage: React.FC<AuthPageProps> = ({ authAPI }) => {
  const appIconUrl = `${import.meta.env.BASE_URL}icon.png`;
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="overlay-blur-none" style={{ position: "fixed" }}>
      <div className="window" style={{ width: "500px", maxWidth: "90%" }}>
        <div className="titlebar">
          <div className="titlebar-icon">
            <img style={{ marginTop: -5 }} src={appIconUrl} width="20" height="20" />
          </div>
          <span className="titlebar-title">Authentication</span>
        </div>

        <div className="window-content" style={{ padding: 0 }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid var(--win11-divider)" }}>
            <button
              className={`flex-1 ${activeTab === "login" ? "btn-accent" : "btn-ghost"}`}
              style={{
                borderRadius: 0,
                height: "48px",
                fontSize: "14px",
                fontWeight: 600,
                borderBottom: activeTab === "login" ? "2px solid var(--win11-accent)" : "none",
              }}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 ${activeTab === "register" ? "btn-accent" : "btn-ghost"}`}
              style={{
                borderRadius: 0,
                height: "48px",
                fontSize: "14px",
                fontWeight: 600,
                borderBottom: activeTab === "register" ? "2px solid var(--win11-accent)" : "none",
              }}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px" }}>
            {activeTab === "login" ? (
              <LoginForm authAPI={authAPI} />
            ) : (
              <RegisterForm authAPI={authAPI} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};