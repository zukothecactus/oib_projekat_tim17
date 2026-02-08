import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Package } from './Domain/models/Package';
import { Db } from './Database/DbConnectionPool';
import { IPackagingService } from './Domain/services/IPackagingService';
import { PackagingService } from './Services/PackagingService';
import { PackagingController } from './WebAPI/controllers/PackagingController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST", "GET"];

app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

const packageRepository: Repository<Package> = Db.getRepository(Package);
const packagingService: IPackagingService = new PackagingService(packageRepository);
const packagingController = new PackagingController(packagingService);

app.use('/api/v1', packagingController.getRouter());

export default app;
