import TransactionList from "@/components/transactions/TransactionList"

export default async function Dashboard() {  
  return (
    <main>
      <h1 className="font-semibold text-2xl">Dashboard</h1>
      <div className="max-w-2xl mx-auto my-8 w-full">
        <TransactionList transactions={[]} />
      </div>
    </main>
  );
}