// import request from "supertest";
// // import { app } from "../index";
// import { STATUS_TYPE } from "../types";
// import { query } from "express";
// describe("Basics", () => {
//     const user1 = "user-1"
//     beforeAll(async () => {
//         await request(app).post(`/reset`)
//     });
//     test("Create user", async () => {
//         const res = await request(app).post(`/user/create/${user1}`)
//         expect(res.statusCode).toBe(201)
//         expect(res.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
//     });
//     test("Get user", async () => {
//         const res = await request(app).get("/user/me").send({ userId: user1 })
//         expect(res.statusCode).toBe(200)
//         expect(res.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusCode: 200, statusMessage: "User found" });
//     });
//     test("Onramp inr balance", async () => {
//         const res = await request(app).post("/onramp/inr").send({ userId: user1, amount: 10000 })
//         expect(res.status).toBe(200)
//         expect(res.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusMessage: `INR 10000 added to ${user1} user`, statusCode: 200 })
//     })
//     test("Check balance", async () => {
//         const res = await request(app).get("/balance/inr/user-1")
//         expect(res.status).toBe(200)
//         expect(res.body).toEqual({
//             statusCode: 200,
//             statusMessage: "",
//             statusType: STATUS_TYPE.SUCCESS,
//             data: { balance: 10000, locked: 0 }
//         })
//     })
//     test("Create symbol", async () => {
//         const symbol = "TESLA"
//         const res = await request(app).post(`/symbol/create/${symbol}`)
//         expect(res.statusCode).toBe(201)
//         expect(res.body).toEqual({
//             statusType: STATUS_TYPE.SUCCESS,
//             statusCode: 201,
//             statusMessage: "Symbol created successfully"
//         })
//     })
//     test("Check orderbook", async () => {
//         const res = await request(app).get("/orderbook")
//         expect(res.statusCode).toBe(200)
//         expect(res.body).toStrictEqual({
//             statusMessage: "",
//             statusType: STATUS_TYPE.SUCCESS,
//             statusCode: 200,
//             data: {
//                 TESLA: {
//                     yes: {},
//                     no: {},
//                 }
//             }
//         })
//     })
// });
// describe("Buying", () => {
//     const user1 = "user-1"
//     const symbol = "ETH";
//     beforeAll(async () => {
//         await request(app).post("/reset")
//     })
//     test("Create user -> On ramp inr balance -> create symbol", async () => {
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
//     test("place buy order for 'yes' type", async () => {
//         await request(app).post(`/order/buy`).send({
//             userId: user1,
//             stockSymbol: symbol,
//             quantity: 10,
//             price: 6,
//             stockType: "yes",
//         });
//         const res2 = await request(app).get("/orderbook")
//         expect(res2.statusCode).toBe(200)
//         expect(res2.body).toStrictEqual({
//             statusMessage: "",
//             statusType: STATUS_TYPE.SUCCESS,
//             statusCode: 200,
//             data: {
//                 [symbol]: {
//                     yes: {},
//                     no: {
//                         4: {
//                             total: 10,
//                             orders: {
//                                 [user1]: {
//                                     type: "system_generated",
//                                     quantity: 10
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         })
//     })
// })
// describe("Selling", () => {
//     const user1 = "user-1"
//     const symbol = "ETH";
//     beforeAll(async () => {
//         await request(app).post("/reset")
//     })
//     test("Create user -> On ramp inr balance -> create symbol", async () => {
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
//     test("mint", async () => {
//         const res = await request(app).post("/trade/mint").send({
//             userId: user1,
//             stockSymbol: symbol,
//             quantity: 10,
//         })
//         expect(res.statusCode).toBe(200)
//         expect(res.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, data: { yes: { quantity: 10, locked: 0 }, no: { quantity: 10, locked: 0 } }, statusCode: 200, statusMessage: "Minted Successfully" })
//     })
//     test("place sell order for 'yes' type", async () => {
//         await request(app).post(`/order/sell`).send({
//             userId: user1,
//             stockSymbol: symbol,
//             quantity: 5,
//             price: 1,
//             stockType: "yes",
//         });
//         const res2 = await request(app).get("/orderbook")
//         expect(res2.statusCode).toBe(200)
//         expect(res2.body).toStrictEqual({
//             statusMessage: "",
//             statusType: STATUS_TYPE.SUCCESS,
//             statusCode: 200,
//             data: {
//                 [symbol]: {
//                     yes: {
//                         1: {
//                             total: 5,
//                             orders: {
//                                 [user1]: {
//                                     type: "sell",
//                                     quantity: 5
//                                 }
//                             }
//                         }
//                     },
//                     no: {},
//                 }
//             }
//         })
//     })
// })
// // const basic = ({ user1, symbol }: { user1: string, symbol: string }) => {
// //     return test("Create user -> On ramp inr balance -> create symbol", async () => {
// //         const res1 = await request(app).post(`/user/create/${user1}`)
// //         expect(res1.statusCode).toBe(201)
// //         expect(res1.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
// //         const amount = 1000000
// //         const res2 = await request(app).post("/onramp/inr").send({ userId: user1, amount })
// //         expect(res2.status).toBe(200)
// //         expect(res2.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusMessage: `INR ${amount} added to ${user1} user`, statusCode: 200 })
// //         const res3 = await request(app).post(`/symbol/create/${symbol}`)
// //         expect(res3.statusCode).toBe(201)
// //         expect(res3.body).toEqual({
// //             statusType: STATUS_TYPE.SUCCESS,
// //             statusCode: 201,
// //             statusMessage: "Symbol created successfully"
// //         })
// //     })
// // }
// describe("Matching", () => {
//     const user1 = "user-1"
//     const symbol = "DOGE"
//     beforeAll(async () => {
//         await request(app).post("/reset")
//     })
//     test("Create user -> On ramp inr balance -> create symbol", async () => {
//         const res1 = await request(app).post(`/user/create/${user1}`)
//         expect(res1.statusCode).toBe(201)
//         expect(res1.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
//         const amount = 1000
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
// })
//# sourceMappingURL=index.test.js.map