"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const events_1 = __importDefault(require("events"));
function waitForServer(baseUrl, maxAttempts, delay) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = yield axios_1.default.get(baseUrl);
                console.log('Server connection established');
                return;
            }
            catch (error) {
                if (attempt === maxAttempts) {
                    throw new Error('Unable to connect to server after maximum attempts');
                }
                console.log(`Server connection attempt ${attempt} failed, retrying in ${delay / 1000} seconds...`);
                yield new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    });
}
class BaseBot extends events_1.default {
    constructor(config) {
        super();
        this.isRunning = false;
        this.orderInterval = null;
        this.stats = {
            totalOrders: 0,
            successfulOrders: 0,
            failedOrders: 0,
            totalVolume: 0,
            averagePrice: 0
        };
        this.userId = "";
        this.config = config;
        this.api = axios_1.default.create({
            baseURL: config.baseUrl,
            timeout: 10000
        });
    }
    getStats() {
        return Object.assign({}, this.stats);
    }
    updateStats(order) {
        this.stats.totalOrders++;
        this.stats.successfulOrders++;
        this.stats.totalVolume += order.quantity;
        this.stats.averagePrice =
            (this.stats.averagePrice * (this.stats.successfulOrders - 1) + order.price) /
                this.stats.successfulOrders;
    }
    incrementFailedOrders() {
        this.stats.failedOrders++;
    }
    makeRequest(method, url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
                try {
                    const response = yield this.api[method.toLowerCase()](url, data);
                    return response.data;
                }
                catch (error) {
                    if (attempt === this.config.maxRetries) {
                        console.error(`Request failed after ${this.config.maxRetries} attempts:`, error);
                        throw error;
                    }
                    console.log(`Request attempt ${attempt} failed, retrying in ${this.config.retryDelay / 1000} seconds...`);
                    yield new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        });
    }
    initialize(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.userId = userId;
                yield this.makeRequest('POST', `/user/create/${userId}`);
                yield this.makeRequest('POST', '/onRamp/inr', {
                    userId: this.userId,
                    amount: this.config.initialInrBalance
                });
                if (type === 'SELLER') {
                    for (const symbol of this.config.stockSymbols) {
                        yield this.makeRequest('POST', `/symbol/create/${symbol}`);
                        yield this.makeRequest('POST', '/trade/mint', {
                            userId: this.userId,
                            stockSymbol: symbol,
                            quantity: this.config.quantityRange.max * 10
                        });
                    }
                }
                this.emit('initialized', { userId, type });
            }
            catch (error) {
                throw new Error(`Bot initialization failed: ${error.message}`);
            }
        });
    }
    stop() {
        if (this.orderInterval) {
            clearInterval(this.orderInterval);
            this.orderInterval = null;
        }
        this.isRunning = false;
    }
}
class BuyerBot extends BaseBot {
    constructor(config, strategy = 'MODERATE') {
        super(config);
        this.strategy = strategy;
    }
    generateOrderParams() {
        return __awaiter(this, void 0, void 0, function* () {
            const orderBook = yield this.makeRequest('GET', '/orderBook');
            const symbol = this.config.stockSymbols[Math.floor(Math.random() * this.config.stockSymbols.length)];
            let price;
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
            console.log(`price - ${price}`);
            return {
                stockSymbol: symbol,
                quantity: Math.floor(Math.random() * (this.config.quantityRange.max - this.config.quantityRange.min) +
                    this.config.quantityRange.min),
                price: parseFloat(price.toFixed(2))
            };
        });
    }
    placeBuyOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = yield this.generateOrderParams();
                yield this.makeRequest('POST', '/order/buy', Object.assign(Object.assign({ userId: this.userId }, params), { stockType: 'LIMIT' }));
                this.updateStats(params);
                this.emit('orderPlaced', Object.assign({ type: 'BUY' }, params));
            }
            catch (error) {
                this.incrementFailedOrders();
                this.emit('orderError', error);
            }
        });
    }
    startTrading(ordersPerSecond) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.orderInterval = setInterval(() => {
            this.placeBuyOrder();
        }, 1000 / ordersPerSecond);
    }
}
class SellerBot extends BaseBot {
    constructor(config, strategy = 'MODERATE') {
        super(config);
        this.strategy = strategy;
    }
    generateOrderParams() {
        return __awaiter(this, void 0, void 0, function* () {
            const orderBook = yield this.makeRequest('GET', '/orderBook');
            const symbol = this.config.stockSymbols[Math.floor(Math.random() * this.config.stockSymbols.length)];
            let price;
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
                quantity: Math.floor(Math.random() * (this.config.quantityRange.max - this.config.quantityRange.min) +
                    this.config.quantityRange.min),
                price: parseFloat(price.toFixed(2))
            };
        });
    }
    placeSellOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = yield this.generateOrderParams();
                yield this.makeRequest('POST', '/order/sell', Object.assign(Object.assign({ userId: this.userId }, params), { stockType: 'LIMIT' }));
                this.updateStats(params);
                this.emit('orderPlaced', Object.assign({ type: 'SELL' }, params));
            }
            catch (error) {
                this.incrementFailedOrders();
                this.emit('orderError', error);
            }
        });
    }
    startTrading(ordersPerSecond) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.orderInterval = setInterval(() => {
            this.placeSellOrder();
        }, 1000 / ordersPerSecond);
    }
}
class BotManager {
    constructor(config) {
        this.buyers = [];
        this.sellers = [];
        this.config = config;
    }
    initializeBots(numBuyers_1, numSellers_1) {
        return __awaiter(this, arguments, void 0, function* (numBuyers, numSellers, strategies = ['AGGRESSIVE', 'MODERATE', 'CONSERVATIVE']) {
            for (let i = 0; i < numBuyers; i++) {
                const strategy = strategies[i % strategies.length];
                const buyer = new BuyerBot(this.config, strategy);
                yield buyer.initialize(`buyer-${i}`, 'BUYER');
                this.buyers.push(buyer);
            }
            for (let i = 0; i < numSellers; i++) {
                const strategy = strategies[i % strategies.length];
                const seller = new SellerBot(this.config, strategy);
                yield seller.initialize(`seller-${i}`, 'SELLER');
                this.sellers.push(seller);
            }
        });
    }
    startTrading(ordersPerSecond) {
        this.buyers.forEach(buyer => buyer.startTrading(ordersPerSecond));
        this.sellers.forEach(seller => seller.startTrading(ordersPerSecond));
    }
    stopTrading() {
        this.buyers.forEach(buyer => buyer.stop());
        this.sellers.forEach(seller => seller.stop());
    }
    getStats() {
        return {
            buyers: this.buyers.map(b => b.getStats()),
            sellers: this.sellers.map(s => s.getStats())
        };
    }
}
function runTradingSimulation() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
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
            yield waitForServer(config.baseUrl, 5, 2000);
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
            yield manager.initializeBots(1, 1); // Start with just one buyer and one seller
            console.log('Bots initialized successfully');
            const ordersPerSecond = 1;
            manager.startTrading(ordersPerSecond);
            console.log(`Trading started with ${ordersPerSecond} orders per second`);
            const statsInterval = setInterval(() => {
                try {
                    const stats = manager.getStats();
                    console.log('Trading Statistics:', JSON.stringify(stats, null, 2));
                }
                catch (error) {
                    console.error('Error getting stats:', error);
                }
            }, 30000);
            setTimeout(() => {
                manager.stopTrading();
                clearInterval(statsInterval);
                console.log('Final Statistics:', manager.getStats());
                process.exit(0);
            }, 5 * 60 * 1000);
        }
        catch (error) {
            console.error('Simulation error:', error);
            process.exit(1);
        }
    });
}
runTradingSimulation().catch((error) => {
    console.error('Fatal error in trading simulation:', error);
    process.exit(1);
});
//# sourceMappingURL=bot.js.map