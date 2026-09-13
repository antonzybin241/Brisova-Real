import express from "express";
import * as kycController from "../../controllers/kycController.js";

const router = express.Router();

router.get("/pending", kycController.listPendingKyc);
router.get("/:walletAddress/status", kycController.getKycStatus);
router.get("/:walletAddress", kycController.getKycStatus);
router.post("/:walletAddress/submit", kycController.submitKyc);
router.patch("/:id/review", kycController.reviewKyc);

export default router;
