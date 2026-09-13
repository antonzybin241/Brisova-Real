import React from "react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import { DEFAULT_PROPERTY_IMAGE } from "../../config/propertyImages";
import { formatPercent, formatUsd } from "../../utils/format";

export default function PropertyCard({ property, className = "" }) {
  const image =
    property.images?.[0] ||
    DEFAULT_PROPERTY_IMAGE;

  return (
    <Link to={`/marketplace/${property.id}`} className={`brisova-property-card ${className}`.trim()}>
      <div className="brisova-property-card__image">
        <img src={image} alt={property.title} loading="lazy" />
        <div className="brisova-property-card__badges">
          {property.isTokenized && <Badge variant="info">Tokenized</Badge>}
          {property.fractionalAvailable && <Badge variant="success">Fractional</Badge>}
        </div>
      </div>
      <div className="brisova-property-card__body">
        <h3>{property.title}</h3>
        <p className="brisova-property-card__location">
          {property.city}, {property.country}
        </p>
        <div className="brisova-property-card__stats">
          <div>
            <span>Price</span>
            <strong>{formatUsd(property.priceUsd)}</strong>
          </div>
          <div>
            <span>ROI</span>
            <strong className="brisova-text-success">{formatPercent(property.expectedRoi)}</strong>
          </div>
          <div>
            <span>Yield</span>
            <strong>{formatPercent(property.rentalYield)}</strong>
          </div>
        </div>
      </div>
    </Link>
  );
}
