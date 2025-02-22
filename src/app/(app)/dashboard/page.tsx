import TransactionList from "@/components/transactions/TransactionList"
import Wrapper from "@/components/Wrapper"
export default async function Dashboard() {  
  return (
    <main>
      <Wrapper>
        <TransactionList transactions={[]} />
      </Wrapper>
    </main>
  );
}