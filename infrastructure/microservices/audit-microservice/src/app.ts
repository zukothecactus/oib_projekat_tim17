import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import AuditController from "./WebAPI/controllers/AuditController";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: (process.env.CORS_METHODS || "GET,POST,PUT,DELETE").split(","),
  })
);

app.use(express.json());
app.use("/api/v1", AuditController);

export default app;
