import { newsletterService } from "../services/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HTTP } from "../config/constants.js";

export const subscribe = catchAsync(async (req, res) => {
  const result = await newsletterService.subscribe(req.body, req);

  return ApiResponse.success(res, {
    statusCode: result.created ? HTTP.CREATED : HTTP.OK,
    message: result.created
      ? "Subscribed successfully"
      : result.reactivated
        ? "Subscription reactivated"
        : "Already subscribed",
    data: result.subscriber,
  });
});

export const unsubscribe = catchAsync(async (req, res) => {
  const subscriber = await newsletterService.unsubscribe(req.body.email);
  if (!subscriber) {
    return ApiResponse.success(res, {
      statusCode: HTTP.NOT_FOUND,
      success: false,
      message: "Email not found",
    });
  }
  return ApiResponse.success(res, {
    message: "Unsubscribed successfully",
    data: subscriber,
  });
});
