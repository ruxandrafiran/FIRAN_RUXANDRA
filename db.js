const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "my.db"),
  logging: false,
});

const Restaurant = sequelize.define(
  "Restaurant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "restaurants",
  },
);

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "addresses",
  },
);

const MenuItem = sequelize.define(
  "MenuItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "menu_items",
  },
);

Restaurant.hasOne(Address, {
  as: "address",
  foreignKey: "restaurantId",
  onDelete: "CASCADE",
});
Address.belongsTo(Restaurant, {
  foreignKey: "restaurantId",
});

Restaurant.hasMany(MenuItem, {
  as: "menuItems",
  foreignKey: "restaurantId",
  onDelete: "CASCADE",
});
MenuItem.belongsTo(Restaurant, {
  foreignKey: "restaurantId",
});

async function initDb() {
  // force: true so every test starts from a clean DB
    await sequelize.sync({ force: true });


}

sequelize.afterConnect(async (connection) => {
    try {
        await connection.run("PRAGMA foreign_keys = ON");
    } catch (e) { }
});


module.exports = {
  sequelize,
  Restaurant,
  Address,
  MenuItem,
  initDb,
};
