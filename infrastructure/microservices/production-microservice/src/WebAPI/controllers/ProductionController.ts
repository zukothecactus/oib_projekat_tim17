import { Request, Response, Router } from 'express';
import { IProductionService } from '../../Domain/services/IProductionService';
import { validatePlantCreate, validateChangeStrength, validateHarvest } from '../validators/PlantValidators';
import { sendAuditLog } from '../../utils/AuditClient';

export class ProductionController {
  private router: Router;
  private readonly service: IProductionService;

  constructor(service: IProductionService) {
    this.router = Router();
    this.service = service;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/production/plant', this.plant.bind(this));
    this.router.post('/production/change-strength', this.changeStrength.bind(this));
    this.router.post('/production/harvest', this.harvest.bind(this));
    this.router.post('/production/process-plants', this.processPlants.bind(this));
    this.router.get('/production/plants', this.listPlants.bind(this));
  }

  private async plant(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validatePlantCreate(data);
      if (!v.success) { res.status(400).json(v); return; }

      const result = await this.service.plantNew(data.commonName, data.latinName, data.originCountry);
      res.status(201).json({ success: true, plant: result });
    } catch (err) {
      sendAuditLog('ERROR', `Proizvodnja: greska pri sadnji biljke — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async changeStrength(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validateChangeStrength(data);
      if (!v.success) { res.status(400).json(v); return; }

      const updated = await this.service.changeAromaticStrengthPercent(data.plantId, data.percent);
      if (!updated) {
        sendAuditLog('WARNING', `Proizvodnja: biljka sa ID ${data.plantId} nije pronadjena za promenu jacine`);
        res.status(404).json({ success: false, message: 'Plant not found' }); return;
      }
      res.status(200).json({ success: true, plant: updated });
    } catch (err) {
      sendAuditLog('ERROR', `Proizvodnja: greska pri promeni jacine aromaticnih ulja — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async harvest(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validateHarvest(data);
      if (!v.success) { res.status(400).json(v); return; }

      const harvested = await this.service.harvestByLatinName(data.latinName, data.count);
      res.status(200).json({ success: true, harvested });
    } catch (err) {
      sendAuditLog('ERROR', `Proizvodnja: greska pri berbi biljaka ${data.latinName} — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async processPlants(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validateHarvest(data);
      if (!v.success) { res.status(400).json(v); return; }

      const processed = await this.service.processByLatinName(data.latinName, data.count);
      sendAuditLog('INFO', `Proizvodnja: preradjeno ${processed.length} biljaka vrste ${data.latinName}`);
      res.status(200).json({ success: true, processed });
    } catch (err) {
      sendAuditLog('ERROR', `Proizvodnja: greska pri preradi biljaka ${data.latinName} — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async listPlants(req: Request, res: Response): Promise<void> {
    try {
      const list = await this.service.listPlants();
      res.status(200).json({ success: true, list });
    } catch (err) {
      sendAuditLog('ERROR', `Proizvodnja: greska pri dohvatanju liste biljaka — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  public getRouter(): Router { return this.router; }
}
