import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp ? decoded.exp < currentTime : false;
  } catch {
    return true;
  }
};