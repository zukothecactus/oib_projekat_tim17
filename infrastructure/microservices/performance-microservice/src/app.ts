import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { PerformanceReport } from './Domain/models/PerformanceReport';
import { Db } from './Database/DbConnectionPool';
import { IPerformanceService } from './Domain/services/IPerformanceService';
import { PerformanceService } from './Services/PerformanceService';
import { PerformanceController } from './WebAPI/controllers/PerformanceController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST", "GET"];

app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

const reportRepository: Repository<PerformanceReport> = Db.getRepository(PerformanceReport);
const performanceService: IPerformanceService = new PerformanceService(reportRepository);
const performanceController = new PerformanceController(performanceService);

app.use('/api/v1', performanceController.getRouter());

export default app;
