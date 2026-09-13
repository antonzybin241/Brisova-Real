import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAccount } from "wagmi";
import PageShell from "../components/ui/PageShell";
import WalletGate from "../components/ui/WalletGate";
import StatCard from "../components/ui/StatCard";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import { useDashboard } from "../hooks/useMarketplace";
import { formatPercent, formatUsd } from "../utils/format";
import { BRISOVA_CHART } from "../utils/chartTheme";

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function txBadgeVariant(type) {
  if (type === "RENTAL_DISTRIBUTION") return "success";
  if (type === "SALE") return "warning";
  if (type === "PURCHASE") return "info";
  return "default";
}

function txLabel(type) {
  return String(type || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useDashboard(address);

  if (!isConnected) {
    return (
      <WalletGate
        title="Portfolio"
        subtitle="Connect your wallet to review holdings, rental receipts, and performance."
        helmetTitle="Portfolio — Brisova"
      />
    );
  }

  const chartData =
    data?.performance?.map((p, i) => ({
      name: String(p.title || `Asset ${i + 1}`).slice(0, 14),
      value: Number(p.investedUsd || 0),
    })) ?? [];

  return (
    <PageShell
      title="Portfolio"
      subtitle="Holdings, rental receipts, and performance summary"
      helmetTitle="Portfolio — Brisova"
    >
      {data?.isSampleData && (
        <div className="brisova-demo-banner mb-4 brisova-animate-in">
          Showing sample portfolio activity for demo. Connect after KYC to record your own
          investments.
        </div>
      )}

      {isLoading ? (
        <div className="brisova-loading">Loading dashboard...</div>
      ) : (
        <>
          <Row className="g-3 mt-2">
            <Col md={4}>
              <StatCard
                className="brisova-animate-in"
                label="Total Portfolio Value"
                value={formatUsd(data?.portfolioValueUsd)}
              />
            </Col>
            <Col md={4}>
              <StatCard
                className="brisova-animate-in"
                label="Owned Properties"
                value={String(data?.ownedProperties ?? 0)}
              />
            </Col>
            <Col md={4}>
              <StatCard
                className="brisova-animate-in"
                label="Fractional Investments"
                value={String(data?.fractionalInvestments ?? 0)}
              />
            </Col>
            <Col md={4}>
              <StatCard
                className="brisova-animate-in"
                label="Rental Income"
                value={formatUsd(data?.rentalIncomeUsd)}
                hint="On-chain distributions"
              />
            </Col>
            <Col md={4}>
              <StatCard
                className="brisova-animate-in"
                label="Portfolio ROI"
                value={formatPercent(data?.roiPercent)}
                accent
              />
            </Col>
            <Col md={4}>
              <StatCard
                className="brisova-animate-in"
                label="Token Holdings"
                value={data?.tokenHoldings ?? "0"}
              />
            </Col>
          </Row>

          <Row className="g-4 mt-2">
            <Col lg={6}>
              <GlassCard className="p-4 brisova-animate-in">
                <h3 className="brisova-sidebar-heading">Investment Performance</h3>
                <div className="brisova-chart-wrap">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="brisovaChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={BRISOVA_CHART.stroke} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={BRISOVA_CHART.stroke} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={BRISOVA_CHART.grid} strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke={BRISOVA_CHART.axis} fontSize={11} />
                        <YAxis stroke={BRISOVA_CHART.axis} fontSize={11} />
                        <Tooltip contentStyle={BRISOVA_CHART.tooltip} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={BRISOVA_CHART.stroke}
                          fill="url(#brisovaChart)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="brisova-empty py-4">No holdings recorded.</div>
                  )}
                </div>
              </GlassCard>
            </Col>
            <Col lg={6}>
              <GlassCard className="p-4 brisova-animate-in">
                <h3 className="brisova-sidebar-heading">Recent Activity</h3>
                {(data?.recentTransactions ?? []).length === 0 ? (
                  <div className="brisova-empty py-4">No recent activity recorded.</div>
                ) : (
                  <div className="brisova-tx-list">
                    {data.recentTransactions.map((tx) => (
                      <div key={tx.id} className="brisova-tx-row brisova-tx-row--rich">
                        <div className="brisova-tx-row__media">
                          {tx.propertyImage ? (
                            <img src={tx.propertyImage} alt="" />
                          ) : (
                            <div className="brisova-tx-row__placeholder" />
                          )}
                        </div>
                        <div className="brisova-tx-row__body">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <Badge variant={txBadgeVariant(tx.type)}>{txLabel(tx.type)}</Badge>
                            <span className="brisova-tx-row__time">{relativeTime(tx.createdAt)}</span>
                          </div>
                          <strong className="brisova-tx-row__title">
                            {tx.propertyTitle || "Platform"}
                          </strong>
                          {tx.propertyLocation && (
                            <span className="d-block">{tx.propertyLocation}</span>
                          )}
                        </div>
                        <div className="brisova-tx-row__amount">
                          <strong>
                            {tx.type === "SALE" ? "+" : tx.type === "PURCHASE" ? "−" : "+"}
                            {formatUsd(tx.amountUsd)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </Col>
          </Row>
        </>
      )}
    </PageShell>
  );
}
