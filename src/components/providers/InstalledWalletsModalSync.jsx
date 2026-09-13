import { useEffect, useRef } from "react";
import { ApiController, ConnectorController } from "@web3modal/core";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useConnect, useSwitchNetwork } from "wagmi";
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_IDS } from "../../config/chains";
import { useInstalledWallets } from "../../hooks/useInstalledWallets";
import { markInstalledWalletsInModal } from "../../web3/markInstalledWalletsInModal";
import { syncModalInstalledWallets } from "../../web3/syncModalInstalledWallets";

export default function InstalledWalletsModalSync() {
  const wallets = useInstalledWallets();
  const { open } = useWeb3ModalState();
  const { close } = useWeb3Modal();
  const { connectAsync, connectors } = useConnect();
  const { switchNetworkAsync } = useSwitchNetwork();
  const connectingRef = useRef(false);
  const connectRef = useRef(async () => {});

  connectRef.current = async (wallet) => {
    if (connectingRef.current) return;
    connectingRef.current = true;
    try {
      const eip6963 = connectors.find((item) => item.id === "eip6963");
      const injected = connectors.find((item) => item.id === "injected");
      let result;
      if (eip6963 && wallet.provider) {
        eip6963.setEip6963Wallet?.({
          provider: wallet.provider,
          info: {
            uuid: wallet.uuid,
            name: wallet.name,
            rdns: wallet.rdns,
            icon: wallet.icon,
          },
        });
        result = await connectAsync({ connector: eip6963 });
      } else if (injected) {
        result = await connectAsync({ connector: injected });
      } else {
        throw new Error("No browser wallet connector is available.");
      }
      if (result?.chain?.id && !SUPPORTED_CHAIN_IDS.includes(result.chain.id) && switchNetworkAsync) {
        await switchNetworkAsync(DEFAULT_CHAIN_ID);
      }
      await close();
    } catch {
      // User cancelled or the wallet already has a pending request.
    } finally {
      connectingRef.current = false;
    }
  };

  useEffect(() => {
    if (!wallets.length || open) return undefined;

    const apply = () => syncModalInstalledWallets(wallets);
    apply();

    const unsubConnectors = ConnectorController.subscribeKey("connectors", apply);
    const unsubFeatured = ApiController.subscribeKey("featured", apply);
    return () => {
      unsubConnectors();
      unsubFeatured();
    };
  }, [wallets, open]);

  useEffect(() => {
    if (!open || !wallets.length) return undefined;

    const apply = () =>
      markInstalledWalletsInModal(wallets, (wallet) => {
        connectRef.current(wallet);
      });
    apply();

    const modal = document.querySelector("w3m-modal");
    const root = modal?.shadowRoot || modal;
    if (!root) return undefined;

    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });
    const timer = window.setInterval(apply, 200);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [open, wallets]);

  return null;
}
