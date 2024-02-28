
//importing file system
const fs= require('fs');
const abi = require('./ERC20abi.json');
const fetch = require('node-fetch');
const apiUrl = 'https://api.bscscan.com/api';
//to import contract addresses of tokens
const { tokenContractDetailsERC20, tokenContractDetailsBEP20 } = require('./config/config.js');
//accessing eth node
const {Web3}  = require('web3');
const web3 = new Web3('https://eth-mainnet.g.alchemy.com/v2/EZz1To-Nb5VErAW7DW8u8_rW31X2BNmT');

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

      return closestBlockNumber; // Return the closest block number found
  } catch (error) {
      console.error('Error fetching block number from date:', error);
      return null;
  }
}
async function fetchBEPTransactionList(adrs, fromBlock, toBlock, page = 1, offset = 0) {
    
  try {
  
      const queryParams = new URLSearchParams({
          module: 'account',
          action: 'txlist',
          contractaddress: tokenContractDetailsBEP20.DOT,//change accordingly
          address: adrs,
          startblock: fromBlock,
          endblock: toBlock,
          page: page,
          offset: offset,
          sort: 'asc',
          apikey: 'BG58KQHTCHU62P3PCGAW2GEATY5QPC8M2S' 
      });

      // Construct the full URL
      const fullUrl = `${apiUrl}?${queryParams}`;

      // Fetch transaction list
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      console.log(data); 
  } catch (error) {
      console.error('Error fetching transaction list:', error);
  }
}

async function getERCTokenTransactions(Adrs) {
  
  const ContractAddress = tokenContractDetailsERC20.DAI; //change accordingly
  const contract = new web3.eth.Contract(abi, ContractAddress);
      let startBlock = new Date(2024,1,27,23,0,0);//change accordingly
      let endBlock = new Date(2024,1,27,23,50,0);//change accordingly
      let sBlock=await getBlockNumberFromDate(startBlock);
      let eBlock=await getBlockNumberFromDate(endBlock);
      let givenAddress=Adrs;
      for (let i = sBlock; i <= eBlock; i++) {
          // Fetch logs for Transfer events for the current block
          const logs = await contract.getPastEvents('Transfer', {
              filter: {},
              fromBlock: i,
              toBlock: i
          });
  
           //Print transfer events for the current block
         for (const log of logs) {
          if(log.returnValues.from === givenAddress || log.returnValues.to === givenAddress){
              console.log('Block Number:', log.blockNumber);
              console.log('Transaction Hash:', log.transactionHash);
              console.log('From:', log.returnValues.from);
              console.log('To:', log.returnValues.to);
              console.log('Transaction Value:', log.returnValues.value);
              console.log('--------------------------------------');
          }}
      }
  } 



async function getTx(adrs) {
    const transactions=[];
    
    let date1 = new Date(2024,1,22,10,0,0);//change accordingly
    let date2 = new Date(2024,1,21,22,0,0);//change accordingly
    let toblock=await getBlockNumberFromDate(date1);
    let fromblock=await getBlockNumberFromDate(date2);
  
    if (toblock === null || fromblock === null) {
      console.error("Error: Unable to retrieve block numbers.");
      return;
    }
    
    for(let i=fromblock;i <= toblock; i++){
        var block =await web3.eth.getBlock(i,true);
        
        if(block && block.transactions){
        block.transactions.forEach((tx)=>{
            
            if(tx.from === adrs.toLowerCase() || tx.to === adrs.toLowerCase()){

                transactions.push({from: tx.from, to:tx.to, amount: web3.utils.fromWei(tx.value,'ether'),TransactionHash: tx.hash});

            }
        });
    }

    }
    
   
      
        fs.writeFile('Output.txt',JSON.stringify(transactions) , err=>{
          
          if(err){
        console.err; 
        return; 
          }
          else{
            console.log('');
            console.log('Access Transaction details in test.txt');
            console.log('Written to file successfully');
          }
        });
  }
//test
//const adrs='';
  //getTx(adrs) ;

  //for ERC20 tokens
  //getERCTokenTransactions(adrs);

  //for BEP20 tokens
  //const fromBlock = await getBlockNumberFromDate();
  //const toBlock = await getBlockNumberFromDate();
  //fetchBEPTransactionList(adrs, fromBlock, toBlock);


