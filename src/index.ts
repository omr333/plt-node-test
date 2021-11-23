import { SKUStockInformation, Stock, Transaction } from "./interfaces";

const dataPath = '../data';

async function getStartingStockLevelForSku(sku: string): Promise<number> {
    const stock = await require(`${dataPath}/stock.json`);
    return stock.find((stock: Stock) => stock.sku === sku).stock || 0;
}

async function getStockSoldFromTransactionsForSku(sku: string): Promise<number> {
    const transactions = await require(`${dataPath}/transactions.json`)
        .filter((transaction: Transaction) => transaction.sku === sku);

    if (!transactions.length){
        throw new Error(`No transactions found for ${sku}`);
    }
    
    return transactions.reduce((total: number, transaction: Transaction) => {
        if (transaction.type === 'order') {
            return total + transaction.qty;
        }
        else if (transaction.type === 'refund') {
            return total - transaction.qty
        }
    }, 0);
}

async function getCurrentStockLevelsForSku(sku: string): Promise<SKUStockInformation> {
    const stockSoldFromTransactionsForSku = await getStockSoldFromTransactionsForSku(sku);
    const startingStockLevelForSku = await getStartingStockLevelForSku(sku);
    const currentStockLevel = startingStockLevelForSku - stockSoldFromTransactionsForSku
    return {
        sku,
        qty: currentStockLevel,
    };
}

// Example of getCurrentStockLevelsForSku method in use
(async () => {
    try {
        const sku = 'RCD438149/42/77';
        console.log(`Getting current stock information for '${sku}'`);
        const currentStockLevelForSku = await getCurrentStockLevelsForSku(sku);
        console.log(currentStockLevelForSku);
    } catch (error) {
        console.error(`Error: ${(<Error>error).message}`);
    }
})();
