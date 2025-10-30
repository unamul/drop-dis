/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

export function useWallet() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // connect wallet
  const connectWallet = async () => {
    if (typeof (window as any)?.ethereum === "undefined") {
      alert("MetaMask not found");
      return;
    }
    const newProvider = new BrowserProvider((window as any)?.ethereum);
    await newProvider.send("eth_requestAccounts", []);
    const newSigner = await newProvider.getSigner();
    const addr = await newSigner.getAddress();

    setProvider(newProvider);
    setSigner(newSigner);
    setAddress(addr);

    localStorage.setItem("connectedAddress", addr);
  };

  // logout wallet (clear session)
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    localStorage.removeItem("connectedAddress");
  };

  // auto-load on refresh
  useEffect(() => {
    const stored = localStorage.getItem("connectedAddress");
    if (stored) setAddress(stored);
  }, []);

  return { provider, signer, address, connectWallet, disconnectWallet };
}
