import { jwtDecode } from "jwt-decode";
import { AuthTokenClaimsType } from "../types/AuthTokenClaimsType";

export const decodeJWT = (token: string): AuthTokenClaimsType | null => {
  try {
    const decoded = jwtDecode<AuthTokenClaimsType>(token);

    if (decoded.id && decoded.username && decoded.role) {
      return {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };
    }

    return null;
  } catch {
    return null;
  }
};