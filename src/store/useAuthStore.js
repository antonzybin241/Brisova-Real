import { create } from "zustand";
import { DEFAULT_CHAIN_ID } from "../config/chains";

export const useAuthStore = create((set) => ({
  preferredChainId: DEFAULT_CHAIN_ID,
  kycStatus: "NOT_STARTED",
  setPreferredChain: (chainId) => set({ preferredChainId: chainId }),
  setKycStatus: (status) => set({ kycStatus: status }),
}));
