import pg from "pg";
export const pool = new pg.Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "hefesto",
  user: process.env.PGUSER || "hefesto",
  password: process.env.PGPASSWORD,
  max: 10,
  connectionTimeoutMillis: 5000,
});
