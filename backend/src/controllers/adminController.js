import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as adminService from "../services/adminService.js";

export const getAnalytics = catchAsync(async (req, res) => {
  const data = await adminService.getAnalytics();
  return ApiResponse.success(res, { data });
});

export const listUsers = catchAsync(async (req, res) => {
  const result = await adminService.listAllUsers(req.query);
  return ApiResponse.paginated(res, result);
});

export const listProperties = catchAsync(async (req, res) => {
  const result = await adminService.listAllProperties(req.query);
  return ApiResponse.paginated(res, result);
});

export const listTransactions = catchAsync(async (req, res) => {
  const result = await adminService.listAllTransactions(req.query);
  return ApiResponse.paginated(res, result);
});

export const getSettings = catchAsync(async (req, res) => {
  const data = await adminService.getPlatformSettings();
  return ApiResponse.success(res, { data });
});

export const updateSetting = catchAsync(async (req, res) => {
  const data = await adminService.updatePlatformSetting(req.params.key, req.body.value);
  return ApiResponse.success(res, { message: "Setting updated", data });
});
