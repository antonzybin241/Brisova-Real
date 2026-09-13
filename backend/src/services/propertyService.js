import db from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";
import { normalizeWallet } from "../utils/wallet.js";
import { serializeProperty } from "../utils/serialize.js";

const resolveOwnerId = async (ownerId, walletAddress) => {
  if (ownerId) return ownerId;
  const normalized = normalizeWallet(walletAddress);
  if (!normalized) {
    throw new AppError("Wallet address or ownerId is required", HTTP.BAD_REQUEST);
  }
  let user = await db.user.findUnique({ where: { walletAddress: normalized } });
  if (!user) {
    user = await db.user.create({
      data: { walletAddress: normalized, role: "PROPERTY_OWNER" },
    });
  }
  return user.id;
};

export const listProperties = async (filters = {}) => {
  const {
    country,
    city,
    propertyType,
    minPrice,
    maxPrice,
    minRoi,
    minRentalYield,
    tokenized,
    fractionalAvailable,
    page = 1,
    limit = 12,
  } = filters;

  const where = {
    status: "LISTED",
    ...(country && { country: { contains: country } }),
    ...(city && { city: { contains: city } }),
    ...(propertyType && { propertyType }),
    ...(tokenized !== undefined && {
      isTokenized: tokenized === "true" || tokenized === true,
    }),
    ...(fractionalAvailable !== undefined && {
      fractionalAvailable: fractionalAvailable === "true" || fractionalAvailable === true,
    }),
    ...(minPrice || maxPrice
      ? {
          priceUsd: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
    ...(minRoi && { expectedRoi: { gte: Number(minRoi) } }),
    ...(minRentalYield && { rentalYield: { gte: Number(minRentalYield) } }),
  };

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [data, total] = await Promise.all([
    db.property.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    db.property.count({ where }),
  ]);

  return {
    data: data.map(serializeProperty),
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

export const getPropertyById = async (id) => {
  const property = await db.property.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, walletAddress: true } },
      investments: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { walletAddress: true } } },
      },
    },
  });

  if (!property) {
    throw new AppError("Property not found", HTTP.NOT_FOUND);
  }

  const investorCount = await db.investment.count({
    where: { propertyId: id, status: "ACTIVE" },
  });

  return {
    ...serializeProperty(property),
    investorCount,
    ownershipHistory: property.investments.map((inv) => ({
      walletAddress: inv.user.walletAddress,
      tokenAmount: inv.tokenAmount.toString(),
      investedUsd: Number(inv.investedUsd),
      createdAt: inv.createdAt,
    })),
  };
};

export const createProperty = async (ownerId, payload) => {
  const resolvedOwnerId = await resolveOwnerId(ownerId, payload.walletAddress);
  const tokenSupply = BigInt(payload.totalSupply ?? 10000);
  const property = await db.property.create({
    data: {
      ownerId: resolvedOwnerId,
      title: payload.title,
      description: payload.description,
      country: payload.country,
      city: payload.city,
      address: payload.address,
      latitude: payload.latitude ? Number(payload.latitude) : null,
      longitude: payload.longitude ? Number(payload.longitude) : null,
      propertyType: payload.propertyType,
      priceUsd: Number(payload.priceUsd),
      valuationUsd: Number(payload.valuationUsd ?? payload.priceUsd),
      expectedRoi: Number(payload.expectedRoi ?? 0),
      rentalYield: Number(payload.rentalYield ?? 0),
      monthlyRentalUsd: payload.monthlyRentalUsd
        ? Number(payload.monthlyRentalUsd)
        : null,
      isTokenized: payload.isTokenized ?? true,
      fractionalAvailable: payload.fractionalAvailable ?? true,
      images: payload.images ?? [],
      documents: payload.documents ?? [],
      totalSupply: tokenSupply,
      availableTokens: tokenSupply,
      tokenPriceUsd: payload.tokenPriceUsd
        ? Number(payload.tokenPriceUsd)
        : Number(payload.priceUsd) / Number(tokenSupply),
      chainId: Number(payload.chainId ?? 1),
      status: "PENDING_APPROVAL",
    },
  });
  return serializeProperty(property);
};

export const approveProperty = async (id) => {
  const property = await db.property.update({
    where: { id },
    data: { status: "LISTED" },
  });
  return serializeProperty(property);
};

export const getFeaturedProperties = async (limit = 8) => {
  const data = await db.property.findMany({
    where: { status: "LISTED" },
    take: limit,
    orderBy: { expectedRoi: "desc" },
  });
  return data.map(serializeProperty);
};
