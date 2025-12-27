import { UserRole } from "../../enums/UserRole";

export interface RegistrationUserDTO {
    username: string;
    role: UserRole;
    password: string;
    email: string;
    profileImage: string;
}