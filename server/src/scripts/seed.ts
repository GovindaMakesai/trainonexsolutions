import { connectDb, disconnectDb } from '../config/db';
import { assertEnv } from '../config/env';
import { ensureBaseline, resetAdminPassword } from '../services/baseline';

async function seed() {
  assertEnv();
  await connectDb();
  await ensureBaseline();
  if (process.argv.includes('--reset-password')) {
    await resetAdminPassword();
  }
  await disconnectDb();
}

seed().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await disconnectDb().catch(() => undefined);
  process.exit(1);
});
