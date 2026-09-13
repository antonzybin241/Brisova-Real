import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as favoriteService from "../services/favoriteService.js";

const walletFrom = (req) =>
  req.params?.walletAddress || req.query?.walletAddress || req.body?.walletAddress;

export const listFavorites = catchAsync(async (req, res) => {
  const data = await favoriteService.listFavorites(walletFrom(req));
  return ApiResponse.success(res, { data });
});

export const addFavorite = catchAsync(async (req, res) => {
  const data = await favoriteService.addFavorite(walletFrom(req), req.body.propertyId);
  return ApiResponse.success(res, { statusCode: 201, message: "Added to favorites", data });
});

export const removeFavorite = catchAsync(async (req, res) => {
  const data = await favoriteService.removeFavorite(
    walletFrom(req),
    req.params.propertyId
  );
  return ApiResponse.success(res, { message: "Removed from favorites", data });
});

export const checkFavorite = catchAsync(async (req, res) => {
  const data = await favoriteService.isFavorite(
    walletFrom(req),
    req.params.propertyId
  );
  return ApiResponse.success(res, { data });
});
