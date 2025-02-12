require('dotenv').config();

const WebSocket = require('ws');
const { createSolanaRpc, address } = require('@solana/web3.js');

// Replace with your Helius API key
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// Ensure the API key is set
if (!HELIUS_API_KEY) {
  console.error('❌ HELIUS_API_KEY is not set in environment variables');
  process.exit(1);
}

// Log the API key for debugging (remove this in production)
console.log('Using Helius API Key:', HELIUS_API_KEY);

// Test wallet address (use a known active wallet)
const testWalletAddress = address("FGzyXD38TrGGAfZo3dVPASZCG3HC63ZyafjmJnNBhM7j");

// Function to set up a WebSocket connection
function setupWebSocket() {
  const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  console.log('Connecting to WebSocket URL:', wsUrl);

  const ws = new WebSocket(wsUrl);

  const subscription = {
    jsonrpc: "2.0",
    id: 1,
    method: "logsSubscribe",
    params: [
      { mentions: [testWalletAddress] },
      { commitment: "confirmed" }
    ]
  };

  ws.on('open', () => {
    console.log('✅ WebSocket connection established');
    ws.send(JSON.stringify(subscription));
  });

  ws.on('message', async (data) => {
    const msg = JSON.parse(data);
    if (!msg.params?.result?.value?.signature) return;

    const signature = msg.params.result.value.signature;
    console.log(`🔔 New transaction detected: ${signature}`);

    // Fetch transaction details
    try {
      const rpc = createSolanaRpc('https://api.mainnet-beta.solana.com');
      const transaction = await rpc.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      }).send();
      if (transaction) {
        console.log(`📝 Transaction details for signature ${signature}:`, transaction);
      } else {
        console.log(`⚠️ No transaction data returned for signature: ${signature}`);
      }
    } catch (error) {
      console.error('❌ Error fetching transaction details:', error);
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

// Set up the WebSocket connection
setupWebSocket();