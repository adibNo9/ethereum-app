import "./index.css";

import React from "react";

import ReactDOM from "react-dom/client";
import { createConfig, WagmiConfig } from "wagmi";

import { configureChains } from "@wagmi/core";
import { mainnet, polygon } from "@wagmi/core/chains";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
import { publicProvider } from "@wagmi/core/providers/public";

import App from "./App";

export const connector = new MetaMaskConnector({
  chains: [mainnet, polygon],
  options: {
    shimDisconnect: true,
    UNSTABLE_shimOnConnectSelectAccount: true,
  },
});

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: false,
  connector,
  publicClient,
  webSocketPublicClient,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiConfig config={config}>
    <App />
  </WagmiConfig>
);
