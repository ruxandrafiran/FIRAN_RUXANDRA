const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("U2 – PUT /restaurants/:restaurantId with invalid rating", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    const listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    const res = await request(app)
      .put(`/restaurants/${restaurantId}`)
      .send({ name: "Nou Nume", rating: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "rating should be between 1 and 5" });
  });
});
