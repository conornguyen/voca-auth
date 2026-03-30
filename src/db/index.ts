import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/voca-auth';

// Query client
const queryClient = postgres(dbUrl);
export const db = drizzle(queryClient, { schema });
