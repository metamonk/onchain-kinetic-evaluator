"use client";

import { User } from "@privy-io/server-auth";
import { NewUserParams } from "@/lib/db/schema/users"
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Wrapper from "@/components/Wrapper";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "../ui/card"
import { Label } from "../ui/label"

const UserOnboard = ({
  user,
}: {
  user: User;
}) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const onSuccess = async (action: "create" | "update" | "delete",
    data?: { error?: string },
  ) => {
    if (data?.error) {
      toast.error(data.error)
      return;
    }
    await utils.users.getUsers.invalidate();
    router.push("/dashboard");
    toast.success(`Welcome!`);
  };

  const onError = async (action: "create" | "update" | "delete", data: { error: string }) => {
    toast.error(`Error: ${action} failed, ${data.error}`);
  };

  const { mutate: createUser, isLoading: isCreating } =
    trpc.users.createUser.useMutation({
      onSuccess: (res) => onSuccess("create"),
      onError: (err) => onError("create", { error: err.message }),
    });

  const handleClick = () => {
    const values = {
      privyId: user.id,
      walletAddress: user.wallet?.address,
      isAdmin: false
    } as NewUserParams;
    createUser(values);
  };

  return (
    <Wrapper className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
          <CardDescription>Please review the details below and click continue to complete your account creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <div id="wallet-address" className="p-2 bg-secondary rounded-md break-all">
              {user.wallet?.address}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleClick} disabled={isCreating}>
            {isCreating ? "Submitting..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </Wrapper>
  );
};

export default UserOnboard;