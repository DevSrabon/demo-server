const createConnection = () => {
  const knex = require("knex")({
    client: "mysql2",
    connection: {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "12345",
      database: "basic",
    },
    pool: { min: 0, max: 7 },
  });
  console.log("Database connected");

  return knex;
};

export const db = createConnection();
