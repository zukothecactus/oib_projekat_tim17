import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Warehouse } from './Domain/models/Warehouse';
import { StoredPackage } from './Domain/models/StoredPackage';
import { Db } from './Database/DbConnectionPool';
import { StorageController } from './WebAPI/controllers/StorageController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5000";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

// Strict CORS — only Gateway allowed
app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

// ORM Repositories
const warehouseRepository: Repository<Warehouse> = Db.getRepository(Warehouse);
const storedPackageRepository: Repository<StoredPackage> = Db.getRepository(StoredPackage);

// WebAPI routes
const storageController = new StorageController(warehouseRepository, storedPackageRepository);

// Registering routes
app.use('/api/v1', storageController.getRouter());

export default app;
