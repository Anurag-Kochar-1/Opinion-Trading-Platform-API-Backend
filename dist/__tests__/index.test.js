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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const types_1 = require("../types");
describe("Basics", () => {
    const user1 = "user-1";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).post(`/reset`);
    }));
    test("Create user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).post(`/user/create/${user1}`);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
    }));
    test("Get user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).get("/user/me").send({ userId: user1 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusCode: 200, statusMessage: "User found" });
    }));
    test("Onramp inr balance", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).post("/onramp/inr").send({ userId: user1, amount: 10000 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusMessage: `INR 10000 added to ${user1} user`, statusCode: 200 });
    }));
    test("Check balance", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).get("/balance/inr/user-1");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            statusCode: 200,
            statusMessage: "",
            statusType: types_1.STATUS_TYPE.SUCCESS,
            data: { balance: 10000, locked: 0 }
        });
    }));
    test("Create symbol", () => __awaiter(void 0, void 0, void 0, function* () {
        const symbol = "TESLA";
        const res = yield (0, supertest_1.default)(index_1.app).post(`/symbol/create/${symbol}`);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            statusType: types_1.STATUS_TYPE.SUCCESS,
            statusCode: 201,
            statusMessage: "Symbol created successfully"
        });
    }));
    test("Check orderbook", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).get("/orderbook");
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            statusMessage: "",
            statusType: types_1.STATUS_TYPE.SUCCESS,
            statusCode: 200,
            data: {
                TESLA: {
                    yes: {},
                    no: {},
                }
            }
        });
    }));
});
describe("Buying", () => {
    const user1 = "user-1";
    const symbol = "ETH";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).post("/reset");
    }));
    test("Create user -> On ramp inr balance -> create symbol", () => __awaiter(void 0, void 0, void 0, function* () {
        const res1 = yield (0, supertest_1.default)(index_1.app).post(`/user/create/${user1}`);
        expect(res1.statusCode).toBe(201);
        expect(res1.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
        const amount = 1000000;
        const res2 = yield (0, supertest_1.default)(index_1.app).post("/onramp/inr").send({ userId: user1, amount });
        expect(res2.status).toBe(200);
        expect(res2.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusMessage: `INR ${amount} added to ${user1} user`, statusCode: 200 });
        const res3 = yield (0, supertest_1.default)(index_1.app).post(`/symbol/create/${symbol}`);
        expect(res3.statusCode).toBe(201);
        expect(res3.body).toEqual({
            statusType: types_1.STATUS_TYPE.SUCCESS,
            statusCode: 201,
            statusMessage: "Symbol created successfully"
        });
    }));
    test("place buy order for 'yes' type", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).post(`/order/buy`).send({
            userId: user1,
            stockSymbol: symbol,
            quantity: 10,
            price: 6,
            stockType: "yes",
        });
        const res2 = yield (0, supertest_1.default)(index_1.app).get("/orderbook");
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toStrictEqual({
            statusMessage: "",
            statusType: types_1.STATUS_TYPE.SUCCESS,
            statusCode: 200,
            data: {
                [symbol]: {
                    yes: {},
                    no: {
                        4: {
                            total: 10,
                            orders: {
                                [user1]: {
                                    type: "system_generated",
                                    quantity: 10
                                }
                            }
                        }
                    }
                }
            }
        });
    }));
});
describe("Selling", () => {
    const user1 = "user-1";
    const symbol = "ETH";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).post("/reset");
    }));
    test("Create user -> On ramp inr balance -> create symbol", () => __awaiter(void 0, void 0, void 0, function* () {
        const res1 = yield (0, supertest_1.default)(index_1.app).post(`/user/create/${user1}`);
        expect(res1.statusCode).toBe(201);
        expect(res1.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
        const amount = 1000000;
        const res2 = yield (0, supertest_1.default)(index_1.app).post("/onramp/inr").send({ userId: user1, amount });
        expect(res2.status).toBe(200);
        expect(res2.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusMessage: `INR ${amount} added to ${user1} user`, statusCode: 200 });
        const res3 = yield (0, supertest_1.default)(index_1.app).post(`/symbol/create/${symbol}`);
        expect(res3.statusCode).toBe(201);
        expect(res3.body).toEqual({
            statusType: types_1.STATUS_TYPE.SUCCESS,
            statusCode: 201,
            statusMessage: "Symbol created successfully"
        });
    }));
    test("mint", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).post("/trade/mint").send({
            userId: user1,
            stockSymbol: symbol,
            quantity: 10,
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, data: { yes: { quantity: 10, locked: 0 }, no: { quantity: 10, locked: 0 } }, statusCode: 200, statusMessage: "Minted Successfully" });
    }));
    test("place sell order for 'yes' type", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).post(`/order/sell`).send({
            userId: user1,
            stockSymbol: symbol,
            quantity: 5,
            price: 1,
            stockType: "yes",
        });
        const res2 = yield (0, supertest_1.default)(index_1.app).get("/orderbook");
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toStrictEqual({
            statusMessage: "",
            statusType: types_1.STATUS_TYPE.SUCCESS,
            statusCode: 200,
            data: {
                [symbol]: {
                    yes: {
                        1: {
                            total: 5,
                            orders: {
                                [user1]: {
                                    type: "sell",
                                    quantity: 5
                                }
                            }
                        }
                    },
                    no: {},
                }
            }
        });
    }));
});
// const basic = ({ user1, symbol }: { user1: string, symbol: string }) => {
//     return test("Create user -> On ramp inr balance -> create symbol", async () => {
//         const res1 = await request(app).post(`/user/create/${user1}`)
//         expect(res1.statusCode).toBe(201)
//         expect(res1.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
//         const amount = 1000000
//         const res2 = await request(app).post("/onramp/inr").send({ userId: user1, amount })
//         expect(res2.status).toBe(200)
//         expect(res2.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusMessage: `INR ${amount} added to ${user1} user`, statusCode: 200 })
//         const res3 = await request(app).post(`/symbol/create/${symbol}`)
//         expect(res3.statusCode).toBe(201)
//         expect(res3.body).toEqual({
//             statusType: STATUS_TYPE.SUCCESS,
//             statusCode: 201,
//             statusMessage: "Symbol created successfully"
//         })
//     })
// }
describe("Matching", () => {
    const user1 = "user-1";
    const symbol = "DOGE";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).post("/reset");
    }));
    test("Create user -> On ramp inr balance -> create symbol", () => __awaiter(void 0, void 0, void 0, function* () {
        const res1 = yield (0, supertest_1.default)(index_1.app).post(`/user/create/${user1}`);
        expect(res1.statusCode).toBe(201);
        expect(res1.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
        const amount = 1000;
        const res2 = yield (0, supertest_1.default)(index_1.app).post("/onramp/inr").send({ userId: user1, amount });
        expect(res2.status).toBe(200);
        expect(res2.body).toEqual({ statusType: types_1.STATUS_TYPE.SUCCESS, statusMessage: `INR ${amount} added to ${user1} user`, statusCode: 200 });
        const res3 = yield (0, supertest_1.default)(index_1.app).post(`/symbol/create/${symbol}`);
        expect(res3.statusCode).toBe(201);
        expect(res3.body).toEqual({
            statusType: types_1.STATUS_TYPE.SUCCESS,
            statusCode: 201,
            statusMessage: "Symbol created successfully"
        });
    }));
});
//# sourceMappingURL=index.test.js.map