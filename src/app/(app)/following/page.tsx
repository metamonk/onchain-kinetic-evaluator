import TrackedWalletList from "@/components/trackedWallets/TrackedWalletList";
import Wrapper from "@/components/Wrapper"
import { api } from "@/lib/trpc/api";
import TrackedWalletModal from "@/components/trackedWallets/TrackedWalletModal"

export default async function Following() {
  const { trackedWallets } = await api.trackedWallets.getTrackedWallets.query();

  return (
    <main>
      <Wrapper>
        <div className="flex flex-col space-y-8 my-4 w-full">
          <div className="flex flex-col space-y-2">
            <h1 className="font-semibold text-lg">Following</h1>
            <p className="text-sm text-gray-500">Add a wallet to your following list to receive notifications when it makes a transaction.</p>
          </div>
          <TrackedWalletModal emptyState={true} />
          <TrackedWalletList trackedWallets={trackedWallets} />
        </div>
      </Wrapper>
    </main>
  );
}
