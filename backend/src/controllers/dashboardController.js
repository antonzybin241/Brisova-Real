import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as dashboardService from "../services/dashboardService.js";

const walletFrom = (req) =>
  req.validated?.walletAddress ||
  req.params?.walletAddress ||
  req.query?.walletAddress ||
  req.body?.walletAddress;

export const getDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboard(walletFrom(req));
  return ApiResponse.success(res, { data });
});

export const getProfile = catchAsync(async (req, res) => {
  const data = await dashboardService.getProfile(walletFrom(req));
  return ApiResponse.success(res, { data });
});

export const updateProfile = catchAsync(async (req, res) => {
  const data = await dashboardService.updateProfile(walletFrom(req), req.body);
  return ApiResponse.success(res, { message: "Profile updated", data });
});

export const linkEmail = catchAsync(async (req, res) => {
  const data = await dashboardService.linkEmail(walletFrom(req), req.body.email);
  return ApiResponse.success(res, { message: "Email linked", data });
});
