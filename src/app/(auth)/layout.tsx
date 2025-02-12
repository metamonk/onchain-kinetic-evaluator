import { getTokensFromCookies } from "@/lib/auth"
import TrpcProvider from "@/lib/trpc/Provider";
import { validateGuestRoute } from "@/lib/auth/guard"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await validateGuestRoute();

  const { privyToken } = await getTokensFromCookies();
  return (
    <main>
      <TrpcProvider cookies={privyToken ?? ""}>
        {children}
      </TrpcProvider>
    </main>
  );
}
