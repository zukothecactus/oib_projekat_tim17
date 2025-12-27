import { AuthTokenClaimsType } from "./AuthTokenClaimsType";

export type AuthContextType = {
    user: AuthTokenClaimsType | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}