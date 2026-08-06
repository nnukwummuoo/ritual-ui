import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  trustWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { bsc } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "mmeko",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains: [bsc],
  ssr: true,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, trustWallet, walletConnectWallet, injectedWallet],
    },
  ],
});