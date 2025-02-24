require('dotenv').config();

const Web3 = require('web3');
const WebSocket = require('ws');
const axios = require('axios');

const wss = new WebSocket.Server({ port: 8081 });
let trackedWallets = [];


console.log(Web3.providers);

// Connect to BSC node
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.BSC_NODE_URL));

// Function to handle transaction processing
async function handleTransaction(transactionHash) {
  try {
    const transaction = await web3.eth.getTransaction(transactionHash);
    if (!transaction) {
      console.log('⚠️ No transaction found:', transactionHash);
      return;
    }

    const matches = trackedWallets.filter(wallet => 
      transaction.from.toLowerCase() === wallet.address.toLowerCase() ||
      transaction.to.toLowerCase() === wallet.address.toLowerCase()
    );

    if (matches.length > 0) {
      console.log('\n✨ TRACKED WALLET TRANSACTION DETECTED! ✨');
      matches.forEach(match => {
        console.log('🔔 Wallet:', match.label);
        console.log('📝 Transaction Hash:', transactionHash);
        console.log('⚡ Status:', transaction.blockNumber ? 'Confirmed' : 'Pending');
      });

      // Save transaction to the database
      await saveTransactionToDatabase({
        chain: 'EVM',
        transactionHash,
        from: transaction.from,
        to: transaction.to,
        transaction,
        wallets: matches
      });

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'TRANSACTION',
            data: {
              transactionHash,
              transaction,
              wallets: matches
            }
          }));
        }
      });
    } else {
      console.log('⚠️ No matches found for transaction:', transactionHash);
    }
  } catch (error) {
    console.error('❌ Error processing transaction:', error);
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
      address: wallet.address,
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

// Subscribe to pending transactions
web3.eth.subscribe('pendingTransactions', (error, transactionHash) => {
  if (error) {
    console.error('❌ Error subscribing to pending transactions:', error);
    return;
  }
  handleTransaction(transactionHash);
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🟢 WebSocket Client connected');
  
  ws.send(JSON.stringify({
    type: 'TRACKED_WALLETS',
    data: trackedWallets
  }));

  ws.on('close', () => {
    console.log('🔴 Client disconnected');
  });
});

console.log('🚀 BSC WebSocket server running on ws://localhost:8081');

async function saveTransactionToDatabase(transactionData) {
  try {
    const response = await axios.post('http://localhost:3000/api/transactions', transactionData);
    console.log('Transaction saved:', response.data);
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
} 