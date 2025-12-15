const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("A4 – POST /restaurants/:restaurantId/address with valid data", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    const listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    const res = await request(app)
      .post(`/restaurants/${restaurantId}/address`)
      .send({ street: "Str. Principala 1", city: "Cluj" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });
});
