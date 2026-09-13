import db from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { HTTP } from "../config/constants.js";
import { normalizeWallet } from "../utils/wallet.js";

const findOrCreateUserByWallet = async (walletAddress) => {
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

export const getDashboard = async (walletAddress) => {
  const user = await findOrCreateUserByWallet(walletAddress);
  return buildDashboard(user);
};

const DEMO_WALLET = "0x1234567890123456789012345678901234567890";

async function buildDashboard(user, { allowDemoFallback = true } = {}) {
  const investments = await db.investment.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: { property: true },
  });

  const ownedProperties = await db.property.count({
    where: { ownerId: user.id, status: { in: ["LISTED", "SOLD"] } },
  });

  const portfolioValueUsd = investments.reduce(
    (sum, inv) => sum + Number(inv.investedUsd),
    0
  );
  const rentalIncomeUsd = investments.reduce(
    (sum, inv) => sum + Number(inv.rentalEarnedUsd),
    0
  );
  const tokenHoldings = investments.reduce(
    (sum, inv) => sum + BigInt(inv.tokenAmount),
    0n
  );

  const avgRoi =
    investments.length > 0
      ? investments.reduce((sum, inv) => sum + inv.property.expectedRoi, 0) / investments.length
      : 0;

  const recentTransactions = await db.transaction.findMany({
    where: { userId: user.id },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true, images: true, city: true, country: true } },
    },
  });

  // Empty wallets see demo sample portfolio so Recent Activity is populated in demos
  if (
    allowDemoFallback &&
    investments.length === 0 &&
    recentTransactions.length === 0 &&
    user.walletAddress !== DEMO_WALLET
  ) {
    const demoUser = await db.user.findUnique({
      where: { walletAddress: DEMO_WALLET },
    });
    if (demoUser) {
      const demo = await buildDashboard(demoUser, { allowDemoFallback: false });
      return { ...demo, isSampleData: true };
    }
  }

  return {
    portfolioValueUsd,
    ownedProperties,
    fractionalInvestments: investments.length,
    rentalIncomeUsd,
    roiPercent: avgRoi,
    tokenHoldings: tokenHoldings.toString(),
    isSampleData: false,
    recentTransactions: recentTransactions.map((tx) => {
      const images = Array.isArray(tx.property?.images) ? tx.property.images : [];
      return {
        id: tx.id,
        type: tx.type,
        amountUsd: Number(tx.amountUsd),
        tokenAmount: tx.tokenAmount ? tx.tokenAmount.toString() : null,
        propertyTitle: tx.property?.title,
        propertyImage: images[0] ?? null,
        propertyLocation: tx.property
          ? `${tx.property.city}, ${tx.property.country}`
          : null,
        txHash: tx.txHash,
        createdAt: tx.createdAt.toISOString(),
      };
    }),
    performance: investments.map((inv) => {
      const images = Array.isArray(inv.property.images) ? inv.property.images : [];
      return {
        propertyId: inv.propertyId,
        title: inv.property.title,
        image: images[0] ?? null,
        investedUsd: Number(inv.investedUsd),
        roi: inv.property.expectedRoi,
        rentalEarnedUsd: Number(inv.rentalEarnedUsd),
      };
    }),
  };
}

export const getProfile = async (walletAddress) => {
  const user = await findOrCreateUserByWallet(walletAddress);
  return {
    id: user.id,
    email: user.email,
    walletAddress: user.walletAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    kycStatus: user.kycStatus,
    isWeb3: Boolean(user.walletAddress),
    isWeb2: Boolean(user.email),
    createdAt: user.createdAt,
  };
};

export const updateProfile = async (walletAddress, payload) => {
  const user = await findOrCreateUserByWallet(walletAddress);
  return db.user.update({
    where: { id: user.id },
    data: {
      firstName: payload.firstName ?? user.firstName,
      lastName: payload.lastName ?? user.lastName,
      email: payload.email ?? user.email,
      avatarUrl: payload.avatarUrl ?? user.avatarUrl,
    },
  });
};

export const linkEmail = async (walletAddress, email) => {
  const user = await findOrCreateUserByWallet(walletAddress);
  return db.user.update({
    where: { id: user.id },
    data: { email },
  });
};
