import db from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";
import { normalizeWallet } from "../utils/wallet.js";
import { serializeInvestment } from "../utils/serialize.js";

const getUserByWallet = async (walletAddress) => {
  const normalized = normalizeWallet(walletAddress);
  if (!normalized) {
    throw new AppError("Invalid wallet address", HTTP.BAD_REQUEST);
  }
  const user = await db.user.findUnique({ where: { walletAddress: normalized } });
  if (!user) {
    throw new AppError("User not found. Connect wallet first.", HTTP.NOT_FOUND);
  }
  return user;
};

export const createInvestment = async (payload) => {
  const user = await getUserByWallet(payload.walletAddress);
  const property = await db.property.findUnique({ where: { id: payload.propertyId } });

  if (!property || property.status !== "LISTED") {
    throw new AppError("Property not available for investment", HTTP.BAD_REQUEST);
  }

  if (user.kycStatus !== "APPROVED") {
    throw new AppError("KYC approval required before investing", HTTP.FORBIDDEN);
  }

  const tokenAmount = BigInt(payload.tokenAmount);
  if (tokenAmount > property.availableTokens) {
    throw new AppError("Insufficient tokens available", HTTP.BAD_REQUEST);
  }

  const investedUsd = Number(payload.investedUsd);

  const [investment] = await db.$transaction([
    db.investment.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        tokenAmount,
        investedUsd,
        txHash: payload.txHash,
        chainId: payload.chainId ?? property.chainId,
        status: "ACTIVE",
      },
    }),
    db.property.update({
      where: { id: property.id },
      data: { availableTokens: property.availableTokens - tokenAmount },
    }),
    db.transaction.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        type: "PURCHASE",
        amountUsd: investedUsd,
        tokenAmount,
        txHash: payload.txHash,
        chainId: payload.chainId ?? property.chainId,
      },
    }),
  ]);

  return serializeInvestment(investment);
};

export const getUserInvestments = async (walletAddress) => {
  const user = await getUserByWallet(walletAddress);
  const investments = await db.investment.findMany({
    where: { userId: user.id },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });

  return investments.map((inv) => {
    const images = Array.isArray(inv.property.images) ? inv.property.images : [];
    return {
      id: inv.id,
      propertyId: inv.propertyId,
      propertyTitle: inv.property.title,
      propertyImage: images[0] ?? null,
      tokenAmount: inv.tokenAmount.toString(),
      investedUsd: Number(inv.investedUsd),
      rentalEarnedUsd: Number(inv.rentalEarnedUsd),
      status: inv.status,
      expectedRoi: inv.property.expectedRoi,
      txHash: inv.txHash,
      createdAt: inv.createdAt,
    };
  });
};

export const sellInvestment = async (walletAddress, investmentId, payload) => {
  const user = await getUserByWallet(walletAddress);
  const investment = await db.investment.findFirst({
    where: { id: investmentId, userId: user.id, status: "ACTIVE" },
    include: { property: true },
  });

  if (!investment) {
    throw new AppError("Investment not found", HTTP.NOT_FOUND);
  }

  const sellAmount = BigInt(payload.tokenAmount ?? investment.tokenAmount);
  const saleUsd = Number(payload.saleUsd);

  await db.$transaction([
    db.investment.update({
      where: { id: investment.id },
      data: {
        status: sellAmount >= investment.tokenAmount ? "SOLD" : "ACTIVE",
        tokenAmount: investment.tokenAmount - sellAmount,
      },
    }),
    db.property.update({
      where: { id: investment.propertyId },
      data: { availableTokens: investment.property.availableTokens + sellAmount },
    }),
    db.transaction.create({
      data: {
        userId: user.id,
        propertyId: investment.propertyId,
        type: "SALE",
        amountUsd: saleUsd,
        tokenAmount: sellAmount,
        txHash: payload.txHash,
        chainId: payload.chainId ?? investment.chainId,
      },
    }),
  ]);

  return { success: true };
};
