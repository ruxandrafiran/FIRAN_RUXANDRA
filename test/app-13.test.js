const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("G2 – GET /restaurants: loaded restaurants contain menu-items", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    let res = await request(app).get("/restaurants");
    const restaurantId = res.body[0].id;

    await request(app)
      .post(`/restaurants/${restaurantId}/menu-items`)
      .send({ name: "Supa de legume", price: 25.5 });

    res = await request(app).get("/restaurants");

    expect(res.statusCode).toBe(200);
    const restaurant = res.body.find((r) => r.id === restaurantId);
    expect(restaurant).toBeDefined();
    expect(Array.isArray(restaurant.menuItems)).toBe(true);
    expect(restaurant.menuItems.length).toBe(1);
    expect(restaurant.menuItems[0].name).toBe("Supa de legume");
    expect(restaurant.menuItems[0].price).toBe(25.5);
  });
});
