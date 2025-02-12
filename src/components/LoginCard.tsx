"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation"

export default function LoginCard() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  
  const disableLogin = !ready || (ready && authenticated);

  const handleLogin = async () => {
    if (!authenticated) {
      await login({
        disableSignup: true,
      });
    }
  }

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">Click the button below to log in</p>
      </CardContent>
      <CardFooter>
        <Button disabled={disableLogin} className="w-full" onClick={handleLogin}>
          Login
        </Button>
      </CardFooter>
    </Card>
  )
}
