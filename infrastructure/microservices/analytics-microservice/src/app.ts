import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { AnalyticsReport } from './Domain/models/AnalyticsReport';
import { RecordedSale } from './Domain/models/RecordedSale';
import { Db } from './Database/DbConnectionPool';
import { IAnalyticsService } from './Domain/services/IAnalyticsService';
import { AnalyticsService } from './Services/AnalyticsService';
import { AnalyticsController } from './WebAPI/controllers/AnalyticsController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST", "GET"];

app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

const reportRepository: Repository<AnalyticsReport> = Db.getRepository(AnalyticsReport);
const saleRepository: Repository<RecordedSale> = Db.getRepository(RecordedSale);
const analyticsService: IAnalyticsService = new AnalyticsService(reportRepository, saleRepository);
const analyticsController = new AnalyticsController(analyticsService);

app.use('/api/v1', analyticsController.getRouter());

export default app;
