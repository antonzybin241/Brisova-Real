import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import PageShell from "../components/ui/PageShell";
import WalletGate from "../components/ui/WalletGate";
import EmptyState from "../components/ui/EmptyState";
import PropertyCard from "../components/marketplace/PropertyCard";
import { api } from "../services/api";

export default function FavoritesPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", address],
    queryFn: () => api.getFavorites(address),
    enabled: Boolean(address),
  });

  if (!isConnected) {
    return (
      <WalletGate
        title="Watchlist"
        subtitle="Connect your wallet to save assets under consideration."
        helmetTitle="Watchlist — Brisova"
      />
    );
  }

  const remove = async (propertyId) => {
    try {
      await api.removeFavorite(address, propertyId);
      queryClient.invalidateQueries({ queryKey: ["favorites", address] });
      toast.success("Removed from favorites");
    } catch {
      toast.error("Could not remove favorite");
    }
  };

  return (
    <PageShell
      title="Watchlist"
      subtitle="Assets saved for further review"
      helmetTitle="Watchlist — Brisova"
    >
      {isLoading ? (
        <div className="brisova-loading">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <EmptyState
          message="No assets have been added to the watchlist."
          actionLabel="Browse Marketplace"
          actionTo="/marketplace"
        />
      ) : (
        <Row className="g-4">
          {favorites.map((fav) => (
            <Col md={6} lg={4} key={fav.id}>
              <div className="brisova-property-card-wrap">
                <PropertyCard property={fav.property} className="brisova-animate-in" />
                <button
                  type="button"
                  className="brisova-btn brisova-btn--outline brisova-property-card__remove"
                  onClick={() => remove(fav.propertyId)}
                >
                  Remove
                </button>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </PageShell>
  );
}
