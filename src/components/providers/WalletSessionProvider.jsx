import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";

const SIGN_OUT_KEY = "brisova:signedOut";

const WalletSessionContext = createContext({
  signedOut: false,
  markSignedOut: () => {},
  clearSignedOut: () => {},
  signOut: () => {},
});

const readSignedOut = () => {
  try {
    return sessionStorage.getItem(SIGN_OUT_KEY) === "1";
  } catch {
    return false;
  }
};

export function WalletSessionProvider({ children }) {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const wasConnected = useRef(false);
  const [signedOut, setSignedOut] = useState(readSignedOut);

  const markSignedOut = useCallback(() => {
    try {
      sessionStorage.setItem(SIGN_OUT_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setSignedOut(true);
    navigate("/");
  }, [navigate]);

  const clearSignedOut = useCallback(() => {
    try {
      sessionStorage.removeItem(SIGN_OUT_KEY);
    } catch {
      /* ignore */
    }
    setSignedOut(false);
  }, []);

  const signOut = useCallback(() => {
    markSignedOut();
    disconnect?.();
  }, [disconnect, markSignedOut]);

  useEffect(() => {
    if (isConnected) {
      wasConnected.current = true;
      return;
    }
    if (wasConnected.current) {
      wasConnected.current = false;
      markSignedOut();
    }
  }, [isConnected, markSignedOut]);

  return (
    <WalletSessionContext.Provider value={{ signedOut, markSignedOut, clearSignedOut, signOut }}>
      {children}
    </WalletSessionContext.Provider>
  );
}

export function useWalletSession() {
  return useContext(WalletSessionContext);
}
