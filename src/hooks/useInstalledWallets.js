import { useEffect, useState } from "react";

function labelFromProvider(provider) {
  if (!provider) return null;
  if (provider.isRabby) return { name: "Rabby", rdns: "io.rabby" };
  if (provider.isBraveWallet) return { name: "Brave Wallet", rdns: "com.brave.wallet" };
  if (provider.isCoinbaseWallet) return { name: "Coinbase Wallet", rdns: "com.coinbase.wallet" };
  if (provider.isOkxWallet || provider.isOKExWallet) return { name: "OKX Wallet", rdns: "com.okex.wallet" };
  if (provider.isTrust) return { name: "Trust Wallet", rdns: "com.trustwallet.app" };
  if (provider.isMetaMask) return { name: "MetaMask", rdns: "io.metamask" };
  return { name: "Browser wallet", rdns: "browser.injected" };
}

function detectLegacyWallets() {
  if (typeof window === "undefined") return [];
  const ethereum = window.ethereum;
  if (!ethereum) return [];

  const providers = Array.isArray(ethereum.providers)
    ? ethereum.providers
    : [ethereum];

  const seen = new Map();
  providers.forEach((provider, index) => {
    const info = labelFromProvider(provider);
    if (!info) return;
    const key = info.rdns || String(index);
    if (!seen.has(key)) {
      seen.set(key, {
        uuid: key,
        name: info.name,
        rdns: info.rdns,
        icon: null,
        provider,
      });
    }
  });

  return Array.from(seen.values());
}

export function useInstalledWallets() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const announced = new Map();

    const publish = () => {
      const list = Array.from(announced.values());
      setWallets(list.length ? list : detectLegacyWallets());
    };

    const onAnnounce = (event) => {
      const { info, provider } = event.detail || {};
      if (!info?.uuid) return;
      announced.set(info.uuid, {
        uuid: info.uuid,
        name: info.name,
        rdns: info.rdns,
        icon: info.icon || null,
        provider,
      });
      publish();
    };

    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    const timeout = window.setTimeout(publish, 180);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
    };
  }, []);

  return wallets;
}
