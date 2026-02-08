import { Repository, Like } from "typeorm";
import { IUsersService, UpdateUserData } from "../Domain/services/IUsersService";
import { User } from "../Domain/models/User";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { sendAuditLog } from "../utils/AuditClient";

export class UsersService implements IUsersService {
  constructor(private userRepository: Repository<User>) {}

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.find();
    return users.map(u => this.toDTO(u));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error(`User with ID ${id} not found`);
    return this.toDTO(user);
  }

  /**
   * Update user (ne menja lozinku)
   */
  async updateUser(id: number, data: UpdateUserData): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error(`User with ID ${id} not found`);

    if (data.username !== undefined) user.username = data.username;
    if (data.email !== undefined) user.email = data.email;
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.role !== undefined) user.role = data.role as any;
    if (data.profileImage !== undefined) user.profileImage = data.profileImage || null;

    const saved = await this.userRepository.save(user);
    sendAuditLog("INFO", `Ažuriran korisnik ID ${id} (${saved.username})`);
    return this.toDTO(saved);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error(`User with ID ${id} not found`);
    sendAuditLog("INFO", `Obrisan korisnik ID ${id} (${user.username})`);
    await this.userRepository.remove(user);
  }

  /**
   * Search users by query (username, email, firstName, lastName)
   */
  async searchUsers(query: string): Promise<UserDTO[]> {
    const pattern = `%${query}%`;
    const users = await this.userRepository.find({
      where: [
        { username: Like(pattern) },
        { email: Like(pattern) },
        { firstName: Like(pattern) },
        { lastName: Like(pattern) },
      ],
    });
    return users.map(u => this.toDTO(u));
  }

  /**
   * Convert User entity to UserDTO
   */
  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage ?? "",
    };
  }
}
