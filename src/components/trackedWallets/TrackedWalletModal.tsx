"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import TrackedWalletForm from "@/components/trackedWallets/TrackedWalletForm";
import { TrackedWallet } from "@/lib/db/schema/trackedWallets";
import { Plus } from "lucide-react";
export default function TrackedWalletModal({ 
  trackedWallet,
  emptyState,
}: { 
  trackedWallet?: TrackedWallet;
  emptyState?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const editing = !!trackedWallet?.id;
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {emptyState ? (
          <Button>
            <Plus className="w-4 h-4" />
            Add New Wallet
          </Button>
        ) : (
          <Button
            variant={editing ? "ghost" : "outline"}
            size={editing ? "sm" : "icon"}
          >
            {editing ? "Edit" : "+"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>{ editing ? "Edit" : "Create" } Tracked Wallet</DialogTitle>
        </DialogHeader>
        <div className="px-5 pb-5">
          <TrackedWalletForm closeModal={closeModal} trackedWallet={trackedWallet} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
