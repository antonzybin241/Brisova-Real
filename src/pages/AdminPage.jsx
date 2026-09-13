import React, { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/ui/PageShell";
import StatCard from "../components/ui/StatCard";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../services/api";
import { formatUsd, truncateAddress } from "../utils/format";

const TABS = ["Overview", "Properties", "KYC", "Users", "Transactions"];

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("Overview");
  const [busyId, setBusyId] = useState(null);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.getAdminAnalytics(),
  });

  const { data: properties = { data: [] }, refetch: refetchProps } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => api.getAdminProperties({ limit: 50 }),
    enabled: tab === "Properties" || tab === "Overview",
  });

  const { data: pendingKyc = [], refetch: refetchKyc } = useQuery({
    queryKey: ["admin-kyc-pending"],
    queryFn: () => api.listPendingKyc(),
    enabled: tab === "KYC" || tab === "Overview",
  });

  const { data: users = { data: [] } } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.getAdminUsers({ limit: 50 }),
    enabled: tab === "Users",
  });

  const { data: transactions = { data: [] } } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => api.getAdminTransactions({ limit: 50 }),
    enabled: tab === "Transactions",
  });

  const approveListing = async (id) => {
    setBusyId(id);
    try {
      await api.approveProperty(id);
      toast.success("Property listed");
      refetchProps();
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    } catch {
      toast.error("Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const reviewKyc = async (id, status) => {
    setBusyId(id);
    try {
      await api.reviewKyc(id, { status });
      toast.success(`KYC ${status.toLowerCase()}`);
      refetchKyc();
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    } catch {
      toast.error("Review failed");
    } finally {
      setBusyId(null);
    }
  };

  const pendingProperties = (properties.data || []).filter(
    (p) => p.status === "PENDING_APPROVAL"
  );

  return (
    <PageShell
      title="Administration"
      subtitle="Users, listings, verification, holdings, and platform configuration"
      helmetTitle="Admin — Brisova"
    >
      <div className="brisova-tabs mt-3 mb-4">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            className={`brisova-tabs__btn${tab === name ? " is-active" : ""}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="brisova-loading">Loading analytics...</div>
      ) : (
        <>
          {tab === "Overview" && (
            <>
              <Row className="g-3">
                <Col md={4}>
                  <StatCard label="Total Users" value={String(analytics?.userCount ?? 0)} />
                </Col>
                <Col md={4}>
                  <StatCard label="Properties" value={String(analytics?.propertyCount ?? 0)} />
                </Col>
                <Col md={4}>
                  <StatCard label="Listed" value={String(analytics?.listedCount ?? 0)} />
                </Col>
                <Col md={4}>
                  <StatCard
                    label="Active Investments"
                    value={String(analytics?.investmentCount ?? 0)}
                  />
                </Col>
                <Col md={4}>
                  <StatCard label="Total Volume" value={formatUsd(analytics?.totalVolumeUsd)} />
                </Col>
                <Col md={4}>
                  <StatCard label="Pending KYC" value={String(analytics?.pendingKyc ?? 0)} />
                </Col>
              </Row>
              <Row className="g-3 mt-2">
                <Col md={6}>
                  <GlassCard className="p-4 brisova-animate-in">
                    <h3 className="brisova-sidebar-heading">Pending listings</h3>
                    <p className="brisova-meta mb-0">
                      {analytics?.pendingProperties ?? pendingProperties.length} awaiting approval
                    </p>
                    {pendingProperties.length > 0 && (
                      <button
                        type="button"
                        className="brisova-btn brisova-btn--outline mt-3"
                        onClick={() => setTab("Properties")}
                      >
                        Review listings
                      </button>
                    )}
                  </GlassCard>
                </Col>
                <Col md={6}>
                  <GlassCard className="p-4 brisova-animate-in">
                    <h3 className="brisova-sidebar-heading">Pending KYC</h3>
                    <p className="brisova-meta mb-0">
                      {(pendingKyc || []).length} identity reviews open
                    </p>
                    {(pendingKyc || []).length > 0 && (
                      <button
                        type="button"
                        className="brisova-btn brisova-btn--outline mt-3"
                        onClick={() => setTab("KYC")}
                      >
                        Review KYC
                      </button>
                    )}
                  </GlassCard>
                </Col>
              </Row>
            </>
          )}

          {tab === "Properties" && (
            <GlassCard className="p-4 brisova-animate-in">
              <h3 className="brisova-sidebar-heading mb-3">All properties</h3>
              {(properties.data || []).length === 0 ? (
                <p className="brisova-meta mb-0">No properties.</p>
              ) : (
                (properties.data || []).map((p) => (
                  <div key={p.id} className="brisova-admin-row">
                    <div>
                      <strong>{p.title}</strong>
                      <p className="brisova-meta mb-0">
                        {p.city}, {p.country} · {formatUsd(p.priceUsd)}
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge
                        variant={
                          p.status === "LISTED"
                            ? "success"
                            : p.status === "PENDING_APPROVAL"
                              ? "warning"
                              : "default"
                        }
                      >
                        {p.status}
                      </Badge>
                      {p.status === "PENDING_APPROVAL" && (
                        <button
                          type="button"
                          className="brisova-btn brisova-btn--primary"
                          disabled={busyId === p.id}
                          onClick={() => approveListing(p.id)}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </GlassCard>
          )}

          {tab === "KYC" && (
            <GlassCard className="p-4 brisova-animate-in">
              <h3 className="brisova-sidebar-heading mb-3">Pending KYC</h3>
              {(pendingKyc || []).length === 0 ? (
                <EmptyState message="No verification reviews are pending." className="p-4" />
              ) : (
                (pendingKyc || []).map((k) => (
                  <div key={k.id} className="brisova-admin-row">
                    <div>
                      <strong>{truncateAddress(k.user?.walletAddress)}</strong>
                      <p className="brisova-meta mb-0">
                        {k.documentType} · {k.user?.email || "no email"}
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="brisova-btn brisova-btn--primary"
                        disabled={busyId === k.id}
                        onClick={() => reviewKyc(k.id, "APPROVED")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="brisova-btn brisova-btn--outline"
                        disabled={busyId === k.id}
                        onClick={() => reviewKyc(k.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </GlassCard>
          )}

          {tab === "Users" && (
            <GlassCard className="p-4 brisova-animate-in">
              <h3 className="brisova-sidebar-heading mb-3">Users</h3>
              {(users.data || []).length === 0 ? (
                <p className="brisova-meta mb-0">No users found.</p>
              ) : (
                (users.data || []).map((u) => (
                  <div key={u.id} className="brisova-admin-row">
                    <div>
                      <strong>{truncateAddress(u.walletAddress) || u.email || u.id}</strong>
                      <p className="brisova-meta mb-0">
                        {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <Badge>{u.role}</Badge>
                      <Badge variant={u.kycStatus === "APPROVED" ? "success" : "warning"}>
                        {u.kycStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </GlassCard>
          )}

          {tab === "Transactions" && (
            <GlassCard className="p-4 brisova-animate-in">
              <h3 className="brisova-sidebar-heading mb-3">Recent transactions</h3>
              {(transactions.data || []).length === 0 ? (
                <p className="brisova-meta mb-0">No transactions recorded.</p>
              ) : (
                (transactions.data || []).map((tx) => (
                  <div key={tx.id} className="brisova-admin-row">
                    <div>
                      <strong>{tx.type}</strong>
                      <p className="brisova-meta mb-0">
                        {tx.property?.title || "—"} · {truncateAddress(tx.user?.walletAddress)}
                      </p>
                    </div>
                    <strong>{formatUsd(tx.amountUsd)}</strong>
                  </div>
                ))
              )}
            </GlassCard>
          )}
        </>
      )}
    </PageShell>
  );
}
