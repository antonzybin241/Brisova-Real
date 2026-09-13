import React from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";
import PageShell from "./PageShell";

export default function WalletGate({
  title = "Wallet required",
  subtitle = "Please connect a supported wallet to continue.",
  helmetTitle = "Connect Wallet — Brisova",
}) {
  const navigate = useNavigate();

  return (
    <PageShell title={title} subtitle={subtitle} helmetTitle={helmetTitle}>
      <GlassCard className="brisova-empty-state p-5 text-center brisova-animate-in">
        <p className="brisova-empty-state__message">
          A connected wallet is required to review account data and complete transactions.
        </p>
        <button type="button" className="brisova-btn brisova-btn--primary" onClick={() => navigate("/")}>
          Connect Wallet
        </button>
      </GlassCard>
    </PageShell>
  );
}
