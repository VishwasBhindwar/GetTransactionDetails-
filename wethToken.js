const {Web3} = require('web3');
const wethAbi = require('./wethAbi.json'); 
const web3 = new Web3('https://goerli.infura.io/v3/f48a4b4bec7243c49bb6cef99478e6c1'); 


const wethContractAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'; 
const wethContract = new web3.eth.Contract(wethAbi, wethContractAddress);
async function getBlockNumberFromDate(date) {
    const targetTimestamp = Math.floor(date.getTime() / 1000);
    const currBlock = await web3.eth.getBlock('latest');
    const Ts1= (Number(currBlock.timestamp)-(targetTimestamp))/12;
    const latestBlockNumber = Number(await web3.eth.getBlockNumber());
  
    let left = Ts1; // Starting block number
    let right = latestBlockNumber; // Latest block number
  
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const block = await web3.eth.getBlock(mid);
      if (!block) {
        // Handle the case where block retrieval fails
        return null;
      }
      const blockTimestamp = Number(block.timestamp);
  
      if (blockTimestamp === targetTimestamp) {
        return mid;
      } else if (blockTimestamp < targetTimestamp) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  
    // If the loop completes without finding the block, return null or handle appropriately
    return null;
  }



// Function to fetch and print WETH transfer events between two blocks
async function getWethTransactions(startBlock, endBlock) {
    let sBlock=await getBlockNumberFromDate(startBlock);
    let eBlock=await getBlockNumberFromDate(endBlock);

    for (let i = sBlock; i <= eBlock; i++) {
        // Fetch logs for Transfer events for the current block
        const logs = await wethContract.getPastEvents('Transfer', {
            filter: {},
            fromBlock: i,
            toBlock: i
        });

        // Print transfer events for the current block
        for (const log of logs) {
            console.log('Block Number:', log.blockNumber);
            console.log('Transaction Hash:', log.transactionHash);
            const tx = await web3.eth.getTransaction(log.transactionHash);
            console.log('From:', tx.from);
            console.log('To:', tx.to);
            console.log('Value:', Number(tx.value));
            console.log('--------------------------------------');
        }
    }
}

module.exports={getWethTransactions};
