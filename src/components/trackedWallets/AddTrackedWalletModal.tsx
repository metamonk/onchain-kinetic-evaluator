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
import { Plus } from "lucide-react";
import AddTrackedWalletForm from "@/components/trackedWallets/AddTrackedWalletForm";

export default function AddTrackedWalletModal() {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1" />
          Add Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Add Tracked Wallet</DialogTitle>
        </DialogHeader>
        <div className="px-5 pb-5">
          <AddTrackedWalletForm closeModal={closeModal} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
