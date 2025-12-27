import { Request, Response, Router } from 'express';
import jwt from "jsonwebtoken";
import { IAuthService } from '../../Domain/services/IAuthService';
import { LoginUserDTO } from '../../Domain/DTOs/LoginUserDTO';
import { RegistrationUserDTO } from '../../Domain/DTOs/RegistrationUserDTO';
import { validateLoginData } from '../validators/LoginValidator';
import { validateRegistrationData } from '../validators/RegisterValidator';
import { ILogerService } from '../../Domain/services/ILogerService';

export class AuthController {
  private router: Router;
  private authService: IAuthService;
  private readonly logerService: ILogerService;

  constructor(authService: IAuthService, logerService: ILogerService) {
    this.router = Router();
    this.authService = authService;
    this.logerService = logerService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth/login', this.login.bind(this));
    this.router.post('/auth/register', this.register.bind(this));
  }

  /**
   * POST /api/v1/auth/login
   * Authenticates a userData?
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      this.logerService.log("Login request received");

      const data: LoginUserDTO = req.body as LoginUserDTO;

      // Validate login input
      const validation = validateLoginData(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.login(data);

      if (result.authenificated) {
        const token = jwt.sign(
          { id: result.userData?.id, username: result.userData?.username, role: result.userData?.role },
          process.env.JWT_SECRET ?? "",
          { expiresIn: '6h' }
        );

        res.status(200).json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials!" });
      }
    } catch (error) {
      this.logerService.log(error as string)
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registers a new userData?
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      this.logerService.log("Registration request received");

      const data: RegistrationUserDTO = req.body as RegistrationUserDTO;

      // Validate registration input
      const validation = validateRegistrationData(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.register(data);

      if (result.authenificated) {
        const token = jwt.sign(
          { id: result.userData?.id, username: result.userData?.username, role: result.userData?.role },
          process.env.JWT_SECRET ?? "",
          { expiresIn: '6h' }
        );

        res.status(201).json({ success: true, message: "Registration successful", token });
      } else {
        res.status(400).json({ success: false, message: "Registration failed. Username or email may already exist." });
      }
    } catch (error) {
      this.logerService.log(error as string)
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}