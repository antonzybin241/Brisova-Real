import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import GlassCard from "../components/ui/GlassCard";
import PageShell from "../components/ui/PageShell";
import WalletGate from "../components/ui/WalletGate";
import { api } from "../services/api";
import { DEFAULT_CHAIN_ID } from "../config/chains";
import { DEFAULT_PROPERTY_IMAGE } from "../config/propertyImages";

const INITIAL = {
  title: "",
  description: "",
  country: "",
  city: "",
  address: "",
  propertyType: "RESIDENTIAL",
  priceUsd: "",
  expectedRoi: "8",
  rentalYield: "5",
  monthlyRentalUsd: "",
  totalSupply: "10000",
  imageUrl: "",
  chainId: String(DEFAULT_CHAIN_ID),
};

export default function CreateListingPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!isConnected) {
    return (
      <WalletGate
        title="Submit an Asset"
        subtitle="Connect your wallet to propose a listing for platform review."
        helmetTitle="List Asset — Brisova"
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.country || !form.city || !form.priceUsd) {
      toast.error("Fill in title, location, and price");
      return;
    }
    setSubmitting(true);
    try {
      const images = form.imageUrl
        ? [form.imageUrl]
        : [DEFAULT_PROPERTY_IMAGE];
      const property = await api.createProperty({
        walletAddress: address,
        title: form.title,
        description: form.description || `${form.title} listed on Brisova.`,
        country: form.country,
        city: form.city,
        address: form.address || form.city,
        propertyType: form.propertyType,
        priceUsd: Number(form.priceUsd),
        valuationUsd: Number(form.priceUsd),
        expectedRoi: Number(form.expectedRoi),
        rentalYield: Number(form.rentalYield),
        monthlyRentalUsd: form.monthlyRentalUsd ? Number(form.monthlyRentalUsd) : null,
        totalSupply: Number(form.totalSupply) || 10000,
        isTokenized: true,
        fractionalAvailable: true,
        images,
        chainId: Number(form.chainId) || DEFAULT_CHAIN_ID,
      });
      toast.success("Listing submitted for approval");
      navigate(`/marketplace/${property.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Submit an Asset"
      subtitle="Propose a tokenized listing for review and publication"
      helmetTitle="List Asset — Brisova"
      wide
    >
      <GlassCard className="p-4 mt-3 brisova-animate-in">
        <Form onSubmit={handleSubmit} className="brisova-form">
          <div className="brisova-form-section">
            <h3 className="brisova-sidebar-heading">Property Details</h3>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="brisova-form-label">Title</Form.Label>
                <Form.Control value={form.title} onChange={setField("title")} required />
              </Col>
              <Col md={12}>
                <Form.Label className="brisova-form-label">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={setField("description")}
                />
              </Col>
            </Row>
          </div>

          <div className="brisova-form-section">
            <h3 className="brisova-sidebar-heading">Location</h3>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="brisova-form-label">Country</Form.Label>
                <Form.Control value={form.country} onChange={setField("country")} required />
              </Col>
              <Col md={4}>
                <Form.Label className="brisova-form-label">City</Form.Label>
                <Form.Control value={form.city} onChange={setField("city")} required />
              </Col>
              <Col md={4}>
                <Form.Label className="brisova-form-label">Address</Form.Label>
                <Form.Control value={form.address} onChange={setField("address")} />
              </Col>
              <Col md={4}>
                <Form.Label className="brisova-form-label">Type</Form.Label>
                <Form.Select value={form.propertyType} onChange={setField("propertyType")}>
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="LAND">Land</option>
                  <option value="MIXED_USE">Mixed Use</option>
                </Form.Select>
              </Col>
            </Row>
          </div>

          <div className="brisova-form-section">
            <h3 className="brisova-sidebar-heading">Tokenization & Returns</h3>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="brisova-form-label">Price (USD)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={form.priceUsd}
                  onChange={setField("priceUsd")}
                  required
                />
              </Col>
              <Col md={4}>
                <Form.Label className="brisova-form-label">Token Supply</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={form.totalSupply}
                  onChange={setField("totalSupply")}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="brisova-form-label">Expected ROI %</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={form.expectedRoi}
                  onChange={setField("expectedRoi")}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="brisova-form-label">Rental Yield %</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={form.rentalYield}
                  onChange={setField("rentalYield")}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="brisova-form-label">Monthly Rental (USD)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.monthlyRentalUsd}
                  onChange={setField("monthlyRentalUsd")}
                />
              </Col>
            </Row>
          </div>

          <div className="brisova-form-section">
            <h3 className="brisova-sidebar-heading">Media</h3>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="brisova-form-label">Image URL (optional)</Form.Label>
                <Form.Control
                  value={form.imageUrl}
                  onChange={setField("imageUrl")}
                  placeholder="https://..."
                />
              </Col>
            </Row>
          </div>

          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="brisova-btn brisova-btn--primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
            <Link to="/marketplace" className="brisova-btn brisova-btn--outline">
              Cancel
            </Link>
          </div>
        </Form>
      </GlassCard>
    </PageShell>
  );
}
