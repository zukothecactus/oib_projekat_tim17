import { AuthTokenClaimsType } from "./AuthTokenClaims";

export type AuthResponseType = {
    authenificated: boolean;
    userData?: AuthTokenClaimsType;
}