import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FiLock, FiPieChart, FiShield } from "react-icons/fi";
import WalletLogin from "../components/WalletLogin/WalletLogin";
import PropertyCard from "../components/marketplace/PropertyCard";
import GlassCard from "../components/ui/GlassCard";
import { useWalletReady } from "../hooks/useWalletReady";
import { useFeaturedProperties } from "../hooks/useMarketplace";
import { APP_FULL_NAME, APP_NAME, APP_TAGLINE, BRISOVA_FEATURES } from "../config/constants";

const FEATURE_ICONS = {
  lock: FiLock,
  pieChart: FiPieChart,
  shield: FiShield,
};

export default function HomePage() {
  const walletReady = useWalletReady();
  const { data: featured = [], isLoading } = useFeaturedProperties();

  if (!walletReady) {
    return <WalletLogin />;
  }

  return (
    <div className="brisova-page">
      <Helmet>
        <title>{APP_FULL_NAME}</title>
        <meta name="description" content={APP_TAGLINE} />
      </Helmet>

      <section className="brisova-hero container brisova-animate-in">
        <p className="brisova-hero__brand">{APP_NAME}</p>
        <div className="brisova-hero__eyebrow">Ethereum Settlement · Tokenized Assets</div>
        <h1 className="brisova-hero__title">
          Global real estate investment
          <br />
          <span className="brisova-hero__gradient">structured for digital ownership</span>
        </h1>
        <p className="brisova-hero__subtitle">{APP_TAGLINE}</p>
        <div className="brisova-hero__actions">
          <Link to="/marketplace" className="brisova-btn brisova-btn--primary">
            View Marketplace
          </Link>
          <Link to="/dashboard" className="brisova-btn brisova-btn--outline">
            View Portfolio
          </Link>
        </div>
        <div className="brisova-feature-grid">
          {BRISOVA_FEATURES.map(({ icon, title, desc }) => {
            const Icon = FEATURE_ICONS[icon];
            return (
              <GlassCard key={title} className="brisova-feature-card brisova-animate-in">
                <div className="brisova-feature-icon">
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      <Container className="pb-5">
        <div className="brisova-section-head">
          <div>
            <h2>Featured Offerings</h2>
            <p>Selected assets currently available to qualified investors</p>
          </div>
          <Link to="/marketplace" className="brisova-back-link">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="brisova-loading">Loading properties...</div>
        ) : (
          <Row className="g-4">
            {featured.slice(0, 8).map((property) => (
              <Col key={property.id} md={6} lg={3}>
                <PropertyCard property={property} className="brisova-animate-in" />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
