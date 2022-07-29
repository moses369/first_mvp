import postgres from "postgres";
const { DATABASE_URL, NODE_ENV } = process.env;
const sql = postgres(
  DATABASE_URL || "postgres://localhost:5432/firststore",
  NODE_ENV === "production"
    ? { ssl: { rejectUnauthorized: false }, idle_timeout: 60 }
    : { idle_timeout: 60 }
);
export default sql;
