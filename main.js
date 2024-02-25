
//importing file system
const fs= require('fs');
//Taking User input
const readline = require('readline');
//Give User options for which token he wants to check details for
const inquirer = require('inquirer');
//accessing eth node
const { Web3 } = require('web3');
const web3 = new Web3('https://goerli.infura.io/v3/f48a4b4bec7243c49bb6cef99478e6c1');

//const adrs = web3.utils.asciiToHex(address);
//importing module from token
const gwt=require('./wethToken');


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


  



async function GetTx(adrs,date1,date2) {
    const transactions=[];
    //let block1 =await web3.eth.getBlock('latest');
    //let date1 = new Date(2024,1,22,10,0,0);//currblock>oldblock
    //let date2 = new Date(2024,1,21,22,0,0);
    let currblock=await getBlockNumberFromDate(date1);
    let oldblock=await getBlockNumberFromDate(date2);
  
    //let currblock=Number(block1.number);
    //let oldblock= Number(currblock-Math.ceil((2 * 60 * 60) / 12));

    // Check if currblock or oldblock is null
    if (currblock === null || oldblock === null) {
      console.error("Error: Unable to retrieve block numbers.");
      return;
    }
    
    for(let i=oldblock;i <= currblock; i++){
        var block =await web3.eth.getBlock(i,true);
        //check if Tx exist in the block
        if(block && block.transactions){
        block.transactions.forEach((tx)=>{
            //console.log({From:tx.from,to:tx.to});
            if(tx.from === adrs.toLowerCase() || tx.to === adrs.toLowerCase()){
              //console.log({from: tx.from, to:tx.to, amount: web3.utils.fromWei(tx.value,'ether'),TransactionHash: tx.hash});
                transactions.push({from: tx.from, to:tx.to, amount: web3.utils.fromWei(tx.value,'ether'),TransactionHash: tx.hash});

            }
        });
    }

    }
    
   
      
        fs.writeFile('Output.txt',JSON.stringify(transactions) , err=>{
          //Added JSON.stringify() when writing transactions to the file to convert the array of objects into a string.
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

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// Define your Inquirer prompt
const questions = [{
  type: 'list',
  name: 'token',
  message: 'Which token do you want to check transactions for?',
  choices: ['Ether', 'Wrapped Ether']
}];

// Perform Inquirer prompt
inquirer.prompt(questions)
  .then((answers) => {
      if (answers.token === 'Ether') {
          // Prompt for Ether token
          inquirer.prompt([
              {
                  type: 'input',
                  name: 'address',
                  message: 'Enter the address for which you want transaction details (from & to addresses):',
              },
              {
                  type: 'input',
                  name: 'date1',
                  message: 'Enter the more recent date of the interval in which you want to check the transactions (Format: YYYY-MM-DD HH:MM:SS):',
              },
              {
                  type: 'input',
                  name: 'date2',
                  message: 'Enter the later date of the interval in which you want to check the transactions (Format: YYYY-MM-DD HH:MM:SS):',
              },
          ])
          .then((answers) => {
              // Parse dates
              const parsedDate1 = new Date(answers.date1);
              const parsedDate2 = new Date(answers.date2);
  
              // Call GetTx function with user input
              GetTx(answers.address, parsedDate1, parsedDate2);
          });
      } else if (answers.token === 'Wrapped Ether') {
          // Prompt for Wrapped Ether token
          inquirer.prompt([
              {
                  type: 'input',
                  name: 'date1',
                  message: 'Enter the more recent date of the interval in which you want to check the transactions (Format: YYYY-MM-DD HH:MM:SS):',
              },
              {
                  type: 'input',
                  name: 'date2',
                  message: 'Enter the later date of the interval in which you want to check the transactions (Format: YYYY-MM-DD HH:MM:SS):',
              },
          ])
          .then((answers) => {
              // Parse dates
              const parsedDate1 = new Date(answers.date1);
              const parsedDate2 = new Date(answers.date2);
  
              // Call the function for Wrapped Ether transactions with user input
              gwt.getWethTransactions(parsedDate2, parsedDate1);
          });
      }
  });