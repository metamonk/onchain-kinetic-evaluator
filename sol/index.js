require('dotenv').config();

const WebSocket = require('ws');
const axios = require('axios');
const { createSolanaRpc, address } = require('@solana/web3.js');
const { RateLimit } = require('async-sema');

const wss = new WebSocket.Server({ port: 8080 });
let trackedWallets = [];

// Create an RPC client
const rpc = createSolanaRpc('https://api.mainnet-beta.solana.com');

// Custom replacer function for JSON.stringify
function bigIntReplacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

// Function to handle transaction processing
async function handleTransaction(signature, transaction, trackedWallets) {
  try {
    const message = transaction?.transaction?.message;
    if (!message) {
      console.log('⚠️ No message found in transaction:', signature);
      return null;
    }

    const accountKeys = message.accountKeys;
    console.log('📊 Transaction accounts:', accountKeys);
    console.log('📋 Tracked wallets:', trackedWallets.map(w => w.address));
    console.log('🔍 Instructions:', message.instructions);

    const matches = trackedWallets.filter(wallet => {
      const walletAddress = wallet.address;
      const isSigner = accountKeys[0] === walletAddress;
      const isInvolved = accountKeys.includes(walletAddress);
      const isInInstructions = message.instructions.some(ix => {
        const isInAccounts = ix.accounts.some(accIndex => accountKeys[accIndex] === walletAddress);
        return isInAccounts;
      });

      return isSigner || isInvolved || isInInstructions;
    });

    if (matches.length > 0) {
      console.log('\n✨ TRACKED WALLET TRANSACTION DETECTED! ✨');
      matches.forEach(match => {
        const isSigner = accountKeys[0] === match.address;
        console.log('🔔 Wallet:', match.label);
        console.log('👤 Role:', isSigner ? 'Signer' : 'Participant');
        console.log('📝 Signature:', signature);
        console.log('⚡ Status:', transaction.meta?.err ? 'Failed' : 'Success');
      });

      // Save transaction to the database
      await saveTransactionToDatabase({
        chain: 'SOL',
        transactionHash: signature,
        from: accountKeys[0], // Assuming the first account is the sender
        to: accountKeys[1],   // Assuming the second account is the receiver
        transaction,
        wallets: matches
      });

      return matches;
    } else {
      console.log('⚠️ No matches found for transaction:', signature);
    }

    return null;
  } catch (error) {
    console.error('❌ Error processing transaction:', error);
    return null;
  }
}

// Function to periodically update tracked wallets
async function updateTrackedWallets() {
  try {
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-nextjs-app.com'
      : 'http://localhost:3000';
    const response = await axios.get(`${baseURL}/api/tracked-wallets`);
    trackedWallets = response.data.map(wallet => ({
      address: address(wallet.address),
      label: wallet.label
    }));

    console.log('📝 Final list of tracked wallets:');
    trackedWallets.forEach(wallet => {
      console.log(`   - ${wallet.label}: ${wallet.address}`);
    });
  } catch (error) {
    console.error('Error fetching tracked wallets:', error);
  }
}

// Update tracked wallets every minute
setInterval(updateTrackedWallets, 60000);
// Initial fetch
updateTrackedWallets();

// Function to start Solana monitoring
async function startSolanaMonitoring() {
  if (!process.env.HELIUS_API_KEY) {
    console.error('❌ HELIUS_API_KEY is not set in environment variables');
    process.exit(1);
  }
  
  const limiter = RateLimit(10);
  await updateTrackedWallets();

  const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  const ws = new WebSocket(wsUrl);

  ws.on('open', async () => {
    console.log('✅ WebSocket connection established');
    for (const wallet of trackedWallets) {
      await limiter();
      const subscription = {
        jsonrpc: "2.0",
        id: 1,
        method: "logsSubscribe",
        params: [
          { mentions: [wallet.address] },
          { commitment: "confirmed" }
        ]
      };
      ws.send(JSON.stringify(subscription));
      console.log(`📡 Subscribed to wallet: ${wallet.label}`);
    }

    // Start sending pings to keep the connection alive
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
        console.log('Ping sent');
      }
    }, 30000); // Ping every 30 seconds
  });

  ws.on('message', async (data) => {
    const msg = JSON.parse(data);
    if (!msg.params?.result?.value?.signature) return;

    const signature = msg.params.result.value.signature;
    console.log(`🔔 New transaction detected: ${signature}`);

    try {
      await limiter();
      const transaction = await rpc.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      }).send();
      if (transaction) {
        const matches = await handleTransaction(signature, transaction, trackedWallets);
        if (matches) {
          console.log('🔔 Matches found:', matches);
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'TRANSACTION',
                data: {
                  signature,
                  transaction,
                  wallets: matches,
                  logs: transaction.meta?.logMessages || []
                }
              }, bigIntReplacer)); // Use the custom replacer
            }
          });
        } else {
          console.log('⚠️ No matches found for transaction:', signature);
        }
      } else {
        console.log(`⚠️ No transaction data returned for signature: ${signature}`);
      }
    } catch (error) {
      console.error('❌ Error processing transaction:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('🔴 WebSocket connection closed');
    // Optionally, you can attempt to reconnect here
  });
}

// Start Solana monitoring immediately
startSolanaMonitoring();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🟢 WebSocket Client connected');
  
  ws.send(JSON.stringify({
    type: 'TRACKED_WALLETS',
    data: trackedWallets
  }, bigIntReplacer)); // Use the custom replacer

  ws.on('close', () => {
    console.log('🔴 Client disconnected');
  });
});

console.log('🚀 WebSocket server running on ws://localhost:8080');

async function saveTransactionToDatabase(transactionData) {
  try {
    const response = await axios.post('http://localhost:3000/api/transactions', transactionData);
    console.log('Transaction saved:', response.data);
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
}