import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Create drizzle instance
export const db = drizzle(sql, { schema });

// Export type for use in other files
export type Database = typeof db;
