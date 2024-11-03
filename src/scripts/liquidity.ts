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
const SYMBOLS = ["IS_TRUMP_WINNING", "IS_KAMALA_WINNING", "INDIA_10_TRILLION_ECONOMY_BY_2030", "SWIGGY_IPO_BY_2025", "NFT_COMEBACK", "ARSENAL_WINNING", "SINGULARITY_BY_2030", "CHAT_GPT_5", "WILL_SUPER30_BE_SUCCESSFUL"] as const;
const NUM_BUYERS = 90;
// Ensure NUM_ORDERS doesn't exceed NUM_BUYERS since each user can only place one order
const NUM_ORDERS = Math.min(90, NUM_BUYERS);

// Configuration
const ORDER_CONFIG: OrderConfig = {
  MIN_PRICE: 0.5,    // in rupees
  MAX_PRICE: 9.5,    // in rupees
  PRICE_STEP: 0.5,   // price must be in steps of 0.5
  MAX_QUANTITY: 100,
  MAX_TOTAL_COST_PAISE: 1_00_000, // 1 lakh paise = 1000 rupees
  STOCK_TYPES: ['yes', 'no']
};

// Track used buyers
const usedBuyers = new Set<string>();

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
  const steps = Math.floor((ORDER_CONFIG.MAX_PRICE - ORDER_CONFIG.MIN_PRICE) / ORDER_CONFIG.PRICE_STEP);
  const randomStep = Math.floor(Math.random() * (steps + 1));
  const price = ORDER_CONFIG.MIN_PRICE + (randomStep * ORDER_CONFIG.PRICE_STEP);
  return Number(price.toFixed(1));
}

function getRandomSymbol(): typeof SYMBOLS[number] {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getRandomStockType(): 'yes' | 'no' {
  return ORDER_CONFIG.STOCK_TYPES[Math.floor(Math.random() * ORDER_CONFIG.STOCK_TYPES.length)];
}

function validatePrice(price: number): boolean {
  const priceSteps = (price - ORDER_CONFIG.MIN_PRICE) / ORDER_CONFIG.PRICE_STEP;
  return Number.isInteger(priceSteps) &&
    price >= ORDER_CONFIG.MIN_PRICE &&
    price <= ORDER_CONFIG.MAX_PRICE;
}

function getUnusedBuyerId(): string | null {
  const availableBuyers = Array.from(
    { length: NUM_BUYERS },
    (_, i) => `buyer-${i}`
  ).filter(buyerId => !usedBuyers.has(buyerId));

  if (availableBuyers.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableBuyers.length);
  const buyerId = availableBuyers[randomIndex];
  usedBuyers.add(buyerId);
  return buyerId;
}

function generateValidOrder(): BuyOrder | null {
  const buyerId = getUnusedBuyerId();
  if (!buyerId) {
    return null;
  }

  while (true) {
    const quantity = getRandomNumber(1, ORDER_CONFIG.MAX_QUANTITY);
    const price = getRandomPrice();
    const totalCostPaise = calculateTotalCostInPaise(quantity, price);

    if (totalCostPaise <= ORDER_CONFIG.MAX_TOTAL_COST_PAISE && validatePrice(price)) {
      return {
        userId: buyerId,
        stockSymbol: getRandomSymbol(),
        quantity,
        price,
        stockType: getRandomStockType()
      };
    }
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
      User ID: ${order.userId}
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
      // Remove user from usedBuyers if order fails
      usedBuyers.delete(order.userId);
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

  let ordersPlaced = 0;
  while (ordersPlaced < NUM_ORDERS) {
    const order = generateValidOrder();
    if (!order) {
      console.log('No more available buyers to place orders');
      break;
    }

    await placeBuyOrder(order);
    ordersPlaced++;
  }

  console.log(`Total orders placed: ${ordersPlaced}`);
  console.log('Users who placed orders:', Array.from(usedBuyers).join(', '));
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