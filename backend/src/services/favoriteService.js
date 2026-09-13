import db from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";
import { normalizeWallet } from "../utils/wallet.js";
import { serializeProperty } from "../utils/serialize.js";

const getUserByWallet = async (walletAddress) => {
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
  return user;
};

export const listFavorites = async (walletAddress) => {
  const user = await getUserByWallet(walletAddress);
  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });
  return favorites.map((f) => ({
    id: f.id,
    propertyId: f.propertyId,
    createdAt: f.createdAt,
    property: serializeProperty(f.property),
  }));
};

export const addFavorite = async (walletAddress, propertyId) => {
  const user = await getUserByWallet(walletAddress);
  const property = await db.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    throw new AppError("Property not found", HTTP.NOT_FOUND);
  }
  const favorite = await db.favorite.upsert({
    where: { userId_propertyId: { userId: user.id, propertyId } },
    create: { userId: user.id, propertyId },
    update: {},
    include: { property: true },
  });
  return {
    id: favorite.id,
    propertyId: favorite.propertyId,
    property: serializeProperty(favorite.property),
  };
};

export const removeFavorite = async (walletAddress, propertyId) => {
  const user = await getUserByWallet(walletAddress);
  await db.favorite.deleteMany({
    where: { userId: user.id, propertyId },
  });
  return { success: true };
};

export const isFavorite = async (walletAddress, propertyId) => {
  const user = await getUserByWallet(walletAddress);
  const favorite = await db.favorite.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId } },
  });
  return { isFavorite: Boolean(favorite) };
};
