import express from "express";
import healthRoutes from "./healthRoutes.js";
import propertyRoutes from "./propertyRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import profileRoutes from "./profileRoutes.js";
import investmentRoutes from "./investmentRoutes.js";
import kycRoutes from "./kycRoutes.js";
import adminRoutes from "./adminRoutes.js";
import newsletterRoutes from "./newsletterRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/properties", propertyRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/profile", profileRoutes);
router.use("/investments", investmentRoutes);
router.use("/kyc", kycRoutes);
router.use("/admin", adminRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/favorites", favoriteRoutes);

export default router;
