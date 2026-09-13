import express from "express";
import * as adminController from "../../controllers/adminController.js";

const router = express.Router();

router.get("/analytics", adminController.getAnalytics);
router.get("/stats", adminController.getAnalytics);
router.get("/users", adminController.listUsers);
router.get("/properties", adminController.listProperties);
router.get("/transactions", adminController.listTransactions);
router.get("/settings", adminController.getSettings);
router.put("/settings/:key", adminController.updateSetting);

export default router;
