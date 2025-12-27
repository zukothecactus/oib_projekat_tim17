import { useContext } from "react";
import { AuthContextType } from "../types/AuthContextType";
import AuthContext from "../contexts/AuthContext";

// Hook for AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
};