import { AuthTokenClaims } from "./AuthTokenClaims";

export type AuthResponseType = {
    authenificated: boolean;
    userData?: AuthTokenClaims;
}