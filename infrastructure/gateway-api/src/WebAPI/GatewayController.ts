import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";

export class GatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Users
    this.router.get("/users", authenticate, authorize("admin"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("admin", "seller"), this.getUserById.bind(this));

    // Production
    this.router.get("/production/plants", authenticate, authorize("admin", "seller"), this.listProductionPlants.bind(this));
    this.router.post("/production/plant", authenticate, authorize("admin", "seller"), this.plantNew.bind(this));
    this.router.post("/production/change-strength", authenticate, authorize("admin", "seller"), this.changeStrength.bind(this));
    this.router.post("/production/harvest", authenticate, authorize("admin", "seller"), this.harvest.bind(this));

    // Processing
    this.router.get("/processing/perfumes/available", authenticate, authorize("admin", "seller", "sales_manager"), this.getAvailablePerfumes.bind(this));
    this.router.get("/processing/perfumes", authenticate, authorize("admin", "seller"), this.listProcessingPerfumes.bind(this));
    this.router.post("/processing/perfumes", authenticate, authorize("admin", "seller"), this.createProcessingPerfume.bind(this));
    this.router.post("/processing/start-processing", authenticate, authorize("admin", "seller", "sales_manager"), this.startProcessing.bind(this));

    // Packaging
    this.router.post("/packaging/pack", authenticate, authorize("admin", "seller", "sales_manager"), this.packPerfumes.bind(this));
    this.router.post("/packaging/send", authenticate, authorize("admin", "seller", "sales_manager"), this.sendToWarehouse.bind(this));
    this.router.get("/packaging/packages", authenticate, authorize("admin", "seller", "sales_manager"), this.listPackages.bind(this));
    this.router.get("/packaging/packages/:id", authenticate, authorize("admin", "seller", "sales_manager"), this.getPackageById.bind(this));
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    const data: LoginUserDTO = req.body;
    const result = await this.gatewayService.login(data);
    res.status(200).json(result);
  }

  private async register(req: Request, res: Response): Promise<void> {
    const data: RegistrationUserDTO = req.body;
    const result = await this.gatewayService.register(data);
    res.status(200).json(result);
  }

  // Users
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (!req.user || req.user.id !== id) {
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }

      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  // Production
  private async listProductionPlants(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.listProductionPlants();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async plantNew(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.plantNew(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async changeStrength(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.changeStrength(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async harvest(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.harvest(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Processing
  private async listProcessingPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.listProcessingPerfumes();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async createProcessingPerfume(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.createProcessingPerfume(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async startProcessing(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.startProcessing(req.body);
      res.status(200).json(result);
    } catch (err) {
      const axiosErr = err as any;
      const message = axiosErr?.response?.data?.message ?? (err as Error).message;
      const status = axiosErr?.response?.status ?? 500;
      res.status(status).json({ success: false, message });
    }
  }

  private async getAvailablePerfumes(req: Request, res: Response): Promise<void> {
    try {
      const type = req.query.type as string;
      const count = parseInt(req.query.count as string, 10);
      const result = await this.gatewayService.getAvailablePerfumes(type, count);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Packaging
  private async packPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.packPerfumes(req.body);
      res.status(200).json(result);
    } catch (err) {
      const axiosErr = err as any;
      const message = axiosErr?.response?.data?.message ?? (err as Error).message;
      const status = axiosErr?.response?.status ?? 500;
      res.status(status).json({ success: false, message });
    }
  }

  private async sendToWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.sendToWarehouse(req.body);
      res.status(200).json(result);
    } catch (err) {
      const axiosErr = err as any;
      const message = axiosErr?.response?.data?.message ?? (err as Error).message;
      const status = axiosErr?.response?.status ?? 500;
      res.status(status).json({ success: false, message });
    }
  }

  private async listPackages(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.listPackages();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getPackageById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.gatewayService.getPackageById(idParam);
      res.status(200).json(result);
    } catch (err) {
      const axiosErr = err as any;
      const message = axiosErr?.response?.data?.message ?? (err as Error).message;
      const status = axiosErr?.response?.status ?? 500;
      res.status(status).json({ success: false, message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
