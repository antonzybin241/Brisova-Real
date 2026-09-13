import React from "react";
import { formatCompact, formatUsd } from "../../utils/format";

export default function TokenMetrics({ property }) {
  const tokenPrice = property.tokenPriceUsd || 0;
  const marketCap = Number(property.totalSupply || 0) * tokenPrice;

  return (
    <div className="brisova-detail-grid">
      <div>
        <span>Total Supply</span>
        <strong>{Number(property.totalSupply || 0).toLocaleString()}</strong>
      </div>
      <div>
        <span>Available</span>
        <strong>{Number(property.availableTokens || 0).toLocaleString()}</strong>
      </div>
      <div>
        <span>Investors</span>
        <strong>{property.investorCount ?? 0}</strong>
      </div>
      <div>
        <span>Token Price</span>
        <strong>{formatUsd(tokenPrice)}</strong>
      </div>
      <div className="brisova-detail-grid__wide">
        <span>Market Cap</span>
        <strong>{formatCompact(marketCap)}</strong>
      </div>
    </div>
  );
}
