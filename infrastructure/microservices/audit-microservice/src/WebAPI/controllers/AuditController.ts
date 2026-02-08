import { Router, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuditService } from "../../Services/AuditService";
import {
  createLogValidator,
  updateLogValidator,
  idParamValidator,
  searchLogsValidator,
} from "../validators/AuditValidators";

const router = Router();
const auditService = new AuditService();

// POST /audit/logs — kreiranje novog loga
router.post("/audit/logs", createLogValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { type, description } = req.body;
    const log = await auditService.createLog(type, description);
    return res.status(201).json(log);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /audit/logs/search — pretraga logova
router.get("/audit/logs/search", searchLogsValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { type, keyword, dateFrom, dateTo } = req.query;
    const logs = await auditService.searchLogs({
      type: type as any,
      keyword: keyword as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });
    return res.status(200).json(logs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /audit/logs — svi logovi
router.get("/audit/logs", async (_req: Request, res: Response) => {
  try {
    const logs = await auditService.getAllLogs();
    return res.status(200).json(logs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /audit/logs/:id — log po ID-u
router.get("/audit/logs/:id", idParamValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const log = await auditService.getLogById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log nije pronađen." });
    return res.status(200).json(log);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// PUT /audit/logs/:id — ažuriranje loga
router.put("/audit/logs/:id", updateLogValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { type, description } = req.body;
    const log = await auditService.updateLog(req.params.id, type, description);
    if (!log) return res.status(404).json({ message: "Log nije pronađen." });
    return res.status(200).json(log);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// DELETE /audit/logs/:id — brisanje loga
router.delete("/audit/logs/:id", idParamValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const deleted = await auditService.deleteLog(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Log nije pronađen." });
    return res.status(200).json({ message: "Log uspješno obrisan." });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
