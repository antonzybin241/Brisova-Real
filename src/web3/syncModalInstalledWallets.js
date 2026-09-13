import { ApiController, ConnectorController } from "@web3modal/core";

function sameWallet(connector, wallet) {
  const name = (connector.name || "").toLowerCase();
  return (
    name === wallet.name.toLowerCase() ||
    name.startsWith(`${wallet.name.toLowerCase()} ·`) ||
    (wallet.rdns && connector.info?.rdns === wallet.rdns)
  );
}

function alreadySynced(current, wallets) {
  const announcedReady = wallets.every((wallet) =>
    current.some(
      (connector) => connector.type === "ANNOUNCED" && sameWallet(connector, wallet) && connector.name === wallet.name
    )
  );
  const featured = ApiController.state.featured || [];
  const featuredClean = !featured.some((wallet) =>
    wallets.some(
      (installed) =>
        (wallet.name || "").toLowerCase() === installed.name.toLowerCase() ||
        (installed.rdns && wallet.rdns === installed.rdns)
    )
  );
  return announcedReady && featuredClean;
}

export function syncModalInstalledWallets(wallets) {
  const current = ConnectorController.getConnectors();
  if (!current.length || !wallets.length) return;
  if (alreadySynced(current, wallets)) return;

  const next = current.map((connector) => connector);

  wallets.forEach((wallet) => {
    const existing = next.find((connector) => connector.type === "ANNOUNCED" && sameWallet(connector, wallet));
    const info = {
      uuid: wallet.uuid,
      name: wallet.name,
      rdns: wallet.rdns,
      icon: wallet.icon,
    };

    if (existing) {
      existing.name = wallet.name;
      existing.info = { ...(existing.info || {}), ...info };
      if (wallet.icon) existing.imageUrl = wallet.icon;
      if (wallet.provider) existing.provider = wallet.provider;
      return;
    }

    next.splice(1, 0, {
      id: "eip6963",
      type: "ANNOUNCED",
      name: wallet.name,
      imageUrl: wallet.icon || undefined,
      provider: wallet.provider,
      info,
    });
  });

  const seen = new Set();
  const deduped = next.filter((connector) => {
    if (connector.type !== "ANNOUNCED") return true;
    const key = connector.info?.rdns || connector.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  ConnectorController.setConnectors(deduped);

  const featured = ApiController.state.featured || [];
  const filteredFeatured = featured.filter(
    (wallet) =>
      !wallets.some(
        (installed) =>
          (wallet.name || "").toLowerCase() === installed.name.toLowerCase() ||
          (installed.rdns && wallet.rdns === installed.rdns)
      )
  );
  if (filteredFeatured.length !== featured.length) {
    ApiController.state.featured = filteredFeatured;
  }
}
