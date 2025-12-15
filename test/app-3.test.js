const request = require("supertest");
const app = require("../app");
const { initDb } = require("../db");

beforeEach(async () => {
  // initDb should internally do sequelize.sync({ force: true })
  await initDb();
});

describe("Restaurants API", () => {
  test("R4 – POST /restaurants with valid data creates restaurant", async () => {
    const res = await request(app)
      .post("/restaurants")
      .send({ name: "La Bunica", rating: 4 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "created" });

    const listRes = await request(app).get("/restaurants");
    expect(listRes.statusCode).toBe(200);
    const created = listRes.body.find(
      (r) => r.name === "La Bunica" && r.rating === 4,
    );
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
  });
});
