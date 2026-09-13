import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";
import PageShell from "../components/ui/PageShell";
import WalletGate from "../components/ui/WalletGate";
import { useProfile } from "../hooks/useMarketplace";
import { api } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { truncateAddress } from "../utils/format";
import { USER_ROLES } from "../config/chains";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: profile, refetch } = useProfile(address);
  const kycStatus = useAuthStore((s) => s.kycStatus);
  const setKycStatus = useAuthStore((s) => s.setKycStatus);
  const [email, setEmail] = useState("");
  const [docType, setDocType] = useState("passport");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!address) return;
    api.getKycStatus(address).then((r) => setKycStatus(r.status)).catch(() => {});
  }, [address, setKycStatus]);

  useEffect(() => {
    if (profile?.firstName || profile?.lastName) {
      setFullName([profile.firstName, profile.lastName].filter(Boolean).join(" "));
    }
  }, [profile]);

  if (!isConnected) {
    return (
      <WalletGate
        title="Investor Profile"
        subtitle="Connect your wallet to manage identity, contact details, and verification."
        helmetTitle="Profile — Brisova"
      />
    );
  }

  const kycVariant =
    kycStatus === "APPROVED" ? "success" : kycStatus === "PENDING" ? "warning" : "default";

  const handleKyc = async () => {
    if (!fullName.trim()) {
      toast.error("Enter your legal name");
      return;
    }
    setSubmitting(true);
    try {
      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      await api.updateProfile(address, {
        firstName,
        lastName: rest.join(" ") || firstName,
      });
      const result = await api.submitKyc(address, {
        documentType: docType,
        documentUrl: `demo://${docType}/${address.slice(2, 10)}`,
      });
      setKycStatus(result.status || (result.autoApproved ? "APPROVED" : "PENDING"));
      refetch();
      toast.success(
        result.autoApproved
          ? "KYC approved (demo mode) — you can invest now"
          : "KYC submitted for review"
      );
    } catch {
      toast.error("KYC submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Investor Profile"
      subtitle="Wallet address, contact details, and verification status"
      helmetTitle="Profile — Brisova"
      narrow
    >
      <GlassCard className="p-4 mt-4 brisova-animate-in">
        <div className="brisova-form-section">
          <h3 className="brisova-sidebar-heading">Web3 Wallet</h3>
          <p>{truncateAddress(address)}</p>
          <Badge variant="info">Connected</Badge>
        </div>

        <hr className="brisova-divider" />

        <div className="brisova-form-section">
          <h3 className="brisova-sidebar-heading">Contact Email</h3>
          {profile?.email ? (
            <p>{profile.email}</p>
          ) : (
            <Form.Group className="d-flex gap-2 brisova-form">
              <Form.Control
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="button"
                className="brisova-btn brisova-btn--outline"
                onClick={async () => {
                  try {
                    await api.updateProfile(address, { email });
                    refetch();
                    toast.success("Contact email updated.");
                  } catch {
                    toast.error("Unable to update the contact email.");
                  }
                }}
              >
                Save
              </button>
            </Form.Group>
          )}
        </div>

        <hr className="brisova-divider" />

        <div className="brisova-form-section">
          <h3 className="brisova-sidebar-heading mb-2">Verification Status</h3>
          <Badge variant={kycVariant}>{kycStatus}</Badge>

          {kycStatus !== "APPROVED" && (
            <div className="mt-3 brisova-form">
              <Form.Group className="mb-3">
                <Form.Label className="brisova-form-label">Legal name</Form.Label>
                <Form.Control
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full legal name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="brisova-form-label">Document type</Form.Label>
                <Form.Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver&apos;s License</option>
                </Form.Select>
              </Form.Group>
              <button
                type="button"
                className="brisova-btn brisova-btn--primary"
                onClick={handleKyc}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit KYC"}
              </button>
              <p className="brisova-meta mt-2 mb-0">
                Demo mode auto-approves KYC so you can invest immediately.
              </p>
            </div>
          )}
        </div>

        <hr className="brisova-divider" />

        <p className="brisova-meta mb-1">
          Role: <strong>{profile?.role ?? "INVESTOR"}</strong>
        </p>
        <p className="brisova-meta mb-0">Available roles: {USER_ROLES.join(", ")}</p>
      </GlassCard>
    </PageShell>
  );
}
