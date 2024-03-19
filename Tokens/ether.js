
require('dotenv').config();
const {Web3}  = require('web3');
const web3 = new Web3(`${process.env.ETH_RPC_URL}`);
const fs= require('fs');

async function getBlockNumberFromDate(date) {
    try {
        const targetTimestamp = Math.floor(date.getTime() / 1000);
        const latestBlockNumber = Number(await web3.eth.getBlockNumber());
  
        let left = 0; // Starting block number
        let right = latestBlockNumber; // Latest block number
        let closestBlockNumber = null;
        let closestTimestampDiff = Infinity;
  
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const block = await web3.eth.getBlock(mid);
            if (!block) {
                // Handle the case where block retrieval fails
                return closestBlockNumber; // Return the closest block number found
            }
            const blockTimestamp = Number(block.timestamp);
            const timestampDiff = Math.abs(blockTimestamp - targetTimestamp);
  
            if (timestampDiff < closestTimestampDiff) {
                closestTimestampDiff = timestampDiff;
                closestBlockNumber = mid;
            }
  
            if (blockTimestamp === targetTimestamp) {
                // If exact match found, return the block number
                return mid;
            } else if (blockTimestamp < targetTimestamp) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
  
        return closestBlockNumber; 
    } catch (error) {
        console.error('Error fetching block number from date:', error);
        return null;
    }
  }
async function getTx(adrs, startBlock, endBlock) {
    const transactions = [];

    const fromBlock = await getBlockNumberFromDate(startBlock);
    const toBlock = await getBlockNumberFromDate(endBlock);

    // Define the batch size
    const batchSize = 30;
    const givenAddress=adrs.toLowerCase();
    // Process blocks in batches
    for (let i = fromBlock; i <= toBlock; i += batchSize) {
        const batchEndBlock = Math.min(i + batchSize, toBlock);
        const blockPromises = [];

        // Fetch blocks concurrently
        for (let j = i; j <= batchEndBlock; j++) {
            blockPromises.push(web3.eth.getBlock(j, true));
        }

        // Wait for all blocks to be fetched
        const blocks = await Promise.all(blockPromises);

        // Process transactions in each block
        blocks.forEach(block => {
            if (block && block.transactions) {
                block.transactions.forEach(tx => {
                    let type;
                    if (tx.from === givenAddress) {
                        type = 'Withdrawal';
                    } else if (tx.to === givenAddress) {
                        type = 'Deposit';
                    }
                    if (tx.from === givenAddress || tx.to === givenAddress) {
                        transactions.push({
                            from: tx.from,
                            to: tx.to,
                            amount: web3.utils.fromWei(tx.value, 'ether') + ' ETH',
                            TransactionHash: tx.hash,
                            TypeOfTransaction: type
                        });
                    }
                });
            }
        });
    }
    const outputData = transactions.map((transaction) => JSON.stringify(transaction)).join('\n');
        fs.writeFile('logs/outputEth.txt',outputData , err=>{
          
          if(err){
        console.err; 
        return; 
          }
          else{
            console.log('');
            console.log('Access Transaction details in outputEth.txt');
            console.log('Written to file successfully');
          }
        });
  }
  module.exports={getTx};