import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { AuthResponseType } from "../../types/AuthResponseType";

export interface IAuthAPI {
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;
}