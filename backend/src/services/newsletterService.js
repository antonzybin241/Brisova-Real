import { NewsletterSubscriber } from "../models/index.js";
import { logAction } from "./auditService.js";
import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";
import { normalizeWallet } from "../utils/wallet.js";

export const subscribe = async ({ email, walletAddress, source }, req) => {
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) {
    throw new AppError("Valid email is required", HTTP.BAD_REQUEST);
  }

  const normalizedWallet = walletAddress ? normalizeWallet(walletAddress) : null;

  if (walletAddress && !normalizedWallet) {
    throw new AppError("Invalid wallet address", HTTP.BAD_REQUEST);
  }

  const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
  if (existing) {
    if (!existing.subscribed) {
      existing.subscribed = true;
      await existing.save();
      return { created: false, subscriber: existing, reactivated: true };
    }
    return { created: false, subscriber: existing, reactivated: false };
  }

  const subscriber = await NewsletterSubscriber.create({
    email: normalizedEmail,
    walletAddress: normalizedWallet,
    source: source || "website",
    subscribed: true,
  });

  await logAction({
    action: "newsletter.subscribe",
    walletAddress: normalizedWallet,
    payload: { email: normalizedEmail },
    req,
  });

  return { created: true, subscriber };
};

export const unsubscribe = async (email) => {
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const subscriber = await NewsletterSubscriber.findOne({
    email: normalizedEmail,
  });
  if (!subscriber) {
    return null;
  }
  subscriber.subscribed = false;
  await subscriber.save();
  return subscriber;
};
