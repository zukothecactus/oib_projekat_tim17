import { UserRole } from "../../enums/UserRole";

export interface RegistrationUserDTO {
    username: string;
    role: UserRole;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
}