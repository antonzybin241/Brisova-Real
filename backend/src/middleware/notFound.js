import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, HTTP.NOT_FOUND));
};

export default notFound;
