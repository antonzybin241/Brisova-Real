import db from "../lib/db.js";
import {
  serializeProperty,
  serializeTransaction,
} from "../utils/serialize.js";

const pagination = ({ page = 1, limit = 20 }) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: p, limit: l, skip: (p - 1) * l };
};

export const getAnalytics = async () => {
  const [
    userCount,
    propertyCount,
    listedCount,
    investmentCount,
    totalVolume,
    pendingKyc,
    pendingProperties,
  ] = await Promise.all([
    db.user.count(),
    db.property.count(),
    db.property.count({ where: { status: "LISTED" } }),
    db.investment.count({ where: { status: "ACTIVE" } }),
    db.transaction.aggregate({ _sum: { amountUsd: true } }),
    db.kycRecord.count({ where: { status: "PENDING" } }),
    db.property.count({ where: { status: "PENDING_APPROVAL" } }),
  ]);

  return {
    userCount,
    propertyCount,
    listedCount,
    investmentCount,
    totalVolumeUsd: Number(totalVolume._sum.amountUsd ?? 0),
    pendingKyc,
    pendingProperties,
  };
};

export const listAllUsers = async (query = {}) => {
  const { page, limit, skip } = pagination(query);
  const [data, total] = await Promise.all([
    db.user.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    db.user.count(),
  ]);
  return { data, total, page, limit };
};

export const listAllProperties = async (query = {}) => {
  const { page, limit, skip } = pagination(query);
  const where = query.status ? { status: query.status } : {};
  const [data, total] = await Promise.all([
    db.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.property.count({ where }),
  ]);
  return { data: data.map(serializeProperty), total, page, limit };
};

export const listAllTransactions = async (query = {}) => {
  const { page, limit, skip } = pagination(query);
  const [data, total] = await Promise.all([
    db.transaction.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { walletAddress: true } },
        property: { select: { title: true } },
      },
    }),
    db.transaction.count(),
  ]);
  return { data: data.map(serializeTransaction), total, page, limit };
};

export const getPlatformSettings = async () => {
  const settings = await db.platformSettings.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
};

export const updatePlatformSetting = async (key, value) => {
  return db.platformSettings.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
};
