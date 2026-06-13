import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pgclient = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

export default pgclient;