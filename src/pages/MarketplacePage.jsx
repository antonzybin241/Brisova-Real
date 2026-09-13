import React, { useState } from "react";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import PageShell from "../components/ui/PageShell";
import PropertyFilters from "../components/marketplace/PropertyFilters";
import PropertyCard from "../components/marketplace/PropertyCard";
import { useProperties } from "../hooks/useMarketplace";
import { APP_FULL_NAME } from "../config/constants";

export default function MarketplacePage() {
  const [filters, setFilters] = useState({ page: 1, limit: 12 });
  const { data, isLoading } = useProperties(filters);
  const properties = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / filters.limit) || 1;

  return (
    <PageShell
      title="Marketplace"
      subtitle={`${total} assets available. Filter by market, return profile, and tokenization status.`}
      helmetTitle={`Marketplace — ${APP_FULL_NAME}`}
      action={
        <Link to="/list-property" className="brisova-btn brisova-btn--primary">
          List Asset
        </Link>
      }
    >
      <PropertyFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="brisova-loading">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="brisova-empty">No assets match the selected criteria.</div>
      ) : (
        <Row className="g-4 mt-2">
          {properties.map((property) => (
            <Col key={property.id} md={6} lg={4}>
              <PropertyCard property={property} className="brisova-animate-in" />
            </Col>
          ))}
        </Row>
      )}

      {totalPages > 1 && (
        <div className="brisova-pagination">
          <button
            type="button"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {filters.page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={filters.page >= totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </PageShell>
  );
}
