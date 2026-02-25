import { pool } from "../database/pool.js";
import { logger } from "./logger.js";

/**
 * Executes a query with detailed performance timing for connection and execution.
 * Inspired by the need to debug slow backend requests.
 */
export async function timedQuery(sql: string, params: any[] = []) {
  const startTotal = Date.now();
  
  // 1. Connection Acquisition Timing
  const startConnect = Date.now();
  const client = await pool.connect();
  const connectDuration = Date.now() - startConnect;
  
  try {
    // 2. Query Execution Timing
    const startQuery = Date.now();
    const result = await client.query(sql, params);
    const queryDuration = Date.now() - startQuery;
    
    const totalDuration = Date.now() - startTotal;
    
    if (totalDuration > 500) {
      logger.warn(`[DB PERF] Slow request detected:
        - Total: ${totalDuration}ms
        - Connect: ${connectDuration}ms
        - Query: ${queryDuration}ms
        - SQL: ${sql.substring(0, 100)}...`);
    }

    return result;
  } finally {
    client.release();
  }
}
