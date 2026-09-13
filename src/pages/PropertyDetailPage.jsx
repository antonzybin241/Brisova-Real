import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import toast from "react-hot-toast";
import { FiStar } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";
import PageShell from "../components/ui/PageShell";
import EmptyState from "../components/ui/EmptyState";
import PropertyMap from "../components/marketplace/PropertyMap";
import TokenMetrics from "../components/marketplace/TokenMetrics";
import { useProperty } from "../hooks/useMarketplace";
import { api } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { CHAIN_META } from "../config/chains";
import { DEFAULT_PROPERTY_IMAGE } from "../config/propertyImages";
import { formatPercent, formatUsd, truncateAddress } from "../utils/format";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { data: property, isLoading, refetch } = useProperty(id);
  const kycStatus = useAuthStore((s) => s.kycStatus);
  const setKycStatus = useAuthStore((s) => s.setKycStatus);
  const [tokenAmount, setTokenAmount] = useState(10);
  const [activeImage, setActiveImage] = useState(0);
  const [investing, setInvesting] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!address) return;
    api.getKycStatus(address).then((r) => setKycStatus(r.status)).catch(() => {});
  }, [address, setKycStatus]);

  useEffect(() => {
    if (!address || !id) return;
    api.checkFavorite(address, id).then((r) => setFavorited(r.isFavorite)).catch(() => {});
  }, [address, id]);

  if (isLoading) {
    return (
      <PageShell helmetTitle="Loading — Brisova">
        <div className="brisova-loading">Loading property...</div>
      </PageShell>
    );
  }

  if (!property) {
    return (
      <PageShell helmetTitle="Not Found — Brisova">
        <EmptyState
          message="This property could not be found."
          actionLabel="Back to Marketplace"
          actionTo="/marketplace"
        />
      </PageShell>
    );
  }

  const images = property.images?.length
    ? property.images
    : [DEFAULT_PROPERTY_IMAGE];
  const image = images[Math.min(activeImage, images.length - 1)];
  const chain = CHAIN_META[property.chainId] || {};
  const tokenPrice = property.tokenPriceUsd || 0;
  const investTotal = Number(tokenAmount) * tokenPrice;
  const available = Number(property.availableTokens || 0);
  const kycApproved = kycStatus === "APPROVED";

  const handleInvest = async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!kycApproved) {
      toast.error("Complete KYC on your Profile before investing");
      return;
    }
    const amount = Number(tokenAmount);
    if (!amount || amount < 1) {
      toast.error("Enter a valid token amount");
      return;
    }
    if (amount > available) {
      toast.error("Not enough tokens available");
      return;
    }

    setInvesting(true);
    try {
      await api.createInvestment(address, {
        propertyId: property.id,
        tokenAmount: amount,
        investedUsd: investTotal,
        chainId: property.chainId,
        txHash: `demo-${Date.now().toString(16)}`,
      });
      toast.success(`Invested in ${amount} tokens`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Investment failed");
    } finally {
      setInvesting(false);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!address) {
      toast.error("Connect wallet to save favorites");
      return;
    }
    try {
      if (favorited) {
        await api.removeFavorite(address, property.id);
        setFavorited(false);
        toast.success("Removed from favorites");
      } else {
        await api.addFavorite(address, property.id);
        setFavorited(true);
        toast.success("Saved to favorites");
      }
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch {
      toast.error("Could not update favorites");
    }
  };

  let investLabel = "Invest Now";
  if (!isConnected) investLabel = "Connect Wallet";
  else if (!kycApproved) investLabel = "Complete KYC to Invest";
  else if (investing) investLabel = "Processing...";

  return (
    <PageShell helmetTitle={`${property.title} — Brisova`}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 brisova-animate-in">
        <Link to="/marketplace" className="brisova-back-link">
          ← Back to Marketplace
        </Link>
        <button type="button" className="brisova-btn brisova-btn--outline" onClick={toggleFavorite}>
          <FiStar fill={favorited ? "currentColor" : "none"} />
          {favorited ? "Saved" : "Save"}
        </button>
      </div>

      <Row className="g-4 mt-2">
        <Col lg={8}>
          <div className="brisova-detail-image brisova-animate-in">
            <img src={image} alt={property.title} />
          </div>
          {images.length > 1 && (
            <div className="brisova-gallery mt-3">
              {images.slice(0, 6).map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  className={`brisova-gallery__thumb${i === activeImage ? " is-active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          <GlassCard className="p-4 mt-4 brisova-animate-in">
            <div className="brisova-property-card__badges mb-3">
              {property.isTokenized && <Badge variant="info">Tokenized</Badge>}
              {property.fractionalAvailable && <Badge variant="success">Fractional</Badge>}
              <Badge>{property.propertyType?.replace("_", " ")}</Badge>
            </div>
            <h1 className="brisova-detail-title">{property.title}</h1>
            <p className="brisova-property-card__location">
              {property.address}, {property.city}, {property.country}
            </p>
            <p className="brisova-detail-desc">{property.description}</p>
          </GlassCard>

          <GlassCard className="p-4 mt-4 brisova-animate-in">
            <h2 className="brisova-sidebar-heading">Location</h2>
            <PropertyMap
              latitude={property.latitude}
              longitude={property.longitude}
              title={property.title}
            />
          </GlassCard>

          {property.ownershipHistory?.length > 0 && (
            <GlassCard className="p-4 mt-4 brisova-animate-in">
              <h2 className="brisova-sidebar-heading">Ownership History</h2>
              {property.ownershipHistory.map((entry, i) => (
                <div key={i} className="brisova-history-row">
                  <span>{truncateAddress(entry.walletAddress)}</span>
                  <span>{Number(entry.tokenAmount).toLocaleString()} tokens</span>
                  <span>{formatUsd(entry.investedUsd)}</span>
                </div>
              ))}
            </GlassCard>
          )}
        </Col>

        <Col lg={4}>
          <GlassCard className="p-4 brisova-detail-sidebar brisova-animate-in">
            <p className="brisova-stat-label">Valuation</p>
            <p className="brisova-stat-value">{formatUsd(property.valuationUsd)}</p>

            <div className="brisova-detail-grid">
              <div>
                <span>Expected ROI</span>
                <strong className="brisova-text-success">{formatPercent(property.expectedRoi)}</strong>
              </div>
              <div>
                <span>Rental Yield</span>
                <strong>{formatPercent(property.rentalYield)}</strong>
              </div>
              <div>
                <span>Monthly Rental</span>
                <strong>
                  {property.monthlyRentalUsd ? formatUsd(property.monthlyRentalUsd) : "—"}
                </strong>
              </div>
              <div>
                <span>Chain</span>
                <strong>{chain.name || property.chainId}</strong>
              </div>
            </div>

            {(property.fractionalContract || property.nftContract) && (
              <>
                <hr className="brisova-divider" />
                <h3 className="brisova-sidebar-heading">Smart Contracts</h3>
                {property.fractionalContract && (
                  <p className="brisova-contract">
                    ERC-20:{" "}
                    <a
                      href={`${chain.explorer}/address/${property.fractionalContract}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {truncateAddress(property.fractionalContract)}
                    </a>
                  </p>
                )}
                {property.nftContract && (
                  <p className="brisova-contract">
                    ERC-721:{" "}
                    <a
                      href={`${chain.explorer}/address/${property.nftContract}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {truncateAddress(property.nftContract)}
                    </a>
                  </p>
                )}
              </>
            )}

            {property.fractionalAvailable && (
              <>
                <hr className="brisova-divider" />
                <h3 className="brisova-sidebar-heading">Token Information</h3>
                <TokenMetrics property={property} />

                <Form.Group className="mt-3 brisova-form">
                  <Form.Label className="brisova-form-label">Tokens to purchase</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={available || undefined}
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                  />
                  <p className="brisova-meta mt-2 mb-0">
                    Available: {available.toLocaleString()} · Total:{" "}
                    <strong>{formatUsd(investTotal)}</strong>
                  </p>
                </Form.Group>

                {!isConnected ? (
                  <Link to="/" className="brisova-btn brisova-btn--primary w-100 mt-3">
                    Connect Wallet
                  </Link>
                ) : !kycApproved ? (
                  <Link to="/profile" className="brisova-btn brisova-btn--primary w-100 mt-3">
                    Complete KYC to Invest
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="brisova-btn brisova-btn--primary w-100 mt-3"
                    onClick={handleInvest}
                    disabled={investing || available < 1}
                  >
                    {investLabel}
                  </button>
                )}
                <p className="brisova-meta text-center mt-2 mb-0">
                  Demo ledger · USDC · USDT · ETH · WBTC
                </p>
              </>
            )}
          </GlassCard>
        </Col>
      </Row>
    </PageShell>
  );
}
