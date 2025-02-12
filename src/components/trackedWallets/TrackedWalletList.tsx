"use client";
import { CompleteTrackedWallet } from "@/lib/db/schema/trackedWallets";
import { trpc } from "@/lib/trpc/client";
import TrackedWalletModal from "./TrackedWalletModal";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";


export default function TrackedWalletList({ trackedWallets }: { trackedWallets: CompleteTrackedWallet[] }) {
  const { data: t } = trpc.trackedWallets.getTrackedWallets.useQuery(undefined, {
    initialData: { trackedWallets },
    refetchOnMount: false,
  });

  if (t.trackedWallets.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul>
      {t.trackedWallets.map((trackedWallet) => (
        <TrackedWallet trackedWallet={trackedWallet} key={trackedWallet.id} />
      ))}
    </ul>
  );
}

const TrackedWallet = ({ trackedWallet }: { trackedWallet: CompleteTrackedWallet }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackedWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <li className="flex justify-between my-2">
      <div className="w-full flex items-center gap-2">
        <div>{trackedWallet.label}</div>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="icon"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <TrackedWalletModal trackedWallet={trackedWallet} />
    </li>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No tracked wallets
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new tracked wallet.
      </p>
      <div className="mt-6">
        <TrackedWalletModal emptyState={true} />
      </div>
    </div>
  );
};

