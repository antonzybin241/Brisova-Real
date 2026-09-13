import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as propertyService from "../services/propertyService.js";

export const listProperties = catchAsync(async (req, res) => {
  const result = await propertyService.listProperties(req.query);
  return ApiResponse.paginated(res, result);
});

export const getProperty = catchAsync(async (req, res) => {
  const data = await propertyService.getPropertyById(req.params.id);
  return ApiResponse.success(res, { data });
});

export const getFeatured = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const data = await propertyService.getFeaturedProperties(limit);
  return ApiResponse.success(res, { data });
});

export const createProperty = catchAsync(async (req, res) => {
  const data = await propertyService.createProperty(req.body.ownerId, {
    ...req.body,
    walletAddress: req.body.walletAddress || req.body.ownerWallet,
  });
  return ApiResponse.success(res, { statusCode: 201, message: "Property submitted", data });
});

export const approveProperty = catchAsync(async (req, res) => {
  const data = await propertyService.approveProperty(req.params.id);
  return ApiResponse.success(res, { message: "Property approved", data });
});
