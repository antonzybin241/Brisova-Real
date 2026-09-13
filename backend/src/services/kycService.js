import db from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";
import { normalizeWallet } from "../utils/wallet.js";
import config from "../config/index.js";

export const submitKyc = async (walletAddress, payload) => {
  const normalized = normalizeWallet(walletAddress);
  if (!normalized) {
    throw new AppError("Invalid wallet address", HTTP.BAD_REQUEST);
  }

  let user = await db.user.findUnique({ where: { walletAddress: normalized } });
  if (!user) {
    user = await db.user.create({
      data: { walletAddress: normalized, role: "INVESTOR" },
    });
  }

  // In development, auto-approve so invest/sell flows are demoable without admin hop
  const autoApprove = config.isDev && payload.autoApprove !== false;
  const status = autoApprove ? "APPROVED" : "PENDING";

  const record = await db.kycRecord.create({
    data: {
      userId: user.id,
      documentType: payload.documentType || "passport",
      documentUrl: payload.documentUrl || "demo-document",
      status,
      verifiedAt: autoApprove ? new Date() : null,
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { kycStatus: status },
  });

  return { ...record, autoApproved: autoApprove };
};

export const reviewKyc = async (kycId, payload) => {
  const record = await db.kycRecord.update({
    where: { id: kycId },
    data: {
      status: payload.status,
      verifiedAt: payload.status === "APPROVED" ? new Date() : null,
      rejectionReason: payload.rejectionReason,
    },
  });

  await db.user.update({
    where: { id: record.userId },
    data: { kycStatus: payload.status },
  });

  return record;
};

export const listPendingKyc = async () => {
  return db.kycRecord.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { walletAddress: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
};

export const getKycStatus = async (walletAddress) => {
  const normalized = normalizeWallet(walletAddress);
  const user = await db.user.findUnique({ where: { walletAddress: normalized } });
  if (!user) {
    return { status: "NOT_STARTED" };
  }
  return { status: user.kycStatus };
};
