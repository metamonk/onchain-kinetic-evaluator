"use client";
import { useEffect, useState } from "react";
import { CompleteTransaction } from "@/lib/db/schema/transactions";
import { trpc } from "@/lib/trpc/client";
import TransactionModal from "./TransactionModal";

// WebSocket connection
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export default function TransactionList({ transactions }: { transactions: CompleteTransaction[] }) {
  const [realtimeTransactions, setRealtimeTransactions] = useState<CompleteTransaction[]>([]);
  const { data: t } = trpc.transactions.getTransactions.useQuery(undefined, {
    initialData: { transactions },
    refetchOnMount: false,
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        console.log('Message:', message);
        
        if (message.type === 'TRANSACTION') {
          const newTransaction: CompleteTransaction = {
            id: message.data.signature,
            signature: message.data.signature,
            walletId: '', // Add appropriate wallet ID
            timestamp: new Date(),
            type: 'transfer', // or appropriate transaction type
            amount: null,
            token: null,
            status: 'confirmed',
            raw: message.data.transaction || {},
            createdAt: new Date(),
            updatedAt: new Date()
          };

          setRealtimeTransactions(prev => {
            // Check if the transaction already exists
            if (prev.some(tx => tx.signature === newTransaction.signature)) {
              return prev; // Return the existing state if duplicate
            }
            return [newTransaction, ...prev].slice(0, 50); // Keep last 50 transactions
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        setRealtimeTransactions([]); // Clear realtime transactions on disconnect
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Combine DB transactions with realtime transactions
  const allTransactions = [...realtimeTransactions, ...t.transactions];

  if (allTransactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul>
      {allTransactions.map((transaction) => (
        <Transaction transaction={transaction} key={transaction.id} />
      ))}
    </ul>
  );
}

const Transaction = ({ transaction }: { transaction: CompleteTransaction }) => {
  return (
    <li className="flex justify-between my-2">
      <div className="w-full">
        <div>{transaction.signature}</div>
        <div className="text-sm text-muted-foreground">
          {new Date(transaction.createdAt).toLocaleString()}
        </div>
      </div>
    </li>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No transactions
      </h3>
    </div>
  );
};

