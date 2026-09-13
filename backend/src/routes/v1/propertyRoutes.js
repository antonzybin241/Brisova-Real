import express from "express";
import * as propertyController from "../../controllers/propertyController.js";

const router = express.Router();

router.get("/", propertyController.listProperties);
router.get("/featured", propertyController.getFeatured);
router.get("/:id", propertyController.getProperty);
router.post("/", propertyController.createProperty);
router.patch("/:id/approve", propertyController.approveProperty);

export default router;