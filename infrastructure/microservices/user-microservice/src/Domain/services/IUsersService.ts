import { UserDTO } from "../DTOs/UserDTO";

export interface IUsersService {
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
}
