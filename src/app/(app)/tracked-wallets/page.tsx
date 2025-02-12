import AddTrackedWalletForm from "@/components/trackedWallets/AddTrackedWalletForm"
import TrackedWalletList from "@/components/trackedWallets/TrackedWalletList";
import { api } from "@/lib/trpc/api";

export default async function TrackedWallets() {
  const { trackedWallets } = await api.trackedWallets.getTrackedWallets.query();

  return (
    <main>
      <div className="flex justify-between">
        <h1 className="font-semibold text-2xl my-2">Tracked Wallets</h1>
      </div>
      <div className="max-w-2xl mx-auto my-8 w-full">
        <AddTrackedWalletForm />
      </div>
      <div className="max-w-2xl mx-auto my-8 w-full">
        <TrackedWalletList trackedWallets={trackedWallets} />
      </div>
    </main>
  );
}
