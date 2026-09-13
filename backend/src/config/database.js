import db, { seedIfEmpty } from "../lib/db.js";
import { seed } from "../db/seed.js";
import * as logger from "../utils/logger.js";

export default async function connectDatabase() {
  await db.$connect();
  await seedIfEmpty(seed);
  const count = await db.property.count();
  logger.info(`JSON store ready — ${count} properties`);
  return db;
}
