import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "mmeko",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains: [bsc], // BNB Smart Chain only — matches your BEP20-only payout policy
  ssr: true,
});