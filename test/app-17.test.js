const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("U3 – PUT /restaurants/:restaurantId with valid data", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    let listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    const res = await request(app)
      .put(`/restaurants/${restaurantId}`)
      .send({ name: "La Bunica Renovata", rating: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "updated" });

    listRes = await request(app).get("/restaurants");
    const restaurant = listRes.body.find((r) => r.id === restaurantId);
    expect(restaurant).toBeDefined();
    expect(restaurant.name).toBe("La Bunica Renovata");
    expect(restaurant.rating).toBe(5);
  });
});
