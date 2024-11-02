import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Types
interface OrderConfig {
  MIN_PRICE: number;
  MAX_PRICE: number;
  MAX_QUANTITY: number;
  MAX_TOTAL_COST_PAISE: number;
  PRICE_STEP: number;
  STOCK_TYPES: ['yes', 'no'];
}

interface BuyOrder {
  userId: string;
  stockSymbol: string;
  quantity: number;
  price: number;  // in rupees
  stockType: 'yes' | 'no';
}

// Constants
const BASE_URL = 'http://localhost:3000';
const SYMBOLS = ["IS_TRUMP_WINNING", "IS_KAMALA_WINNING", "DOGE_TO_MOON", "INDIA_10_TRILLION_ECONOMY_BY_2030", "SWIGGY_IPO_BY_2025", "NFT_COMEBACK", "ARSENAL_WINNING", "SINGULARITY_BY_2030", "CHAT_GPT_5"] as const;
const NUM_BUYERS = 20;
const NUM_ORDERS = 50;

// Configuration
const ORDER_CONFIG: OrderConfig = {
  MIN_PRICE: 0.5,    // in rupees
  MAX_PRICE: 9.5,    // in rupees
  PRICE_STEP: 0.5,   // price must be in steps of 0.5
  MAX_QUANTITY: 100,
  MAX_TOTAL_COST_PAISE: 1_00_000, // 1 lakh paise = 1000 rupees
  STOCK_TYPES: ['yes', 'no']
};

// API client setup
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Helper functions
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function convertRupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

function calculateTotalCostInPaise(quantity: number, priceInRupees: number): number {
  const priceInPaise = convertRupeesToPaise(priceInRupees);
  return quantity * priceInPaise;
}

function getRandomPrice(): number {
  // Calculate how many possible price steps there are
  const steps = Math.floor((ORDER_CONFIG.MAX_PRICE - ORDER_CONFIG.MIN_PRICE) / ORDER_CONFIG.PRICE_STEP);
  // Get a random step number
  const randomStep = Math.floor(Math.random() * (steps + 1));
  // Calculate the actual price by multiplying the step by 0.5 and adding the minimum price
  const price = ORDER_CONFIG.MIN_PRICE + (randomStep * ORDER_CONFIG.PRICE_STEP);
  return Number(price.toFixed(1)); // Ensure we don't get floating point errors
}

function getRandomSymbol(): typeof SYMBOLS[number] {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getRandomStockType(): 'yes' | 'no' {
  return ORDER_CONFIG.STOCK_TYPES[Math.floor(Math.random() * ORDER_CONFIG.STOCK_TYPES.length)];
}

function validatePrice(price: number): boolean {
  // Check if the price minus the minimum price is a multiple of 0.5
  const priceSteps = (price - ORDER_CONFIG.MIN_PRICE) / ORDER_CONFIG.PRICE_STEP;
  return Number.isInteger(priceSteps) &&
    price >= ORDER_CONFIG.MIN_PRICE &&
    price <= ORDER_CONFIG.MAX_PRICE;
}

function generateValidOrder(): BuyOrder {
  while (true) {
    const quantity = getRandomNumber(1, ORDER_CONFIG.MAX_QUANTITY);
    const price = getRandomPrice();
    const totalCostPaise = calculateTotalCostInPaise(quantity, price);

    if (totalCostPaise <= ORDER_CONFIG.MAX_TOTAL_COST_PAISE && validatePrice(price)) {
      return {
        userId: `buyer-${getRandomNumber(0, NUM_BUYERS - 1)}`,
        stockSymbol: getRandomSymbol(),
        quantity,
        price,
        stockType: getRandomStockType()
      };
    }
    // If total cost exceeds limit or price is invalid, loop will continue to generate new values
  }
}

// API functions
async function createBuyers(): Promise<void> {
  console.log('Creating buyers...');
  const buyerPromises = Array.from({ length: NUM_BUYERS }, (_, index) =>
    api.post(`/user/create/buyer-${index}`)
  );
  await Promise.all(buyerPromises);
}

async function createSymbols(): Promise<void> {
  console.log('Creating symbols...');
  const symbolPromises = SYMBOLS.map(symbol =>
    api.post(`/symbol/create/${symbol}`, {
      adminToken: process.env.ADMIN_TOKEN
    })
  );
  await Promise.all(symbolPromises);
}

async function placeBuyOrder(order: BuyOrder): Promise<void> {
  try {
    if (!validatePrice(order.price)) {
      throw new Error(`Invalid price ${order.price}. Price must be a multiple of ${ORDER_CONFIG.PRICE_STEP}`);
    }

    const totalCostPaise = calculateTotalCostInPaise(order.quantity, order.price);
    console.log(`Order details:
      Symbol: ${order.stockSymbol}
      Quantity: ${order.quantity}
      Price: ₹${order.price} (${convertRupeesToPaise(order.price)} paise)
      Total Cost: ₹${(totalCostPaise / 100).toFixed(2)} (${totalCostPaise} paise)`
    );

    await api.post("/order/buy", order);
    console.log('Order placed successfully\n');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to place order for ${order.userId}: ${error.message}`);
    }
  }
}

async function placeRandomBuyOrders(): Promise<void> {
  console.log('Placing random buy orders...');

  // Print possible prices for verification
  const possiblePrices = Array.from(
    { length: Math.floor((ORDER_CONFIG.MAX_PRICE - ORDER_CONFIG.MIN_PRICE) / ORDER_CONFIG.PRICE_STEP) + 1 },
    (_, i) => (ORDER_CONFIG.MIN_PRICE + i * ORDER_CONFIG.PRICE_STEP).toFixed(1)
  );
  console.log('Possible prices:', possiblePrices.join(', '), '\n');

  for (let i = 0; i < NUM_ORDERS; i++) {
    const order = generateValidOrder();
    await placeBuyOrder(order);
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    await createBuyers();
    await createSymbols();
    await placeRandomBuyOrders();
    console.log('Script completed successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Script failed:', error.message);
      process.exit(1);
    }
  }
}

main();