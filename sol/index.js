require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const { createSolanaRpc, address } = require('@solana/web3.js');
const { RateLimit } = require('async-sema');
const EventEmitter = require('events');

const wss = new WebSocket.Server({ port: 8080 });
const rpc = createSolanaRpc(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`);
const transactionEmitter = new EventEmitter();
let trackedWallets = [];

const bigIntReplacer = (key, value) => (typeof value === 'bigint' ? value.toString() : value);

async function fetchTransactionWithRetry(signature, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transaction = await rpc.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      }).send({ timeout: 15000 });
      return transaction;
    } catch (error) {
      console.error(`Attempt ${attempt}/${maxRetries} failed for ${signature}:`, error.message);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

async function updateTrackedWallets() {
  try {
    const baseURL = process.env.NODE_ENV === 'production'
      ? 'https://your-nextjs-app.com'
      : 'http://localhost:3000';
    const { data } = await axios.get(`${baseURL}/api/tracked-wallets`);
    
    trackedWallets = data
      .filter(wallet => wallet.chain === 'SOL')
      .map(wallet => {
        try {
          const validAddress = address(wallet.address);
          return { address: validAddress, label: wallet.label };
        } catch (error) {
          console.error(`Invalid address for ${wallet.label}: ${wallet.address}`, error);
          return null;
        }
      })
      .filter(Boolean);

    console.log('📝 Updated tracked wallets:', trackedWallets.map(w => `${w.label}: ${w.address}`));
    broadcast({ type: 'TRACKED_WALLETS', data: trackedWallets });
  } catch (error) {
    console.error('❌ Failed to update tracked wallets:', error);
  }
}

async function saveTransactionToDatabase({ hash, transaction, matches }) {
  try {
    const tokenTransfer = detectTokenTransfer(transaction);
    const transactionData = {
      hash,
      from: transaction.transaction.message.accountKeys[0].toString(),
      to: transaction.transaction.message.accountKeys[1]?.toString() || null,
      wallets: matches.map(m => m.address.toString()),
      blockTime: transaction.blockTime.toString(),
      blockNumber: transaction.slot.toString(),
      fee: transaction.meta.fee.toString(),
      type: tokenTransfer ? 'TOKEN_TRANSFER' : determineTransactionType(transaction),
      status: transaction.meta.err ? 'FAILED' : 'SUCCESS',
      value: '0',
      tokenAmount: tokenTransfer ? tokenTransfer.amount : null,
      tokenAddress: tokenTransfer ? tokenTransfer.token : null,
    };

    const { data } = await axios.post('http://localhost:3000/api/transactions', transactionData, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('✅ Transaction saved:', data);
  } catch (error) {
    console.error('❌ Failed to save transaction:', error.response?.data || error);
  }
}

function detectTokenTransfer(transaction) {
  const tokenBalances = transaction.meta.postTokenBalances || [];
  if (tokenBalances.length > 0) {
    const balanceChange = tokenBalances[0];
    return {
      amount: parseFloat(balanceChange.uiTokenAmount.uiAmountString),
      token: balanceChange.mint,
    };
  }
  return null;
}

function determineTransactionType(transaction) {
  const instructions = transaction.transaction.message.instructions;
  for (const ix of instructions) {
    if (ix.programIdIndex === 11 && ix.data === '2') return 'TOKEN_TRANSFER';
    if (ix.programIdIndex === 12) return 'SWAP';
    if (ix.data === 'WPNHsFPyEMr') return 'INITIALIZE';
  }
  return 'OTHER';
}

async function handleTransaction(signature, transaction) {
  // Custom serializer to handle BigInt and ensure full visibility
  // const detailedStringify = (obj) =>
  //   JSON.stringify(
  //     obj,
  //     (key, value) => (typeof value === 'bigint' ? value.toString() : value),
  //     2 // Pretty-print with 2-space indentation
  //   );

  // // Log the full transaction object
  // console.log('Full transaction details:', detailedStringify(transaction));
  // console.log('Signature:', signature);
  
  try {
    const { message } = transaction.transaction;
    if (!message) {
      console.log('⚠️ No message in transaction:', signature);
      return;
    }

    const accountKeys = message.accountKeys.map(key => key.toString());
    const matches = trackedWallets.filter(wallet => {
      const walletAddress = wallet.address.toString();
      const isSigner = accountKeys[0] === walletAddress;
      const isInvolved = accountKeys.includes(walletAddress);
      const isInInstructions = message.instructions.some(ix =>
        ix.accounts.some(accIndex => accountKeys[accIndex] === walletAddress)
      );
      return isSigner || isInvolved || isInInstructions;
    });

    if (matches.length > 0) {
      console.log('✨ Tracked wallet transaction detected:', signature);
      matches.forEach(match => {
        console.log(`🔔 ${match.label}: ${accountKeys[0] === match.address ? 'Signer' : 'Participant'}`);
      });

      await saveTransactionToDatabase({ hash: signature, transaction, matches });
      broadcast({
        type: 'TRANSACTION',
        data: { hash: signature, transaction: { hash: signature }, wallets: matches, logs: transaction.meta?.logMessages || [] },
      });
    }
  } catch (error) {
    console.error('❌ Error processing transaction:', signature, error);
  }
}

function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message, bigIntReplacer));
    }
  });
}

async function startSolanaMonitoring() {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    console.error('❌ HELIUS_API_KEY not set');
    process.exit(1);
  }

  const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  const ws = new WebSocket(wsUrl);
  const limiter = RateLimit(20, { timeUnit: 60000 });

  ws.on('open', async () => {
    console.log('✅ Helius WebSocket connected');
    await updateTrackedWallets();

    for (const wallet of trackedWallets) {
      await limiter();
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'logsSubscribe',
        params: [{ mentions: [wallet.address.toString()] }, { commitment: 'confirmed' }],
      }));
      console.log(`📡 Subscribed to ${wallet.label}`);
    }
  });

  ws.on('message', async data => {
    const msg = JSON.parse(data.toString());
    const signature = msg.params?.result?.value?.signature;
    if (!signature) return;

    await limiter();
    try {
      const transaction = await fetchTransactionWithRetry(signature);
      if (transaction) transactionEmitter.emit('newTransaction', signature, transaction);
    } catch (error) {
      console.error(`❌ Failed to fetch transaction ${signature} after retries:`, error);
    }
  });

  ws.on('error', error => console.error('❌ WebSocket error:', error));
  ws.on('close', () => console.log('🔴 WebSocket closed'));

  setInterval(() => ws.readyState === WebSocket.OPEN && ws.ping(), 30000);
}

wss.on('connection', ws => {
  console.log('🟢 Client connected');
  ws.send(JSON.stringify({ type: 'TRACKED_WALLETS', data: trackedWallets }, bigIntReplacer));
  ws.on('close', () => console.log('🔴 Client disconnected'));
});

transactionEmitter.on('newTransaction', handleTransaction);

setInterval(updateTrackedWallets, 60000);
startSolanaMonitoring();
console.log('🚀 Solana Server running on ws://localhost:8080');