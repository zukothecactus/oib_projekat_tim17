import { body, param, query } from "express-validator";
import { AuditLogType } from "../../Domain/enums/AuditLogType";

export const createLogValidator = [
  body("type")
    .notEmpty()
    .withMessage("Tip loga je obavezan.")
    .isIn(Object.values(AuditLogType))
    .withMessage(`Tip mora biti jedan od: ${Object.values(AuditLogType).join(", ")}`),
  body("description")
    .notEmpty()
    .withMessage("Opis loga je obavezan.")
    .isString()
    .withMessage("Opis mora biti tekst."),
];

export const updateLogValidator = [
  param("id").isUUID().withMessage("ID mora biti validan UUID."),
  body("type")
    .optional()
    .isIn(Object.values(AuditLogType))
    .withMessage(`Tip mora biti jedan od: ${Object.values(AuditLogType).join(", ")}`),
  body("description")
    .optional()
    .isString()
    .withMessage("Opis mora biti tekst."),
];

export const idParamValidator = [
  param("id").isUUID().withMessage("ID mora biti validan UUID."),
];

export const searchLogsValidator = [
  query("type")
    .optional()
    .isIn(Object.values(AuditLogType))
    .withMessage(`Tip mora biti jedan od: ${Object.values(AuditLogType).join(", ")}`),
  query("keyword").optional().isString(),
  query("dateFrom").optional().isISO8601().withMessage("dateFrom mora biti validan datum."),
  query("dateTo").optional().isISO8601().withMessage("dateTo mora biti validan datum."),
];
