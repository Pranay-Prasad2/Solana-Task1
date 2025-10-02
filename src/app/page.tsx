"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <WalletMultiButton />
    </div>
  );
}
