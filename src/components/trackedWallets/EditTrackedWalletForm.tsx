"use client";

import { TrackedWallet, NewTrackedWalletParams, insertTrackedWalletParams } from "@/lib/db/schema/trackedWallets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const TrackedWalletForm = ({
  trackedWallet,
  closeModal,
}: {
  trackedWallet?: TrackedWallet;
  closeModal?: () => void;
}) => {
  
  const editing = !!trackedWallet?.id;

  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof insertTrackedWalletParams>>({
    // latest Zod release has introduced a TS error with zodResolver
    // open issue: https://github.com/colinhacks/zod/issues/2663
    // errors locally but not in production
    resolver: zodResolver(insertTrackedWalletParams),
    defaultValues: trackedWallet ?? {
      address: "",
     label: ""
    },
  });

  const onSuccess = async (action: "create" | "update" | "delete",
    data?: { error?: string },
  ) => {
        if (data?.error) {
      toast.error(data.error)
      return;
    }

    await utils.trackedWallets.getTrackedWallets.invalidate();
    router.refresh();
    if (closeModal) closeModal();
        toast.success(`Tracked Wallet ${action}d!`);
  };

  const { mutate: createTrackedWallet, isLoading: isCreating } =
    trpc.trackedWallets.createTrackedWallet.useMutation({
      onSuccess: (res) => onSuccess("create"),
      onError: (err) => onError("create", { error: err.message }),
    });

  const { mutate: updateTrackedWallet, isLoading: isUpdating } =
    trpc.trackedWallets.updateTrackedWallet.useMutation({
      onSuccess: (res) => onSuccess("update"),
      onError: (err) => onError("update", { error: err.message }),
    });

  const { mutate: deleteTrackedWallet, isLoading: isDeleting } =
    trpc.trackedWallets.deleteTrackedWallet.useMutation({
      onSuccess: (res) => onSuccess("delete"),
      onError: (err) => onError("delete", { error: err.message }),
    });

  const handleSubmit = (values: NewTrackedWalletParams) => {
    if (editing) {
      updateTrackedWallet({ ...values, id: trackedWallet.id });
    } else {
      createTrackedWallet(values);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={"space-y-8"}>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (<FormItem>
              <FormLabel>Address</FormLabel>
                <FormControl>
            <Input {...field} />
          </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (<FormItem>
              <FormLabel>Label</FormLabel>
                <FormControl>
            <Input {...field} />
          </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="mr-1"
          disabled={isCreating || isUpdating}
        >
          {editing
            ? `Sav${isUpdating ? "ing..." : "e"}`
            : `Creat${isCreating ? "ing..." : "e"}`}
        </Button>
        {editing ? (
          <Button
            type="button"
            variant={"destructive"}
            onClick={() => deleteTrackedWallet({ id: trackedWallet.id })}
          >
            Delet{isDeleting ? "ing..." : "e"}
          </Button>
        ) : null}
      </form>
    </Form>
  );
};

export default TrackedWalletForm;
