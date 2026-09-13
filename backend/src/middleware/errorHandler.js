import AppError from "../utils/AppError.js";
import * as logger from "../utils/logger.js";
import { HTTP } from "../config/constants.js";
import config from "../config/index.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP.SERVER_ERROR;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = HTTP.UNPROCESSABLE;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = HTTP.CONFLICT;
    message = "Duplicate record";
  }

  if (err.name === "CastError") {
    statusCode = HTTP.BAD_REQUEST;
    message = "Invalid identifier";
  }

  logger.error(message, {
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: config.isDev ? err.stack : undefined,
  });

  const body = {
    success: false,
    msg: message,
    message,
  };

  if (config.isDev && err.details) {
    body.details = err.details;
  }

  if (config.isDev && err.stack && !err.isOperational) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

export default errorHandler;
