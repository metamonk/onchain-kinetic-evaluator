require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const Web3 = require('web3');
const { RateLimit } = require('async-sema');
const EventEmitter = require('events');

const wss = new WebSocket.Server({ port: 8081 }); // Different port from Solana
const web3 = new Web3(process.env.BSC_WS_URL || 'wss://bsc-ws-node.nariox.org:443'); // Replace with your provider
const transactionEmitter = new EventEmitter();
let trackedWallets = [];

async function updateTrackedWallets() {
  try {
    const baseURL = process.env.NODE_ENV === 'production'
      ? 'https://your-nextjs-app.com'
      : 'http://localhost:3000';
    const { data } = await axios.get(`${baseURL}/api/tracked-wallets`);
    
    trackedWallets = data
      .filter(wallet => wallet.chain === 'BSC')
      .map(wallet => ({ address: web3.utils.toChecksumAddress(wallet.address), label: wallet.label }));
    console.log('📝 Updated tracked wallets:', trackedWallets.map(w => `${w.label}: ${w.address}`));
    broadcast({ type: 'TRACKED_WALLETS', data: trackedWallets });
  } catch (error) {
    console.error('❌ Failed to update tracked wallets:', error);
  }
}

async function saveTransactionToDatabase({ hash, transaction, matches }) {
  try {
    const receipt = await web3.eth.getTransactionReceipt(hash);
    const block = await web3.eth.getBlock(transaction.blockNumber);
    const tokenTransfer = detectTokenTransfer(receipt); // Custom function below

    const transactionData = {
      chain: 'BSC',
      hash,
      from: transaction.from,
      to: transaction.to || null,
      wallets: matches.map(m => m.address),
      blockTime: Number(block.timestamp),
      blockNumber: Number(transaction.blockNumber),
      fee: receipt ? Number(receipt.gasUsed) * Number(transaction.gasPrice) : null,
      type: tokenTransfer ? 'TOKEN_TRANSFER' : (transaction.to ? 'TRANSFER' : 'CONTRACT_CALL'),
      status: receipt ? (receipt.status ? 'SUCCESS' : 'FAILED') : 'PENDING',
      value: transaction.value.toString(),
      tokenAmount: tokenTransfer ? parseFloat(web3.utils.fromWei(tokenTransfer.amount, 'ether')) : null,
      tokenAddress: tokenTransfer ? tokenTransfer.token : null,
      raw: { transaction, receipt },
    };

    const { data } = await axios.post('http://localhost:3000/api/transactions', transactionData, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('✅ Transaction saved:', data);
  } catch (error) {
    console.error('❌ Failed to save transaction:', error.response?.data || error);
  }
}

function detectTokenTransfer(receipt) {
  if (!receipt || !receipt.logs) return null;
  const transferEvent = receipt.logs.find(log => 
    log.topics[0] === web3.utils.sha3('Transfer(address,address,uint256)')
  );
  if (transferEvent) {
    return {
      token: transferEvent.address,
      amount: web3.eth.abi.decodeParameter('uint256', transferEvent.data),
    };
  }
  return null;
}

async function startBscMonitoring() {
  if (!process.env.BSC_WS_URL) {
    console.error('❌ BSC_WS_URL not set');
    process.exit(1);
  }

  await updateTrackedWallets();
  const subscription = web3.eth.subscribe('pendingTransactions');

  subscription.on('data', async (hash) => {
    try {
      const transaction = await web3.eth.getTransaction(hash);
      const matches = trackedWallets.filter(wallet => 
        wallet.address === transaction.from || wallet.address === transaction.to
      );
      if (matches.length > 0) {
        console.log('✨ Tracked wallet transaction detected:', hash);
        transactionEmitter.emit('newTransaction', hash, transaction, matches);
      }
    } catch (error) {
      console.error(`❌ Error fetching transaction ${hash}:`, error);
    }
  });

  subscription.on('error', error => console.error('❌ WebSocket error:', error));
}

function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', ws => {
  console.log('🟢 Client connected');
  ws.send(JSON.stringify({ type: 'TRACKED_WALLETS', data: trackedWallets }));
  ws.on('close', () => console.log('🔴 Client disconnected'));
});

transactionEmitter.on('newTransaction', (hash, transaction, matches) => {
  saveTransactionToDatabase({ hash, transaction, matches });
  broadcast({ type: 'TRANSACTION', data: { hash, transaction, wallets: matches } });
});

setInterval(updateTrackedWallets, 60000);
startBscMonitoring();
console.log('🚀 BSC Server running on ws://localhost:8081');