import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schemas.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: process.env.POSTGRES_USER || "myuser",
    password: process.env.POSTGRES_PASSWORD || "mypassword",
    database: process.env.POSTGRES_DB || "mydatabase",
  },
});
