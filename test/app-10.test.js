const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("M3 – POST /restaurants/:restaurantId/menu-items with negative price", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    const listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    const res = await request(app)
      .post(`/restaurants/${restaurantId}/menu-items`)
      .send({ name: "Supa de legume", price: -10 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "price should be a positive number" });
  });
});
