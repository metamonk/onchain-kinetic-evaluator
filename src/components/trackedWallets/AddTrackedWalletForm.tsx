"use client";

import {
  NewTrackedWalletParams,
  insertTrackedWalletParams
} from "@/lib/db/schema/trackedWallets"
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

const AddTrackedWalletForm = ({
  closeModal,
}: {
  closeModal?: () => void;
}) => {

  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof insertTrackedWalletParams>>({
    // latest Zod release has introduced a TS error with zodResolver
    // open issue: https://github.com/colinhacks/zod/issues/2663
    // errors locally but not in production
    resolver: zodResolver(insertTrackedWalletParams),
    defaultValues: {
      address: "",
      label: "",
    },
  });

  const onSuccess = async (action: "create" | "update" | "delete", data?: any) => {
    console.log(`${action} success:`, data);
    if (data?.error) {
      toast.error(data.error);
      return;
    }

    await utils.trackedWallets.getTrackedWallets.invalidate();
    router.refresh();
    if (closeModal) closeModal();
    toast.success(`Tracked Wallet ${action}d!`);
  };

  const onError = (action: "create" | "update" | "delete", error: string) => {
    toast.error(`Error ${action}ing tracked wallet: ${error}`);
  };

  const { mutate: createTrackedWallet, isLoading: isCreating } =
    trpc.trackedWallets.createTrackedWallet.useMutation({
      onSuccess: (res) => onSuccess("create", res),
      onError: (err) => onError("create", err.message),
    });

  const { mutate: updateTrackedWallet, isLoading: isUpdating } =
    trpc.trackedWallets.updateTrackedWallet.useMutation({
      onSuccess: (res) => onSuccess("update"),
      onError: (err) => onError("update", err.message),
    });

  const onSubmit = (values: NewTrackedWalletParams) => {

    console.log("values", values);
    createTrackedWallet(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-8"}>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
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
          {isCreating || isUpdating ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
};

export default AddTrackedWalletForm;


