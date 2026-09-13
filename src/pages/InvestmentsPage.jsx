import React, { useState } from "react";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";
import PageShell from "../components/ui/PageShell";
import WalletGate from "../components/ui/WalletGate";
import EmptyState from "../components/ui/EmptyState";
import { useInvestments } from "../hooks/useMarketplace";
import { api } from "../services/api";
import { formatPercent, formatUsd } from "../utils/format";

export default function InvestmentsPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { data: investments = [], isLoading, refetch } = useInvestments(address);
  const [sellingId, setSellingId] = useState(null);
  const [sellAmount, setSellAmount] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isConnected) {
    return (
      <WalletGate
        title="Holdings"
        subtitle="Connect your wallet to review fractional positions and disposal options."
        helmetTitle="Holdings — Brisova"
      />
    );
  }

  const openSell = (inv) => {
    setSellingId(inv.id);
    setSellAmount(String(inv.tokenAmount));
  };

  const handleSell = async (inv) => {
    const amount = Number(sellAmount);
    const held = Number(inv.tokenAmount);
    if (!amount || amount < 1 || amount > held) {
      toast.error(`Enter between 1 and ${held} tokens`);
      return;
    }
    const pricePerToken = held > 0 ? inv.investedUsd / held : 0;
    setBusy(true);
    try {
      await api.sellInvestment(address, inv.id, {
        tokenAmount: amount,
        saleUsd: amount * pricePerToken,
        txHash: `sell-${Date.now().toString(16)}`,
      });
      toast.success(`Sold ${amount} tokens`);
      setSellingId(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sell failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      title="Holdings"
      subtitle="Fractional positions, income history, and disposal options"
      helmetTitle="Holdings — Brisova"
    >
      {isLoading ? (
        <div className="brisova-loading">Loading investments...</div>
      ) : investments.length === 0 ? (
        <EmptyState
          message="No holdings are recorded for this wallet."
          actionLabel="Browse Marketplace"
          actionTo="/marketplace"
        />
      ) : (
        <Row className="g-3">
          {investments.map((inv) => (
            <Col md={6} key={inv.id}>
              <GlassCard className="p-4 brisova-animate-in">
                {inv.propertyImage && (
                  <div className="brisova-invest-thumb mb-3">
                    <img src={inv.propertyImage} alt="" />
                  </div>
                )}
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <h3 className="brisova-sidebar-heading mb-0">{inv.propertyTitle}</h3>
                  <Badge variant={inv.status === "ACTIVE" ? "success" : "default"}>
                    {inv.status}
                  </Badge>
                </div>
                <div className="brisova-detail-grid mt-3">
                  <div>
                    <span>Tokens</span>
                    <strong>{Number(inv.tokenAmount).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Invested</span>
                    <strong>{formatUsd(inv.investedUsd)}</strong>
                  </div>
                  <div>
                    <span>Rental Earned</span>
                    <strong className="brisova-text-success">{formatUsd(inv.rentalEarnedUsd)}</strong>
                  </div>
                  <div>
                    <span>Expected ROI</span>
                    <strong>{formatPercent(inv.expectedRoi)}</strong>
                  </div>
                </div>

                {sellingId === inv.id ? (
                  <div className="mt-3 brisova-form">
                    <Form.Label className="brisova-form-label">Tokens to sell</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max={Number(inv.tokenAmount)}
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                    />
                    <div className="d-flex gap-2 mt-2">
                      <button
                        type="button"
                        className="brisova-btn brisova-btn--primary"
                        disabled={busy || inv.status !== "ACTIVE"}
                        onClick={() => handleSell(inv)}
                      >
                        {busy ? "Selling..." : "Confirm Sell"}
                      </button>
                      <button
                        type="button"
                        className="brisova-btn brisova-btn--outline"
                        onClick={() => setSellingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    <Link to={`/marketplace/${inv.propertyId}`} className="brisova-btn brisova-btn--outline">
                      View Property
                    </Link>
                    {inv.status === "ACTIVE" && Number(inv.tokenAmount) > 0 && (
                      <button
                        type="button"
                        className="brisova-btn brisova-btn--primary"
                        onClick={() => openSell(inv)}
                      >
                        Sell Tokens
                      </button>
                    )}
                  </div>
                )}
              </GlassCard>
            </Col>
          ))}
        </Row>
      )}
    </PageShell>
  );
}
