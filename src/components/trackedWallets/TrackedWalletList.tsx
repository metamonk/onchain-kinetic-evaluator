"use client";
import { CompleteTrackedWallet } from "@/lib/db/schema/trackedWallets";
import { trpc } from "@/lib/trpc/client";
import TrackedWalletModal from "@/components/trackedWallets/TrackedWalletModal";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { Card, CardDescription, CardTitle, CardHeader } from "../ui/card"


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
      {t.trackedWallets.map((trackedWallet: CompleteTrackedWallet) => (
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
        <TrackedWalletModal trackedWallet={trackedWallet} emptyState={false} />
      </div>
      
    </li>
  );
};

const EmptyState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No tracked wallets</CardTitle>
        <CardDescription>Get started by creating a new tracked wallet.</CardDescription>
      </CardHeader>
    </Card>
  );
};

