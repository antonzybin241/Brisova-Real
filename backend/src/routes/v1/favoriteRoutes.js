import express from "express";
import * as favoriteController from "../../controllers/favoriteController.js";

const router = express.Router();

router.get("/:walletAddress", favoriteController.listFavorites);
router.post("/:walletAddress", favoriteController.addFavorite);
router.get("/:walletAddress/:propertyId", favoriteController.checkFavorite);
router.delete("/:walletAddress/:propertyId", favoriteController.removeFavorite);

export default router;
