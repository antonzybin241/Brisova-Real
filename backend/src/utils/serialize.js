/** Convert Decimal / BigInt fields into JSON-safe values. */

const asArray = (value) => (Array.isArray(value) ? value : []);

export const serializeProperty = (p) => {
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

export const serializeInvestment = (inv) => {
  if (!inv) return inv;
  return {
    ...inv,
    tokenAmount: inv.tokenAmount != null ? inv.tokenAmount.toString() : "0",
    investedUsd: Number(inv.investedUsd),
    rentalEarnedUsd: Number(inv.rentalEarnedUsd ?? 0),
    property: inv.property ? serializeProperty(inv.property) : inv.property,
  };
};

export const serializeTransaction = (tx) => {
  if (!tx) return tx;
  return {
    ...tx,
    amountUsd: Number(tx.amountUsd),
    tokenAmount: tx.tokenAmount != null ? tx.tokenAmount.toString() : null,
  };
};

/** Enable JSON.stringify for BigInt everywhere (Express responses). */
export const enableBigIntJson = () => {
  if (!BigInt.prototype.toJSON) {
    // eslint-disable-next-line no-extend-native
    BigInt.prototype.toJSON = function toJSON() {
      return this.toString();
    };
  }
};
