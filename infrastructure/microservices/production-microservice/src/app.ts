import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Plant } from './Domain/models/Plant';
import { Db } from './Database/DbConnectionPool';
import { IProductionService } from './Domain/services/IProductionService';
import { ProductionService } from './Services/ProductionService';
import { ProductionController } from './WebAPI/controllers/ProductionController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST", "GET"];

app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

const plantRepository: Repository<Plant> = Db.getRepository(Plant);

const productionService: IProductionService = new ProductionService(plantRepository);

const productionController = new ProductionController(productionService);

app.use('/api/v1', productionController.getRouter());

export default app;
