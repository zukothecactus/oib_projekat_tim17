import { Request, Response, Router } from 'express';
import { IProcessingService } from '../../Domain/services/IProcessingService';
import { validatePerfumeCreate, validateStartProcessing } from '../validators/ProcessingValidators';
import { PerfumeType } from '../../Domain/enums/PerfumeType';

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
    this.router.get('/processing/perfumes/available', this.getAvailablePerfumes.bind(this));
    this.router.get('/processing/perfumes', this.listPerfumes.bind(this));
    this.router.post('/processing/start-processing', this.startProcessing.bind(this));
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
        plantId: data.plantId,
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

  private async startProcessing(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validateStartProcessing(data);
      if (!v.success) { res.status(400).json(v); return; }

      const perfumes = await this.service.startProcessing({
        perfumeName: data.perfumeName,
        perfumeType: data.perfumeType,
        bottleCount: data.bottleCount,
        bottleVolume: data.bottleVolume,
        latinName: data.latinName,
      });
      res.status(201).json({ success: true, perfumes });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Server error';
      const isBusinessError = message.includes('Nedovoljno biljaka');
      res.status(isBusinessError ? 400 : 500).json({ success: false, message });
    }
  }

  private async getAvailablePerfumes(req: Request, res: Response): Promise<void> {
    try {
      const type = req.query.type as string;
      const count = parseInt(req.query.count as string, 10);
      if (!type || !Object.values(PerfumeType).includes(type as PerfumeType)) {
        res.status(400).json({ success: false, message: 'Invalid type' });
        return;
      }
      if (isNaN(count) || count < 1) {
        res.status(400).json({ success: false, message: 'Invalid count' });
        return;
      }
      const list = await this.service.getPerfumesByTypeAndCount(type as PerfumeType, count);
      res.status(200).json({ success: true, list });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  public getRouter(): Router { return this.router; }
}
