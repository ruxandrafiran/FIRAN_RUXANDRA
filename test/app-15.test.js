const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("U1 – PUT /restaurants/:restaurantId with malformed body", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    const listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    const res = await request(app)
      .put(`/restaurants/${restaurantId}`)
      .send({ name: "Nou Nume Fara Rating" }); // missing rating

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "malformed request" });
  });
});
