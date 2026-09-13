import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import GlassCard from "../ui/GlassCard";
import { PROPERTY_TYPES } from "../../config/constants";

export default function PropertyFilters({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <GlassCard className="brisova-filters">
      <p className="brisova-filters__title">Filters</p>
      <Row className="g-3">
        <Col md={3}>
          <Form.Control
            placeholder="Country"
            value={filters.country || ""}
            onChange={(e) => set({ country: e.target.value })}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            placeholder="City"
            value={filters.city || ""}
            onChange={(e) => set({ city: e.target.value })}
          />
        </Col>
        <Col md={2}>
          <Form.Select
            value={filters.propertyType || ""}
            onChange={(e) => set({ propertyType: e.target.value })}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Min price"
            onChange={(e) => set({ minPrice: e.target.value || undefined })}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Min ROI %"
            onChange={(e) => set({ minRoi: e.target.value || undefined })}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Min yield %"
            onChange={(e) => set({ minRentalYield: e.target.value || undefined })}
          />
        </Col>
        <Col md={2}>
          <Form.Select
            value={filters.tokenized ?? ""}
            onChange={(e) => set({ tokenized: e.target.value || undefined })}
          >
            <option value="">All</option>
            <option value="true">Tokenized</option>
            <option value="false">Non-tokenized</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filters.fractionalAvailable ?? ""}
            onChange={(e) => set({ fractionalAvailable: e.target.value || undefined })}
          >
            <option value="">Fractional</option>
            <option value="true">Available</option>
            <option value="false">Not available</option>
          </Form.Select>
        </Col>
      </Row>
    </GlassCard>
  );
}
