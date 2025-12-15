const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("D1 – DELETE non-existing menu item", async () => {
    // no restaurant, no menu item – implementation returns 404 "menu item not found"
    const res = await request(app).delete("/restaurants/999/menu-items/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "menu item not found" });
  });
});
