
require('dotenv').config();
const {Web3}  = require('web3');
const web3 = new Web3(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ERC_TOKEN_API_KEY}`);
const fs= require('fs');
const {tokenContractDetailsERC20,ercAbi } = require('../config/config.js');

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

  async function getERCTokenTransactions(Adrs,startBlock,endBlock) {
    let transactions=[];
    for (const [tokenName, ContractAddress] of Object.entries(tokenContractDetailsERC20)) {
  const contract = new web3.eth.Contract(ercAbi, ContractAddress);
  
      let sBlock=await getBlockNumberFromDate(startBlock);
      let eBlock=await getBlockNumberFromDate(endBlock);
      let givenAddress=Adrs;
      const blockRangeSize = 2000;
      for (let fromBlock = sBlock; fromBlock <= eBlock; fromBlock += blockRangeSize) {
        const toBlock = Math.min(fromBlock + blockRangeSize, eBlock);
          // Fetch logs for Transfer events for the current block
          const logs = await contract.getPastEvents('Transfer', {
              filter: {},
              fromBlock: fromBlock,
              toBlock: toBlock
          });
  
           //Print transfer events for the current block
         for (const log of logs) {
            let type;
                if (log.returnValues.from === givenAddress) {
                    type = 'Withdrawal';
                } else if (log.returnValues.to === givenAddress) {
                    type = 'Deposit';
                }
          if(log.returnValues.from === givenAddress || log.returnValues.to === givenAddress){
            transactions.push({BlockNumber: log.blockNumber,
                TransactionHash:log.transactionHash,
                From: log.returnValues.from,
                To: log.returnValues.to,
                TransactionValue: `${log.returnValues.value} ${tokenName}`,
                Type: type
                });
          }
      }}
    }
    const stringifyTransactions = transactions.map(transaction => ({
        //... is the spread syntax in JavaScript. It is used to expand elements of an iterable (like an array) or properties of an object into places where multiple elements or properties are expected.
        ...transaction,
        TransactionValue: transaction.TransactionValue.toString()
    }));
    
    // Serialize the array of transactions to a JSON-like string
    const jsonData = stringifyTransactions.map(transaction => {
        return `{
        "BlockNumber": ${transaction.BlockNumber},
        "TransactionHash": "${transaction.TransactionHash}",
        "From": "${transaction.From}",
        "To": "${transaction.To}",
        "TransactionValue": "${transaction.TransactionValue}",
        "Type":"${transaction.Type}"
    }`;
    }).join(',\n');
    
    // Write the JSON-like string to the file
    fs.writeFile('logs/outputErc.txt', `[${jsonData}]`, err => {
        if (err) {
            console.error(err);
            return;
        } else {
            console.log('');
            console.log('Access Transaction details in outputErc.txt');
            console.log('Written to file successfully');
        }
    });
  } 

module.exports={getERCTokenTransactions};