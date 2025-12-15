const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("G1 – GET /restaurants: loaded restaurants contain addresses", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    let res = await request(app).get("/restaurants");
    const restaurantId = res.body[0].id;

    await request(app)
      .post(`/restaurants/${restaurantId}/address`)
      .send({ street: "Str. Principala 1", city: "Cluj" });

    res = await request(app).get("/restaurants");

    expect(res.statusCode).toBe(200);
    const restaurant = res.body.find((r) => r.id === restaurantId);
    expect(restaurant).toBeDefined();
    expect(restaurant.address).toBeDefined();
    expect(restaurant.address.street).toBe("Str. Principala 1");
    expect(restaurant.address.city).toBe("Cluj");
  });
});
