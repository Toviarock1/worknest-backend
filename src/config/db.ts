import { PrismaClient } from "./../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: env.DIRECT_URL,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
