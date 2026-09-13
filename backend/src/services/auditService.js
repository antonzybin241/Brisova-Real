import { AuditLog } from "../models/index.js";
import * as logger from "../utils/logger.js";

export const logAction = async ({ action, walletAddress, payload, req }) => {
  try {
    await AuditLog.create({
      action,
      walletAddress: walletAddress || null,
      payload: payload || {},
      ip: req?.ip || req?.headers?.["x-forwarded-for"] || null,
      userAgent: req?.get?.("user-agent") || null,
    });
  } catch (error) {
    logger.warn("Audit log write failed", { action, message: error.message });
  }
};
