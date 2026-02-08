import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { sendAuditLog } from "../utils/AuditClient";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(private userRepository: Repository<User>) {}

  /**
   * Login user
   */
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    const user = await this.userRepository.findOne({ where: { username: data.username } });
    if (!user) {
      sendAuditLog("WARNING", `Neuspješna prijava — korisnik '${data.username}' ne postoji`);
      return { authenificated: false };
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      sendAuditLog("WARNING", `Neuspješna prijava za ${data.username} — pogrešna lozinka`);
      return { authenificated: false };
    }

    sendAuditLog("INFO", `Korisnik ${data.username} se uspješno prijavio`);
    return {
      authenificated: true,
      userData: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Register new user
   */
  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser) {
      sendAuditLog("WARNING", `Neuspješna registracija — korisnik ${data.username} ili email ${data.email} već postoji`);
      return { authenificated: false };
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const newUser = this.userRepository.create({
      username: data.username,
      email: data.email,
      role: data.role,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      profileImage: data.profileImage ?? null,
    });

    const savedUser = await this.userRepository.save(newUser);

    sendAuditLog("INFO", `Registrovan novi korisnik: ${savedUser.username} (${savedUser.role})`);
    return {
      authenificated: true,
      userData: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
      },
    };
  }
}
