const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("R2 – POST /restaurants with malformed body (missing properties)", async () => {
    const res = await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica" }); // missing rating

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "malformed request" });
  });
});
