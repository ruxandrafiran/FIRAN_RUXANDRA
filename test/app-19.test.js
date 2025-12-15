const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("D2 – DELETE existing menu item", async () => {
    await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    let listRes = await request(app).get("/restaurants");
    const restaurantId = listRes.body[0].id;

    await request(app)
      .post(`/restaurants/${restaurantId}/menu-items`)
      .send({ name: "Supa de legume", price: 25.5 });

    listRes = await request(app).get("/restaurants");
    const restaurant = listRes.body.find((r) => r.id === restaurantId);
    const menuItemId = restaurant.menuItems[0].id;

    const res = await request(app).delete(
      `/restaurants/${restaurantId}/menu-items/${menuItemId}`,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "deleted" });

    const afterRes = await request(app).get("/restaurants");
    const restaurantAfter = afterRes.body.find((r) => r.id === restaurantId);
    const item = restaurantAfter.menuItems.find((m) => m.id === menuItemId);
    expect(item).toBeUndefined();
  });
});
