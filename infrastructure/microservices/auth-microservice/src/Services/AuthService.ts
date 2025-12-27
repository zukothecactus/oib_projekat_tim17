import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(private userRepository: Repository<User>) {}

  /**
   * Login user
   */
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    const user = await this.userRepository.findOne({ where: { username: data.username } });
    if (!user) return { authenificated: false };

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) return { authenificated: false };

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

    if (existingUser) return { authenificated: false };

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const newUser = this.userRepository.create({
      username: data.username,
      email: data.email,
      role: data.role,
      password: hashedPassword,
      profileImage: data.profileImage ?? null,
    });

    const savedUser = await this.userRepository.save(newUser);

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
