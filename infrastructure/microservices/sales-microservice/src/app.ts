import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Invoice } from './Domain/models/Invoice';
import { Db } from './Database/DbConnectionPool';
import { ISalesService } from './Domain/services/ISalesService';
import { SalesService } from './Services/SalesService';
import { SalesController } from './WebAPI/controllers/SalesController';

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5000";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

// Strict CORS — only Gateway allowed
app.use(cors({ origin: corsOrigin, methods: corsMethods }));
app.use(express.json());

initialize_database();

const invoiceRepository: Repository<Invoice> = Db.getRepository(Invoice);
const salesService: ISalesService = new SalesService(invoiceRepository);
const salesController = new SalesController(salesService);

app.use('/api/v1', salesController.getRouter());

export default app;
