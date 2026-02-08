import { UserDTO } from "../../models/users/UserDTO";

export type UpdateUserData = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  profileImage?: string;
};

export interface IUserAPI {
  getAllUsers(token: string): Promise<UserDTO[]>;
  getUserById(token: string, id: number): Promise<UserDTO>;
  updateUser(token: string, id: number, data: UpdateUserData): Promise<UserDTO>;
  deleteUser(token: string, id: number): Promise<void>;
  searchUsers(token: string, query: string): Promise<UserDTO[]>;
}