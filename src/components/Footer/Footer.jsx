import React, { useState } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/brisova-logo.png";
import { APP_NAME, APP_FULL_NAME } from "../../config/constants";
import { api } from "../../services/api";

const FOOTER_LINKS = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/list-property", label: "List Asset" },
  { to: "/favorites", label: "Watchlist" },
  { to: "/dashboard", label: "Portfolio" },
  { to: "/investments", label: "Holdings" },
  { to: "/profile", label: "Investor Profile" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await api.subscribeNewsletter(email.trim());
      toast.success("You are subscribed to Brisova market updates.");
      setEmail("");
    } catch {
      toast.error("Unable to complete the subscription. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="Main_footer_bg">
      <div className="container py-4">
        <div className="row m-0 align-items-start">
          <div className="col-md-5">
            <Link to="/" className="brisova-brand-mark mb-3">
              <img src={logo} alt={APP_NAME} />
              <span>
                {APP_NAME}
                <small>{APP_FULL_NAME}</small>
              </span>
            </Link>
            <p className="site_font footer_copy mt-3 mb-0" style={{ maxWidth: 420 }}>
              Brisova provides access to tokenized real estate interests, fractional ownership,
              and documented rental distributions across major international markets.
            </p>
            <p className="site_font footer_copy mt-3 mb-0">
              © {new Date().getFullYear()} {APP_FULL_NAME}. All rights reserved.
            </p>
          </div>
          <div className="col-md-3 mt-4 mt-md-0">
            <p className="footer_heading mb-2">Platform</p>
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="d-block footer_links mb-2">
                {label}
              </Link>
            ))}
          </div>
          <div className="col-md-4 mt-4 mt-md-0">
            <p className="footer_heading mb-2">Newsletter</p>
            <form onSubmit={subscribe} className="d-flex gap-2 flex-wrap">
              <input
                type="email"
                className="form-control"
                placeholder="Professional email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="brisova-btn brisova-btn--primary" disabled={busy}>
                {busy ? "..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
