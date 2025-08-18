import type { Db } from "mongodb"
import { getDb } from "@/lib/mongodb"

/**
 * Lightweight shim so existing or legacy code can
 *   import { db } from "@/lib/db"
 * without touching the main connection logic in lib/mongodb.ts
 *
 * It exports a single Promise<Db> called `db`.
 * Callers should `await db` before using it.
 */

let cached: Promise<Db> | null = null

function init(): Promise<Db> {
  if (!cached) {
    cached = getDb()
  }
  return cached
}

/** Promise that resolves to a MongoDB Db instance */
export const db: Promise<Db> = init()
