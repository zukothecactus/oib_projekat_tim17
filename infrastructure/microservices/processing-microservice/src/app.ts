import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Perfume } from './Domain/models/Perfume';
import { Db } from './Database/DbConnectionPool';
import { IProcessingService } from './Domain/services/IProcessingService';
import { ProcessingService } from './Services/ProcessingService';
import { ProcessingController } from './WebAPI/controllers/ProcessingController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5000";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

// Strict CORS — only Gateway allowed
app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

const perfumeRepository: Repository<Perfume> = Db.getRepository(Perfume);
const processingService: IProcessingService = new ProcessingService(perfumeRepository);
const processingController = new ProcessingController(processingService);

app.use('/api/v1', processingController.getRouter());

export default app;
