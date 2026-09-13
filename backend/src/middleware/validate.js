import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";
import { normalizeWallet, ZERO_ADDRESS } from "../utils/wallet.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_REGEX = /^@?[a-zA-Z][a-zA-Z0-9_.]{3,30}$/;
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const LOCK_DAYS = [30, 90, 180, 365];

function isEmptyValue(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_REGEX.test(value.trim().toLowerCase());
}

function isValidTelegram(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return TELEGRAM_REGEX.test(v.startsWith("@") ? v : `@${v}`);
}

function isValidWallet(value) {
  return normalizeWallet(value) !== null;
}

function isOptionalWallet(value) {
  if (isEmptyValue(value)) return true;
  return isValidWallet(value);
}

function isNotZeroWallet(value) {
  const w = normalizeWallet(value);
  return w !== null && w !== ZERO_ADDRESS.toLowerCase();
}

function isWeiString(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0;
  }
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) return false;
  try {
    BigInt(str);
    return true;
  } catch {
    return false;
  }
}

function isValidLockDays(value) {
  return LOCK_DAYS.includes(Number(value));
}

function isValidTxHash(value) {
  if (isEmptyValue(value)) return true;
  return typeof value === "string" && TX_HASH_REGEX.test(value.trim());
}

function isValidPaginationPage(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1;
}

function isValidPaginationLimit(value, max = 100) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max;
}

function isSafeNotes(value, max = 500) {
  if (isEmptyValue(value)) return true;
  return typeof value === "string" && value.length <= max && !/[<>]/.test(value);
}

function isValidSourceTag(value) {
  if (isEmptyValue(value)) return true;
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value.trim());
}

function isValidChainId(value) {
  if (value === undefined || value === null) return true;
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

function sanitizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getValidationErrors(req) {
  return validationResult(req);
}

function hasValidationErrors(req) {
  return !getValidationErrors(req).isEmpty();
}

function getValidationErrorArray(req) {
  return getValidationErrors(req).array();
}

function getFirstErrorMessage(req) {
  const errors = getValidationErrorArray(req);
  return errors[0]?.msg || "Validation failed";
}

function formatValidationErrors(req) {
  return getValidationErrorArray(req).map((err) => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));
}

function throwIfInvalid(req, res, next) {
  if (hasValidationErrors(req)) {
    return next(
      new AppError("Validation failed", HTTP.UNPROCESSABLE, formatValidationErrors(req))
    );
  }
  return next();
}

function getBodyString(req, field) {
  return sanitizeString(req.body?.[field]);
}

function getQueryString(req, field) {
  const raw = req.query?.[field];
  return sanitizeString(raw === undefined ? "" : String(raw));
}

function getParamString(req, field) {
  return sanitizeString(req.params?.[field]);
}

function requireBodyFields(req, fields) {
  const missing = fields.filter((f) => isEmptyValue(getBodyString(req, f)));
  return { valid: missing.length === 0, missing };
}

function requireQueryFields(req, fields) {
  const missing = fields.filter((f) => isEmptyValue(getQueryString(req, f)));
  return { valid: missing.length === 0, missing };
}

function pickAllowedBodyFields(req, allowed) {
  const picked = {};
  allowed.forEach((key) => {
    if (req.body?.[key] !== undefined) picked[key] = req.body[key];
  });
  return picked;
}

function stripUnknownBodyKeys(req, allowed) {
  if (!req.body || typeof req.body !== "object") return;
  Object.keys(req.body).forEach((key) => {
    if (!allowed.includes(key)) delete req.body[key];
  });
}

function normalizeWalletOnBody(req, field = "walletAddress") {
  if (req.body?.[field]) req.body[field] = normalizeWallet(req.body[field]);
}

function normalizeEmailOnBody(req, field = "email") {
  if (req.body?.[field]) {
    req.body[field] = getBodyString(req, field).toLowerCase();
  }
}

function normalizeTelegramOnBody(req, field = "telegram") {
  const v = getBodyString(req, field);
  if (v) req.body[field] = v.startsWith("@") ? v : `@${v}`;
}

function sanitizeBodyStrings(req, fields) {
  fields.forEach((field) => {
    if (typeof req.body?.[field] === "string") {
      req.body[field] = sanitizeString(req.body[field]);
    }
  });
}

function parsePagination(req, defaultLimit = 20) {
  const page = isValidPaginationPage(getQueryString(req, "page") || "1")
    ? Number(getQueryString(req, "page") || "1")
    : 1;
  const limit = isValidPaginationLimit(getQueryString(req, "limit") || String(defaultLimit))
    ? Number(getQueryString(req, "limit") || defaultLimit)
    : defaultLimit;
  return { page, limit, skip: (page - 1) * limit };
}

function attachPagination(req) {
  req.pagination = parsePagination(req);
}

function validateNewsletterPayload(req) {
  const errors = [];
  if (!isValidEmail(getBodyString(req, "email"))) {
    errors.push({ field: "email", message: "Valid email is required" });
  }
  const wallet = getBodyString(req, "walletAddress");
  if (wallet && !isOptionalWallet(wallet)) {
    errors.push({ field: "walletAddress", message: "Invalid wallet address" });
  }
  if (!isValidSourceTag(req.body?.source)) {
    errors.push({ field: "source", message: "Invalid source" });
  }
  return errors;
}

function failWithErrors(req, res, next, errors) {
  if (!errors.length) return next();
  return next(new AppError("Validation failed", HTTP.UNPROCESSABLE, errors));
}

function createPayloadMiddleware(validateFn) {
  return (req, res, next) => failWithErrors(req, res, next, validateFn(req));
}

const validateNewsletterBody = createPayloadMiddleware(validateNewsletterPayload);

function validateWalletQuery(field = "walletAddress") {
  return (req, res, next) => {
    const value = getQueryString(req, field);
    if (!isValidWallet(value)) {
      return failWithErrors(req, res, next, [
        { field, message: "Invalid wallet address" },
      ]);
    }
    req.validated = { ...req.validated, walletAddress: normalizeWallet(value) };
    return next();
  };
}

function validateWalletParam(field = "walletAddress") {
  return (req, res, next) => {
    const value = getParamString(req, field);
    if (!isValidWallet(value)) {
      return failWithErrors(req, res, next, [
        { field, message: "Invalid wallet address" },
      ]);
    }
    req.validated = { ...req.validated, walletAddress: normalizeWallet(value) };
    return next();
  };
}

function validatePaginationQuery(req, res, next) {
  const page = getQueryString(req, "page");
  const limit = getQueryString(req, "limit");
  const errors = [];
  if (page && !isValidPaginationPage(page)) {
    errors.push({ field: "page", message: "Invalid page" });
  }
  if (limit && !isValidPaginationLimit(limit)) {
    errors.push({ field: "limit", message: "Invalid limit" });
  }
  if (errors.length) return failWithErrors(req, res, next, errors);
  attachPagination(req);
  return next();
}

function blockEmptyBody(req, res, next) {
  if (!req.body || !Object.keys(req.body).length) {
    return next(new AppError("Request body is required", HTTP.BAD_REQUEST));
  }
  return next();
}

function normalizeNewsletterBody(req, res, next) {
  normalizeEmailOnBody(req);
  if (req.body?.walletAddress) normalizeWalletOnBody(req);
  return next();
}

function runCustomChecks(req, checks) {
  return checks.filter((fn) => !fn(req)).map(() => ({
    field: "_",
    message: "Validation failed",
  }));
}

/** express-validator chain handler */
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(
      new AppError(
        getFirstErrorMessage(req),
        HTTP.UNPROCESSABLE,
        formatValidationErrors(req)
      )
    );
  }
  return next();
}

const validateExports = {
  isEmptyValue,
  isValidEmail,
  isValidTelegram,
  isValidWallet,
  isOptionalWallet,
  isNotZeroWallet,
  isWeiString,
  isValidLockDays,
  isValidTxHash,
  isValidPaginationPage,
  isValidPaginationLimit,
  isSafeNotes,
  isValidSourceTag,
  isValidChainId,
  sanitizeString,
  getValidationErrors,
  hasValidationErrors,
  getValidationErrorArray,
  getFirstErrorMessage,
  formatValidationErrors,
  throwIfInvalid,
  getBodyString,
  getQueryString,
  getParamString,
  requireBodyFields,
  requireQueryFields,
  pickAllowedBodyFields,
  stripUnknownBodyKeys,
  normalizeWalletOnBody,
  normalizeEmailOnBody,
  normalizeTelegramOnBody,
  sanitizeBodyStrings,
  parsePagination,
  attachPagination,
  validateNewsletterPayload,
  failWithErrors,
  createPayloadMiddleware,
  validateNewsletterBody,
  validateWalletQuery,
  validateWalletParam,
  validatePaginationQuery,
  blockEmptyBody,
  normalizeNewsletterBody,
  runCustomChecks,
};

Object.assign(validate, validateExports);
validate.middleware = validate;

export default validate;

export {
  isEmptyValue,
  isValidEmail,
  isValidTelegram,
  isValidWallet,
  isOptionalWallet,
  isNotZeroWallet,
  isWeiString,
  isValidLockDays,
  isValidTxHash,
  isValidPaginationPage,
  isValidPaginationLimit,
  isSafeNotes,
  isValidSourceTag,
  isValidChainId,
  sanitizeString,
  getValidationErrors,
  hasValidationErrors,
  getValidationErrorArray,
  getFirstErrorMessage,
  formatValidationErrors,
  throwIfInvalid,
  getBodyString,
  getQueryString,
  getParamString,
  requireBodyFields,
  requireQueryFields,
  pickAllowedBodyFields,
  stripUnknownBodyKeys,
  normalizeWalletOnBody,
  normalizeEmailOnBody,
  normalizeTelegramOnBody,
  sanitizeBodyStrings,
  parsePagination,
  attachPagination,
  validateNewsletterPayload,
  failWithErrors,
  createPayloadMiddleware,
  validateNewsletterBody,
  validateWalletQuery,
  validateWalletParam,
  validatePaginationQuery,
  blockEmptyBody,
  normalizeNewsletterBody,
  runCustomChecks,
};
