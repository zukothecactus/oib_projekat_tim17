import { ReactNode, useState, useEffect, createContext } from "react";
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

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = readValueByKey("authToken");

    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        removeValueByKey("authToken");
        setIsLoading(false);
        return;
      }

      const claims = decodeJWT(savedToken);
      if (claims) {
        setToken(savedToken);
        setUser(claims);
      } else {
        removeValueByKey("authToken");
      }
    }

    setIsLoading(false);
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