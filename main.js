

const gbt= require('./Tokens/bep20.js');
const gerct=require('./Tokens/erc20.js');
const geteth=require('./Tokens/eth.js');


//test
async function getAllTransactions(adrs,startBlock,endBlock) {
    try {
        await Promise.all([
            geteth.getTx(adrs,startBlock,endBlock),
            gerct.getERCTokenTransactions(adrs,startBlock,endBlock),
            gbt.getBEPTokenTransactions(adrs,startBlock,endBlock)
        ]);
        console.log('All transactions processed successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
}
//change accordingly
const adrs = '0x3ddc0D8b59C05CAe4e4102307305Cf3fBE7cd01C';
let startBlock = new Date(2024,1,28,0,0,0);//january is 0 and December is 11 
let endBlock = new Date(2024,1,29,0,0,0);
getAllTransactions(adrs,startBlock,endBlock);



