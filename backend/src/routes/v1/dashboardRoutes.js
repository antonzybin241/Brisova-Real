import express from "express";
import * as dashboardController from "../../controllers/dashboardController.js";

const router = express.Router();

router.get("/:walletAddress", dashboardController.getDashboard);

export default router;
