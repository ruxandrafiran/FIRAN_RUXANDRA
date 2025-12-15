const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("A3 – POST /restaurants/:restaurantId/address with empty street", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    const listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    const res = await request(app)
      .post(`/restaurants/${restaurantId}/address`)
      .send({ street: "", city: "Cluj" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "street should not be empty" });
  });
});
