const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("M4 – POST /restaurants/:restaurantId/menu-items with valid data", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    const listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    const res = await request(app)
      .post(`/restaurants/${restaurantId}/menu-items`)
      .send({ name: "Supa de legume", price: 25.5 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "created" });

    const afterRes = await request(app).get("/restaurants");
    const restaurant = afterRes.body.find((r) => r.id === restaurantId);
    expect(restaurant).toBeDefined();
    expect(Array.isArray(restaurant.menuItems)).toBe(true);
    const item = restaurant.menuItems.find((m) => m.name === "Supa de legume");
    expect(item).toBeDefined();
  });
});
