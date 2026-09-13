import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as kycService from "../services/kycService.js";

const walletFrom = (req) =>
  req.validated?.walletAddress ||
  req.params?.walletAddress ||
  req.query?.walletAddress ||
  req.body?.walletAddress;

export const submitKyc = catchAsync(async (req, res) => {
  const data = await kycService.submitKyc(walletFrom(req), req.body);
  return ApiResponse.success(res, { statusCode: 201, message: "KYC submitted", data });
});

export const getKycStatus = catchAsync(async (req, res) => {
  const data = await kycService.getKycStatus(walletFrom(req));
  return ApiResponse.success(res, { data });
});

export const listPendingKyc = catchAsync(async (req, res) => {
  const data = await kycService.listPendingKyc();
  return ApiResponse.success(res, { data });
});

export const reviewKyc = catchAsync(async (req, res) => {
  const data = await kycService.reviewKyc(req.params.id, req.body);
  return ApiResponse.success(res, { message: "KYC reviewed", data });
});
