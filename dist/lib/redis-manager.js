"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisManager = void 0;
const redis_1 = require("redis");
const utils_1 = require("../utils");
class RedisManager {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
        });
        this.client.connect();
        this.publisher = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
        });
        this.publisher.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }
    sendAndAwait(message) {
        return new Promise((resolve) => {
            const id = this.getRandomClientId();
            (0, utils_1.logger)(`client id => ${id}`);
            this.client.subscribe(id, (message) => {
                (0, utils_1.logger)(`unsubscribing id => ${id}`);
                this.client.unsubscribe(id);
                resolve(JSON.parse(message));
            });
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }));
        });
    }
    getRandomClientId() {
        return (Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15));
    }
}
exports.RedisManager = RedisManager;
//# sourceMappingURL=redis-manager.js.map