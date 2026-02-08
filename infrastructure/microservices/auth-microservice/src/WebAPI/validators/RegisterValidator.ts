import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { UserRole } from "../../Domain/enums/UserRole";

export function validateRegistrationData(data: RegistrationUserDTO): { success: boolean; message?: string } {
  if (!data.username || data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters long" };
  }
  if (!data.firstName || data.firstName.trim().length < 2) {
    return { success: false, message: "First name must be at least 2 characters long" };
  }
  if (!data.lastName || data.lastName.trim().length < 2) {
    return { success: false, message: "Last name must be at least 2 characters long" };
  }
  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long" };
  }
  if (!data.email || !data.email.includes("@")) {
    return { success: false, message: "Invalid email address" };
  }
  if (!Object.values(UserRole).includes(data.role)) {
    return { success: false, message: "Invalid role" };
  }
  return { success: true };
}