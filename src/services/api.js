import db from "./localDb";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const DEMO_WALLET = "0x1234567890123456789012345678901234567890";

const normalizeWallet = (address) => {
  if (!address || typeof address !== "string") return null;
  const trimmed = address.trim();
  if (!ETH_ADDRESS_REGEX.test(trimmed)) return null;
  return trimmed.toLowerCase();
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const serializeProperty = (p) => {
  if (!p) return p;
  return {
    ...p,
    images: asArray(p.images),
    documents: asArray(p.documents),
    priceUsd: Number(p.priceUsd),
    valuationUsd: Number(p.valuationUsd),
    monthlyRentalUsd: p.monthlyRentalUsd != null ? Number(p.monthlyRentalUsd) : null,
    tokenPriceUsd: p.tokenPriceUsd != null ? Number(p.tokenPriceUsd) : null,
    totalSupply: p.totalSupply != null ? p.totalSupply.toString() : "0",
    availableTokens: p.availableTokens != null ? p.availableTokens.toString() : "0",
  };
};

const serializeInvestment = (inv) => {
  if (!inv) return inv;
  return {
    ...inv,
    tokenAmount: inv.tokenAmount != null ? inv.tokenAmount.toString() : "0",
    investedUsd: Number(inv.investedUsd),
    rentalEarnedUsd: Number(inv.rentalEarnedUsd ?? 0),
    property: inv.property ? serializeProperty(inv.property) : inv.property,
  };
};

const serializeTransaction = (tx) => {
  if (!tx) return tx;
  return {
    ...tx,
    amountUsd: Number(tx.amountUsd),
    tokenAmount: tx.tokenAmount != null ? tx.tokenAmount.toString() : null,
  };
};

const apiError = (message) => {
  const err = new Error(message);
  err.response = { data: { message } };
  throw err;
};

const findOrCreateUserByWallet = async (walletAddress, role = "INVESTOR") => {
  const normalized = normalizeWallet(walletAddress);
  if (!normalized) apiError("Invalid wallet address");

  let user = await db.user.findUnique({ where: { walletAddress: normalized } });
  if (!user) {
    user = await db.user.create({
      data: { walletAddress: normalized, role },
    });
  }
  return user;
};

const getUserByWallet = async (walletAddress) => {
  const normalized = normalizeWallet(walletAddress);
  if (!normalized) apiError("Invalid wallet address");
  const user = await db.user.findUnique({ where: { walletAddress: normalized } });
  if (!user) apiError("User not found. Connect wallet first.");
  return user;
};

const pagination = ({ page = 1, limit = 20 } = {}) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  return { page: p, limit: l, skip: (p - 1) * l };
};

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
      ? investments.reduce((sum, inv) => sum + inv.property.expectedRoi, 0) /
        investments.length
      : 0;

  const recentTransactions = await db.transaction.findMany({
    where: { userId: user.id },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true, images: true, city: true, country: true } },
    },
  });

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
      const images = asArray(tx.property?.images);
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
        createdAt:
          tx.createdAt instanceof Date
            ? tx.createdAt.toISOString()
            : tx.createdAt,
      };
    }),
    performance: investments.map((inv) => {
      const images = asArray(inv.property.images);
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

export const api = {
  getFeaturedProperties: async (limit = 8) => {
    const data = await db.property.findMany({
      where: { status: "LISTED" },
      take: limit,
      orderBy: { expectedRoi: "desc" },
    });
    return data.map(serializeProperty);
  },

  getProperties: async (filters = {}) => {
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
        fractionalAvailable:
          fractionalAvailable === "true" || fractionalAvailable === true,
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
  },

  getProperty: async (id) => {
    const property = await db.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, walletAddress: true },
        },
        investments: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { walletAddress: true } } },
        },
      },
    });

    if (!property) apiError("Property not found");

    const investorCount = await db.investment.count({
      where: { propertyId: id, status: "ACTIVE" },
    });

    return {
      ...serializeProperty(property),
      investorCount,
      ownershipHistory: (property.investments || []).map((inv) => ({
        walletAddress: inv.user?.walletAddress,
        tokenAmount: inv.tokenAmount.toString(),
        investedUsd: Number(inv.investedUsd),
        createdAt: inv.createdAt,
      })),
    };
  },

  createProperty: async (payload) => {
    let ownerId = payload.ownerId;
    if (!ownerId) {
      const owner = await findOrCreateUserByWallet(
        payload.walletAddress,
        "PROPERTY_OWNER"
      );
      ownerId = owner.id;
    }

    const tokenSupply = BigInt(payload.totalSupply ?? 10000);
    const property = await db.property.create({
      data: {
        ownerId,
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
  },

  approveProperty: async (id) => {
    const property = await db.property.update({
      where: { id },
      data: { status: "LISTED" },
    });
    return serializeProperty(property);
  },

  getDashboard: async (wallet) => {
    const user = await findOrCreateUserByWallet(wallet);
    return buildDashboard(user);
  },

  getProfile: async (wallet) => {
    const user = await findOrCreateUserByWallet(wallet);
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
  },

  updateProfile: async (wallet, payload) => {
    const user = await findOrCreateUserByWallet(wallet);
    return db.user.update({
      where: { id: user.id },
      data: {
        firstName: payload.firstName ?? user.firstName,
        lastName: payload.lastName ?? user.lastName,
        email: payload.email ?? user.email,
        avatarUrl: payload.avatarUrl ?? user.avatarUrl,
      },
    });
  },

  getInvestments: async (wallet) => {
    const user = await getUserByWallet(wallet);
    const investments = await db.investment.findMany({
      where: { userId: user.id },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    return investments.map((inv) => {
      const images = asArray(inv.property.images);
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
  },

  createInvestment: async (wallet, payload) => {
    const user = await getUserByWallet(wallet);
    const property = await db.property.findUnique({
      where: { id: payload.propertyId },
    });

    if (!property || property.status !== "LISTED") {
      apiError("Property not available for investment");
    }
    if (user.kycStatus !== "APPROVED") {
      apiError("KYC approval required before investing");
    }

    const tokenAmount = BigInt(payload.tokenAmount);
    if (tokenAmount > property.availableTokens) {
      apiError("Insufficient tokens available");
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
  },

  sellInvestment: async (wallet, investmentId, payload) => {
    const user = await getUserByWallet(wallet);
    const investment = await db.investment.findFirst({
      where: { id: investmentId, userId: user.id, status: "ACTIVE" },
      include: { property: true },
    });

    if (!investment) apiError("Investment not found");

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
        data: {
          availableTokens: investment.property.availableTokens + sellAmount,
        },
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
  },

  getKycStatus: async (wallet) => {
    const normalized = normalizeWallet(wallet);
    const user = await db.user.findUnique({
      where: { walletAddress: normalized },
    });
    if (!user) return { status: "NOT_STARTED" };
    return { status: user.kycStatus };
  },

  submitKyc: async (wallet, payload = {}) => {
    const user = await findOrCreateUserByWallet(wallet);
    const autoApprove = payload.autoApprove !== false;
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
  },

  listPendingKyc: async () =>
    db.kycRecord.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { walletAddress: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),

  reviewKyc: async (id, payload) => {
    const record = await db.kycRecord.update({
      where: { id },
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
  },

  getAdminAnalytics: async () => {
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
  },

  getAdminProperties: async (params = {}) => {
    const { limit, skip } = pagination(params);
    const where = params.status ? { status: params.status } : {};
    const [data, total] = await Promise.all([
      db.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.property.count({ where }),
    ]);
    return { data: data.map(serializeProperty), total };
  },

  getAdminUsers: async (params = {}) => {
    const { limit, skip } = pagination(params);
    const [data, total] = await Promise.all([
      db.user.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
      db.user.count(),
    ]);
    return { data, total };
  },

  getAdminTransactions: async (params = {}) => {
    const { limit, skip } = pagination(params);
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
    return { data: data.map(serializeTransaction), total };
  },

  getFavorites: async (wallet) => {
    const user = await findOrCreateUserByWallet(wallet);
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
  },

  addFavorite: async (wallet, propertyId) => {
    const user = await findOrCreateUserByWallet(wallet);
    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property) apiError("Property not found");

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
  },

  removeFavorite: async (wallet, propertyId) => {
    const user = await findOrCreateUserByWallet(wallet);
    await db.favorite.deleteMany({
      where: { userId: user.id, propertyId },
    });
    return { success: true };
  },

  checkFavorite: async (wallet, propertyId) => {
    const user = await findOrCreateUserByWallet(wallet);
    const favorite = await db.favorite.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    });
    return { isFavorite: Boolean(favorite) };
  },

  subscribeNewsletter: async (email) => {
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail) apiError("Valid email is required");

    const existing = await db.newsletter.findFirst({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (!existing.subscribed) {
        await db.newsletter.update({
          where: { id: existing.id },
          data: { subscribed: true },
        });
        return { created: false, reactivated: true };
      }
      return { created: false, reactivated: false };
    }

    await db.newsletter.create({
      data: {
        email: normalizedEmail,
        source: "website",
        subscribed: true,
      },
    });

    return { created: true };
  },
};
