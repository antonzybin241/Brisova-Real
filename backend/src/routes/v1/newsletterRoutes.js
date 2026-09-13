import express from "express";
import * as newsletterController from "../../controllers/newsletterController.js";
import validate from "../../middleware/validate.js";
import { strictLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/subscribe",
  strictLimiter,
  validate.normalizeNewsletterBody,
  validate.validateNewsletterBody,
  newsletterController.subscribe
);

router.post(
  "/unsubscribe",
  validate.normalizeNewsletterBody,
  validate.validateNewsletterBody,
  newsletterController.unsubscribe
);

export default router;
