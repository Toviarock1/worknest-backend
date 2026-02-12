import { PrismaClient } from "./../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

// @ts-ignore - 'family' is a valid property in the actual pg driver, just missing in types
pg.defaults.family = 4;

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
