import request from "supertest";
import { app } from "../index";
import { STATUS_TYPE } from "../types";


describe("1", () => {
    const user1 = "user-1"

    beforeEach(async () => {
        await request(app).post(`/reset`)
    });

    test("Create user", async () => {
        const res = await request(app).post(`/user/create/${user1}`)
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusCode: 201, statusMessage: `User ${user1} created successfully` });
    });

    test("Get user", async () => {
        const res = await request(app).get("/user/me").send({ userId: user1 })
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusCode: 200, statusMessage: "User found" });
    });

    test("Onramp inr balance", async () => {
        const res = await request(app).post("/onramp/inr").send({ userId: user1, amount: 10000 })
        expect(res.status).toBe(200)
        expect(res.body).toEqual({ statusType: STATUS_TYPE.SUCCESS, statusMessage: `INR 10000 added to ${user1} user`, statusCode: 200 })
    })

    test("Check balance", async () => {
        const res = await request(app).get("/balance/inr/user-1")
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            statusCode: 200,
            statusMessage: "",
            statusType: STATUS_TYPE.SUCCESS,
            data: { balance: 10000, locked: 0 }
        })
    })

    test("Create symbol", async () => {
        const symbol = "TESLA"
        const res = await request(app).post(`/symbol/create/${symbol}`)
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            statusType: STATUS_TYPE.SUCCESS,
            statusCode: 201,
            statusMessage: "Symbol created successfully"
        })
    })

    test("Check orderbook", async () => {
        const res = await request(app).get("/orderbook")
        expect(res.statusCode).toBe(200)
        expect(res.body).toStrictEqual({
            statusMessage: "",
            statusType: STATUS_TYPE.SUCCESS,
            statusCode: 200,
            data: {
                TESLA: {
                    yes: {},
                    no: {},
                }
            }
        })
    })
}); 