import { Request, Response, Router } from 'express';
import { IProcessingService } from '../../Domain/services/IProcessingService';
import { validatePerfumeCreate } from '../validators/ProcessingValidators';

export class ProcessingController {
  private router: Router;
  private readonly service: IProcessingService;

  constructor(service: IProcessingService) {
    this.router = Router();
    this.service = service;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/processing/perfumes', this.createPerfume.bind(this));
    this.router.get('/processing/perfumes', this.listPerfumes.bind(this));
  }

  private async createPerfume(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validatePerfumeCreate(data);
      if (!v.success) { res.status(400).json(v); return; }

      const perfume = await this.service.createPerfume({
        name: data.name,
        type: data.type,
        volume: data.volume,
        serialNumber: data.serialNumber ?? "",
        expiresAt: data.expiresAt,
        status: data.status ?? "U izradi",
      });
      res.status(201).json({ success: true, perfume });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async listPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const list = await this.service.listPerfumes();
      res.status(200).json({ success: true, list });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  public getRouter(): Router { return this.router; }
}
