import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();
const { DATABASE_URL, NODE_ENV } = process.env;
const sql = postgres(
  DATABASE_URL,
  NODE_ENV === "production"
    ? { ssl: { rejectUnauthorized: false }, idle_timeout: 60 }
    : { idle_timeout: 60 }
);
export default sql;
