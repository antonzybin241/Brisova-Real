import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as investmentService from "../services/investmentService.js";

const walletFrom = (req) =>
  req.validated?.walletAddress ||
  req.params?.walletAddress ||
  req.query?.walletAddress ||
  req.body?.walletAddress;

export const createInvestment = catchAsync(async (req, res) => {
  const data = await investmentService.createInvestment({
    ...req.body,
    walletAddress: walletFrom(req),
  });
  return ApiResponse.success(res, { statusCode: 201, message: "Investment created", data });
});

export const getInvestments = catchAsync(async (req, res) => {
  const data = await investmentService.getUserInvestments(walletFrom(req));
  return ApiResponse.success(res, { data });
});

export const sellInvestment = catchAsync(async (req, res) => {
  const data = await investmentService.sellInvestment(
    walletFrom(req),
    req.params.investmentId,
    req.body
  );
  return ApiResponse.success(res, { message: "Investment sold", data });
});
