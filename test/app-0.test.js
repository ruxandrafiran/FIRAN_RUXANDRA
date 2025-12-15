const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("R1 – POST /restaurants with missing body", async () => {
    const res = await request(app).post("/restaurants").send();

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "body is missing" });
  });
});
