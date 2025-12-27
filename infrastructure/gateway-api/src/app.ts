import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { IGatewayService } from './Domain/services/IGatewayService';
import { GatewayService } from './Services/GatewayService';
import { GatewayController } from './WebAPI/GatewayController';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

// Services
const gatewayService: IGatewayService = new GatewayService();

// WebAPI routes
const gatewayController = new GatewayController(gatewayService);

// Registering routes
app.use('/api/v1', gatewayController.getRouter());

export default app;
