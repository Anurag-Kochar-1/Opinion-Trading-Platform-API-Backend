import axios, { AxiosInstance } from 'axios';
import EventEmitter from 'events';

interface BotConfig {
    baseUrl: string;
    stockSymbols: string[];
    priceRange: { min: number; max: number };
    quantityRange: { min: number; max: number };
    initialInrBalance: number;
    maxRetries: number;
    retryDelay: number;
    connectionTimeout: number;

}

type BotType = 'BUYER' | 'SELLER';
type Strategy = 'AGGRESSIVE' | 'MODERATE' | 'CONSERVATIVE';

interface TradeStats {
    totalOrders: number;
    successfulOrders: number;
    failedOrders: number;
    totalVolume: number;
    averagePrice: number;
}

async function waitForServer(baseUrl: string, maxAttempts: number, delay: number): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await axios.get(baseUrl);
            console.log('Server connection established');
            return;
        } catch (error) {
            if (attempt === maxAttempts) {
                throw new Error('Unable to connect to server after maximum attempts');
            }
            console.log(`Server connection attempt ${attempt} failed, retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

abstract class BaseBot extends EventEmitter {
    protected api: AxiosInstance;
    protected config: BotConfig;
    protected userId: string;
    protected isRunning: boolean = false;
    protected orderInterval: NodeJS.Timeout | null = null;
    private stats: TradeStats = {
        totalOrders: 0,
        successfulOrders: 0,
        failedOrders: 0,
        totalVolume: 0,
        averagePrice: 0
    };

    constructor(config: BotConfig) {
        super();
        this.userId = ""
        this.config = config;
        this.api = axios.create({
            baseURL: config.baseUrl,
            timeout: 10000
        });
    }

    public getStats(): TradeStats {
        return { ...this.stats };
    }

    protected updateStats(order: { quantity: number; price: number }) {
        this.stats.totalOrders++;
        this.stats.successfulOrders++;
        this.stats.totalVolume += order.quantity;
        this.stats.averagePrice =
            (this.stats.averagePrice * (this.stats.successfulOrders - 1) + order.price) /
            this.stats.successfulOrders;
    }

    protected incrementFailedOrders() {
        this.stats.failedOrders++;
    }

    protected async makeRequest(method: string, url: string, data?: any) {
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const response = await this.api[method.toLowerCase() as "get" | "post"](url, data);
                return response.data;
            } catch (error) {
                if (attempt === this.config.maxRetries) {
                    console.error(`Request failed after ${this.config.maxRetries} attempts:`, error);
                    throw error;
                }
                console.log(`Request attempt ${attempt} failed, retrying in ${this.config.retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
            }
        }
    }

    protected abstract generateOrderParams(): Promise<{
        stockSymbol: string;
        quantity: number;
        price: number;
    }>;

    public async initialize(userId: string, type: BotType): Promise<void> {
        try {
            this.userId = userId;
            await this.makeRequest('POST', `/user/create/${userId}`);

            await this.makeRequest('POST', '/onRamp/inr', {
                userId: this.userId,
                amount: this.config.initialInrBalance
            });

            if (type === 'SELLER') {
                for (const symbol of this.config.stockSymbols) {
                    await this.makeRequest('POST', `/symbol/create/${symbol}`);
                    await this.makeRequest('POST', '/trade/mint', {
                        userId: this.userId,
                        stockSymbol: symbol,
                        quantity: this.config.quantityRange.max * 10
                    });
                }
            }

            this.emit('initialized', { userId, type });
        } catch (error: any) {
            throw new Error(`Bot initialization failed: ${error.message}`);
        }
    }

    public stop(): void {
        if (this.orderInterval) {
            clearInterval(this.orderInterval);
            this.orderInterval = null;
        }
        this.isRunning = false;
    }
}

class BuyerBot extends BaseBot {
    private strategy: Strategy;

    constructor(config: BotConfig, strategy: Strategy = 'MODERATE') {
        super(config);
        this.strategy = strategy;
    }

    protected async generateOrderParams() {
        const orderBook = await this.makeRequest('GET', '/orderBook');
        const symbol = this.config.stockSymbols[
            Math.floor(Math.random() * this.config.stockSymbols.length)
        ];

        let price: number;
        const basePrice = this.config.priceRange.min +
            (this.config.priceRange.max - this.config.priceRange.min) / 2;

        switch (this.strategy) {
            case 'AGGRESSIVE':
                price = basePrice * 1.1;
                break;
            case 'CONSERVATIVE':
                price = basePrice * 0.9;
                break;
            default:
                price = basePrice;
        }
        console.log(`price - ${price}`)
        return {
            stockSymbol: symbol,
            quantity: Math.floor(
                Math.random() * (this.config.quantityRange.max - this.config.quantityRange.min) +
                this.config.quantityRange.min
            ),
            price: parseFloat(price.toFixed(2))
        };
    }

    public async placeBuyOrder(): Promise<void> {
        try {
            const params = await this.generateOrderParams();
            await this.makeRequest('POST', '/order/buy', {
                userId: this.userId,
                ...params,
                stockType: 'LIMIT'
            });

            this.updateStats(params);
            this.emit('orderPlaced', { type: 'BUY', ...params });
        } catch (error) {
            this.incrementFailedOrders();
            this.emit('orderError', error);
        }
    }

    public startTrading(ordersPerSecond: number): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.orderInterval = setInterval(() => {
            this.placeBuyOrder();
        }, 1000 / ordersPerSecond);
    }
}

class SellerBot extends BaseBot {
    private strategy: Strategy;

    constructor(config: BotConfig, strategy: Strategy = 'MODERATE') {
        super(config);
        this.strategy = strategy;
    }

    protected async generateOrderParams() {
        const orderBook = await this.makeRequest('GET', '/orderBook');
        const symbol = this.config.stockSymbols[
            Math.floor(Math.random() * this.config.stockSymbols.length)
        ];

        let price: number;
        const basePrice = this.config.priceRange.min +
            (this.config.priceRange.max - this.config.priceRange.min) / 2;

        switch (this.strategy) {
            case 'AGGRESSIVE':
                price = basePrice * 0.9;
                break;
            case 'CONSERVATIVE':
                price = basePrice * 1.1;
                break;
            default:
                price = basePrice;
        }

        return {
            stockSymbol: symbol,
            quantity: Math.floor(
                Math.random() * (this.config.quantityRange.max - this.config.quantityRange.min) +
                this.config.quantityRange.min
            ),
            price: parseFloat(price.toFixed(2))
        };
    }

    public async placeSellOrder(): Promise<void> {
        try {
            const params = await this.generateOrderParams();
            await this.makeRequest('POST', '/order/sell', {
                userId: this.userId,
                ...params,
                stockType: 'LIMIT'
            });

            this.updateStats(params);
            this.emit('orderPlaced', { type: 'SELL', ...params });
        } catch (error) {
            this.incrementFailedOrders();
            this.emit('orderError', error);
        }
    }

    public startTrading(ordersPerSecond: number): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.orderInterval = setInterval(() => {
            this.placeSellOrder();
        }, 1000 / ordersPerSecond);
    }
}

class BotManager {
    private buyers: BuyerBot[] = [];
    private sellers: SellerBot[] = [];
    private config: BotConfig;

    constructor(config: BotConfig) {
        this.config = config;
    }

    public async initializeBots(
        numBuyers: number,
        numSellers: number,
        strategies: Strategy[] = ['AGGRESSIVE', 'MODERATE', 'CONSERVATIVE']
    ) {
        for (let i = 0; i < numBuyers; i++) {
            const strategy = strategies[i % strategies.length];
            const buyer = new BuyerBot(this.config, strategy);
            await buyer.initialize(`buyer-${i}`, 'BUYER');
            this.buyers.push(buyer);
        }

        for (let i = 0; i < numSellers; i++) {
            const strategy = strategies[i % strategies.length];
            const seller = new SellerBot(this.config, strategy);
            await seller.initialize(`seller-${i}`, 'SELLER');
            this.sellers.push(seller);
        }
    }

    public startTrading(ordersPerSecond: number) {
        this.buyers.forEach(buyer => buyer.startTrading(ordersPerSecond));
        this.sellers.forEach(seller => seller.startTrading(ordersPerSecond));
    }

    public stopTrading() {
        this.buyers.forEach(buyer => buyer.stop());
        this.sellers.forEach(seller => seller.stop());
    }

    public getStats() {
        return {
            buyers: this.buyers.map(b => b.getStats()),
            sellers: this.sellers.map(s => s.getStats())
        };
    }
}

async function runTradingSimulation() {
    const config: BotConfig = {
        baseUrl: 'http://localhost:3000',
        stockSymbols: ['AAPL', 'GOOGL', 'MSFT'],
        priceRange: { min: 100, max: 1000 },
        quantityRange: { min: 1, max: 10 },
        initialInrBalance: 1000000,
        maxRetries: 3,
        retryDelay: 2000,
        connectionTimeout: 5000
    };

    try {
        // Wait for server to be available
        console.log('Checking server availability...');
        await waitForServer(config.baseUrl, 5, 2000);

        const manager = new BotManager(config);

        // Setup error handlers
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            manager.stopTrading();
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            manager.stopTrading();
            process.exit(1);
        });

        await manager.initializeBots(1, 1); // Start with just one buyer and one seller
        console.log('Bots initialized successfully');

        const ordersPerSecond = 1;
        manager.startTrading(ordersPerSecond);
        console.log(`Trading started with ${ordersPerSecond} orders per second`);

        const statsInterval = setInterval(() => {
            try {
                const stats = manager.getStats();
                console.log('Trading Statistics:', JSON.stringify(stats, null, 2));
            } catch (error) {
                console.error('Error getting stats:', error);
            }
        }, 30000);

        setTimeout(() => {
            manager.stopTrading();
            clearInterval(statsInterval);
            console.log('Final Statistics:', manager.getStats());
            process.exit(0);
        }, 5 * 60 * 1000);

    } catch (error) {
        console.error('Simulation error:', error)
        process.exit(1);
    }
}


runTradingSimulation().catch((error) => {
    console.error('Fatal error in trading simulation:', error);
    process.exit(1);
});