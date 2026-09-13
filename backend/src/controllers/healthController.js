import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import config from "../config/index.js";

export const health = catchAsync(async (req, res) => {
  return ApiResponse.success(res, {
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.env,
      storage: config.storage,
      version: process.env.npm_package_version || "1.0.0",
    },
  });
});

export const ready = catchAsync(async (req, res) => {
  return res.status(200).json({ success: true, msg: "ready" });
});
