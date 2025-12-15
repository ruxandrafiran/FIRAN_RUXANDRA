const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("G3 – GET /restaurants can be sorted descending by rating", async () => {
    await request(app).post("/restaurants").send({ name: "R1", rating: 3 });

    await request(app).post("/restaurants").send({ name: "R2", rating: 5 });

    await request(app).post("/restaurants").send({ name: "R3", rating: 1 });

    const res = await request(app)
      .get("/restaurants")
      .query({ sortField: "rating", sortOrder: "desc" });

    expect(res.statusCode).toBe(200);
    const restaurants = res.body;

    for (let i = 0; i < restaurants.length - 1; i++) {
      expect(restaurants[i].rating).toBeGreaterThanOrEqual(
        restaurants[i + 1].rating,
      );
    }
  });
});
