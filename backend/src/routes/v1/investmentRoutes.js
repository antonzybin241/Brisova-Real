import express from "express";
import * as investmentController from "../../controllers/investmentController.js";

const router = express.Router();

router.get("/:walletAddress", investmentController.getInvestments);
router.post("/:walletAddress", investmentController.createInvestment);
router.post("/:walletAddress/:investmentId/sell", investmentController.sellInvestment);

export default router;
