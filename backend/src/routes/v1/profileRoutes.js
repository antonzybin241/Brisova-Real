import express from "express";
import * as dashboardController from "../../controllers/dashboardController.js";

const router = express.Router();

router.get("/:walletAddress", dashboardController.getProfile);
router.patch("/:walletAddress", dashboardController.updateProfile);
router.post("/:walletAddress/email", dashboardController.linkEmail);

export default router;
