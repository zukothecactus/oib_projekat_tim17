import { UpdateUserData } from "../../Domain/services/IUsersService";
import { UserRole } from "../../Domain/enums/UserRole";

export function validateUpdateUserData(data: UpdateUserData): { success: boolean; message?: string } {
  if (data.username !== undefined && data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters long" };
  }
  if (data.email !== undefined && !data.email.includes("@")) {
    return { success: false, message: "Invalid email address" };
  }
  if (data.firstName !== undefined && data.firstName.trim().length < 2) {
    return { success: false, message: "First name must be at least 2 characters long" };
  }
  if (data.lastName !== undefined && data.lastName.trim().length < 2) {
    return { success: false, message: "Last name must be at least 2 characters long" };
  }
  if (data.role !== undefined && !Object.values(UserRole).includes(data.role as UserRole)) {
    return { success: false, message: "Invalid role" };
  }
  return { success: true };
}
