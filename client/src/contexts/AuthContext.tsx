import { ReactNode, useState, useEffect, createContext } from "react";
import axios from "axios";
import { decodeJWT } from "../helpers/decode_jwt";
import { isTokenExpired } from "../helpers/expiration_jwt_validate";
import { readValueByKey, removeValueByKey, saveValueByKey } from "../helpers/local_storage";
import { AuthContextType } from "../types/AuthContextType";
import { AuthTokenClaimsType } from "../types/AuthTokenClaimsType";

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthTokenClaimsType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount and validate against backend
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = readValueByKey("authToken");

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(savedToken)) {
        removeValueByKey("authToken");
        setIsLoading(false);
        return;
      }

      const claims = decodeJWT(savedToken);
      if (!claims) {
        removeValueByKey("authToken");
        setIsLoading(false);
        return;
      }

      // Validate that the user still exists on the backend
      try {
        await axios.get(
          `${import.meta.env.VITE_GATEWAY_URL}/users/${claims.id}`,
          { headers: { Authorization: `Bearer ${savedToken}` }, timeout: 5000 }
        );
        // User exists — restore session
        setToken(savedToken);
        setUser(claims);
      } catch {
        // User no longer exists or token is invalid on backend — clear stale session
        console.warn("Session expired or user no longer exists. Logging out.");
        removeValueByKey("authToken");
      }

      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = (newToken: string) => {
    const claims = decodeJWT(newToken);

    if (claims && !isTokenExpired(newToken)) {
      setToken(newToken);
      setUser(claims);
      saveValueByKey("authToken", newToken);
    } else {
      console.error("Invalid or expired token");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    removeValueByKey("authToken");
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;