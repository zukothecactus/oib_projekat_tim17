import { UserDTO } from "../DTOs/UserDTO";

export type UpdateUserData = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  profileImage?: string;
};

export interface IUsersService {
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
  updateUser(id: number, data: UpdateUserData): Promise<UserDTO>;
  deleteUser(id: number): Promise<void>;
  searchUsers(query: string): Promise<UserDTO[]>;
}
