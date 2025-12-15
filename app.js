const express = require("express");
const { sequelize, Restaurant, Address, MenuItem, initDb } = require("./db");

const app = express();

app.use(express.json());


if (require.main === module) {
    initDb().catch((err) => {
        console.error("Failed to sync database", err);
    });
}

function getContentLength(req) {
    const v = req.headers["content-length"];
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function isBodyMissing(req) {
    if (req.body == null) return true;

    if (typeof req.body === "object" && !Array.isArray(req.body)) {
        const keys = Object.keys(req.body);
        if (keys.length === 0) {
            const len = getContentLength(req);
            if (len === 0 || len == null) return true;
            return false;
        }
    }

    return false;
}

function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
}

function isValidRating(r) {
    return Number.isInteger(r) && r >= 1 && r <= 5;
}

function isValidPrice(p) {
    return typeof p === "number" && Number.isFinite(p) && p > 0;
}

// ----------------------------
// POST /restaurants
// ----------------------------
app.post("/restaurants", async (req, res) => {
    if (isBodyMissing(req)) {
        return res.status(400).json({ message: "body is missing" });
    }

    const { name, rating } = req.body || {};

    if (name === undefined || rating === undefined) {
        return res.status(400).json({ message: "malformed request" });
    }

    if (!isValidRating(rating)) {
        return res.status(400).json({ message: "rating should be between 1 and 5" });
    }

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ message: "malformed request" });
    }

    await Restaurant.create({ name: name.trim(), rating });
    return res.status(201).json({ message: "created" });
});

// ----------------------------
// PUT /restaurants/:restaurantId
// ----------------------------
app.put("/restaurants/:restaurantId", async (req, res) => {
    const { name, rating } = req.body || {};

    if (name === undefined || rating === undefined) {
        return res.status(400).json({ message: "malformed request" });
    }

    if (!isValidRating(rating)) {
        return res.status(400).json({ message: "rating should be between 1 and 5" });
    }

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ message: "malformed request" });
    }

    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: "restaurant not found" });
    }

    restaurant.name = name.trim();
    restaurant.rating = rating;
    await restaurant.save();

    return res.status(200).json({ message: "updated" });
});

// ----------------------------
// DELETE /restaurants/:restaurantId
// ----------------------------
app.delete("/restaurants/:restaurantId", async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: "restaurant not found" });
    }

    await restaurant.destroy();
    return res.status(200).json({ message: "deleted" });
});

// ----------------------------
// POST /restaurants/:restaurantId/address
// ----------------------------
app.post("/restaurants/:restaurantId/address", async (req, res) => {
    if (isBodyMissing(req)) {
        return res.status(400).json({ message: "body is missing" });
    }

    const { street, city } = req.body || {};

    if (street === undefined || city === undefined) {
        return res.status(400).json({ message: "malformed request" });
    }

    if (!isNonEmptyString(street)) {
        return res.status(400).json({ message: "street should not be empty" });
    }

    if (!isNonEmptyString(city)) {
        return res.status(400).json({ message: "malformed request" });
    }

    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: "restaurant not found" });
    }

    const existing = await Address.findOne({
        where: { restaurantId: req.params.restaurantId },
    });

    if (existing) {
        existing.street = street.trim();
        existing.city = city.trim();
        await existing.save();
    } else {
        await Address.create({
            street: street.trim(),
            city: city.trim(),
            restaurantId: req.params.restaurantId,
        });
    }

    return res.status(201).json({ message: "created" });
});

// ----------------------------
// POST /restaurants/:restaurantId/menu-items
// ----------------------------
app.post("/restaurants/:restaurantId/menu-items", async (req, res) => {
    if (isBodyMissing(req)) {
        return res.status(400).json({ message: "body is missing" });
    }

    const { name, price } = req.body || {};

    if (name === undefined || price === undefined) {
        return res.status(400).json({ message: "malformed request" });
    }

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ message: "malformed request" });
    }

    if (!isValidPrice(price)) {
        return res
            .status(400)
            .json({ message: "price should be a positive number" });
    }

    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) {
        return res.status(404).json({ message: "restaurant not found" });
    }

    await MenuItem.create({
        name: name.trim(),
        price,
        restaurantId: req.params.restaurantId,
    });

    return res.status(201).json({ message: "created" });
});

// ----------------------------
// DELETE /restaurants/:restaurantId/menu-items/:menuItemId
// ----------------------------
app.delete(
    "/restaurants/:restaurantId/menu-items/:menuItemId",
    async (req, res) => {
        const item = await MenuItem.findOne({
            where: {
                id: req.params.menuItemId,
                restaurantId: req.params.restaurantId,
            },
        });

        if (!item) {
            return res.status(404).json({ message: "menu item not found" });
        }

        await item.destroy();
        return res.status(200).json({ message: "deleted" });
    },
);

// ----------------------------
// GET /restaurants (supports sortField, sortOrder)
// ----------------------------
app.get("/restaurants", async (req, res) => {
    const sort = req.query.sort || req.query.sortField;
    const direction = req.query.direction || req.query.sortOrder;

    const order = [];
    if (sort === "rating") {
        order.push([
            "rating",
            String(direction).toLowerCase() === "desc" ? "DESC" : "ASC",
        ]);
    }

    const restaurants = await Restaurant.findAll({
        include: [
            { model: Address, as: "address" },
            { model: MenuItem, as: "menuItems", separate: true, order: [["id", "ASC"]] },
        ],
        order,
        distinct: true,
    });

    return res.status(200).json(restaurants.map((r) => r.toJSON()));
});

app.use((err, req, res, next) => {
    if (err && err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "body is missing" });
    }
    if (err instanceof SyntaxError) {
        return res.status(400).json({ message: "body is missing" });
    }
    return next(err);
});

if (!process.env.JEST_WORKER_ID) {
    let closed = false;
    process.once("beforeExit", async () => {
        if (closed) return;
        closed = true;
        try {
            await sequelize.close();
        } catch (e) { }
    });
}

module.exports = app;
