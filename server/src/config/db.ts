import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
