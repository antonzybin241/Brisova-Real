import React from "react";
import "./WalletLogin.css";
import { FaWallet } from "react-icons/fa";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useWalletSession } from "../providers/WalletSessionProvider";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Helmet } from "react-helmet";
import logo from "../../assets/brisova-logo.png";
import Badge from "../ui/Badge";
import { SUPPORTED_CHAIN_IDS, CHAIN_META, DEFAULT_CHAIN_ID } from "../../config/chains";
import {
  APP_FULL_NAME,
  APP_NAME,
  APP_TAGLINE,
  BRISOVA_SHOWCASE_PROPERTIES,
  BRISOVA_HERO_IMAGES,
  BRISOVA_LOGIN_COPY,
} from "../../config/constants";

const HERO_GALLERY = [
  {
    key: "primary",
    src: BRISOVA_HERO_IMAGES.primary,
    alt: "Waterfront residential estate",
    caption: "Waterfront residences",
  },
  {
    key: "secondary",
    src: BRISOVA_HERO_IMAGES.secondary,
    alt: "Resident in a private luxury villa",
    caption: "Private residences",
  },
  {
    key: "tertiary",
    src: BRISOVA_HERO_IMAGES.tertiary,
    alt: "Private residential property",
    caption: "Modern estates",
  },
  {
    key: "interior",
    src: BRISOVA_HERO_IMAGES.interior,
    alt: "Lifestyle interior of a luxury kitchen",
    caption: "Lived-in interiors",
  },
];

export default function WalletLogin() {
  const { open } = useWeb3Modal();
  const { clearSignedOut } = useWalletSession();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const isSupported = SUPPORTED_CHAIN_IDS.includes(chain?.id);
  const defaultChain = CHAIN_META[DEFAULT_CHAIN_ID];
  const featured = BRISOVA_SHOWCASE_PROPERTIES.find((p) => p.featured) || BRISOVA_SHOWCASE_PROPERTIES[0];
  const rest = BRISOVA_SHOWCASE_PROPERTIES.filter((p) => !p.featured);

  return (
    <div className="brisova-page wallet-login-page">
      <Helmet>
        <title>{APP_FULL_NAME}</title>
        <meta name="description" content={APP_TAGLINE} />
      </Helmet>

      <header className="wallet-login-bar">
        <div className="container">
          <div className="brisova-brand-mark wallet-login-bar__brand">
            <img src={logo} alt={APP_FULL_NAME} />
            <span>
              {APP_NAME}
              <small>Institutional Marketplace</small>
            </span>
          </div>
        </div>
      </header>

      <section className="wallet-login-hero container brisova-animate-in">
        <div className="wallet-login-hero__grid">
          <div className="wallet-login-hero__copy">
            <div className="brisova-hero__eyebrow">{BRISOVA_LOGIN_COPY.eyebrow}</div>

            <h1 className="wallet-login-hero__headline">{BRISOVA_LOGIN_COPY.headline}</h1>

            <p className="wallet-login-hero__lead">{APP_TAGLINE}</p>
            <p className="wallet-login-hero__subhead">{BRISOVA_LOGIN_COPY.subhead}</p>

            <ul className="wallet-login-stats">
              {BRISOVA_LOGIN_COPY.highlights.map(({ label, value }) => (
                <li key={label} className="wallet-login-stats__item">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <div className="wallet-login-hero__actions">
              {!isConnected || !address ? (
                <button
                  type="button"
                  className="brisova-btn brisova-btn--primary wallet-login-cta"
                  onClick={() => {
                    clearSignedOut();
                    open();
                  }}
                >
                  <span className="wallet-login-cta__icon" aria-hidden="true">
                    <FaWallet />
                  </span>
                  Connect your wallet
                </button>
              ) : !isSupported ? (
                <>
                  <p className="wallet-login-connected">
                    Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </p>
                  <button
                    type="button"
                    className="brisova-btn brisova-btn--primary"
                    onClick={() => switchNetwork?.(DEFAULT_CHAIN_ID)}
                  >
                    Switch to {defaultChain?.name || "Ethereum"}
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="wallet-login-hero__visual brisova-animate-in">
            <div className="wallet-login-bento">
              {HERO_GALLERY.map((item, index) => (
                <figure key={item.key} className="wallet-login-bento__cell">
                  <img src={item.src} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} />
                  <figcaption className="wallet-login-bento__caption">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="wallet-login-showcase container">
        <div className="wallet-login-section-head brisova-animate-in">
          <p className="brisova-filters__title">Featured markets</p>
          <h2 className="wallet-login-section-head__title">{BRISOVA_LOGIN_COPY.showcaseTitle}</h2>
          <p className="wallet-login-section-head__desc">{BRISOVA_LOGIN_COPY.showcaseDesc}</p>
        </div>

        <div className="wallet-login-showcase__bento">
          <article className="wallet-login-property wallet-login-property--featured brisova-animate-in">
            <img src={featured.image} alt={`${featured.city}, ${featured.country}`} loading="lazy" />
            <div className="wallet-login-property__overlay">
              <div>
                <Badge variant="success">Featured offering</Badge>
                <h3 className="wallet-login-property__city">{featured.city}</h3>
                <p className="wallet-login-property__country">{featured.country}</p>
              </div>
              <div className="wallet-login-property__meta">
                <span>{featured.type}</span>
                <span>{featured.price}</span>
                <span className="brisova-text-success">{featured.yield} net yield</span>
              </div>
            </div>
          </article>

          <div className="wallet-login-showcase__grid">
            {rest.map((property) => (
              <article key={property.city} className="wallet-login-property brisova-animate-in">
                <img src={property.image} alt={`${property.city}, ${property.country}`} loading="lazy" />
                <div className="wallet-login-property__overlay">
                  <div>
                    <h3 className="wallet-login-property__city">{property.city}</h3>
                    <p className="wallet-login-property__country">{property.country}</p>
                  </div>
                  <div className="wallet-login-property__meta">
                    <Badge variant="info">{property.type}</Badge>
                    <span className="brisova-text-success">{property.yield} yield</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="wallet-login-footer">
        <div className="container">
          <p className="wallet-login-footer__copy">
            © {new Date().getFullYear()} {APP_FULL_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
