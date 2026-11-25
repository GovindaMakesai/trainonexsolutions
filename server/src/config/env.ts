import dotenv from 'dotenv';

dotenv.config();

function stringEnv(name: string, fallback = ''): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

export const env = {
  nodeEnv: stringEnv('NODE_ENV', 'development'),
  port: Number(stringEnv('PORT', '5000')) || 5000,
  mongoUri: stringEnv('MONGODB_URI'),
  jwtSecret: stringEnv('JWT_SECRET'),
  jwtExpiresIn: stringEnv('JWT_EXPIRES_IN', '7d'),
  clientUrl: stringEnv('CLIENT_URL', 'http://localhost:5173'),
  serverUrl: stringEnv('SERVER_URL'),
  cloudinary: {
    cloudName: stringEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: stringEnv('CLOUDINARY_API_KEY'),
    apiSecret: stringEnv('CLOUDINARY_API_SECRET'),
  },
  admin: {
    name: stringEnv('ADMIN_NAME', 'Trainonex Admin'),
    email: stringEnv('ADMIN_EMAIL'),
    password: stringEnv('ADMIN_PASSWORD'),
  },
};

export function assertEnv(): void {
  const missing: string[] = [];
  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (!env.jwtSecret) missing.push('JWT_SECRET');
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Copy server/.env.example to server/.env.`);
  }
  if (env.jwtSecret.length < 32) {
    console.warn('JWT_SECRET should be at least 32 characters.');
  }
}

export function clientOrigins(): string[] {
  return env.clientUrl
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function publicServerUrl(): string {
  if (env.serverUrl) return env.serverUrl.replace(/\/$/, '');
  return `http://localhost:${env.port}`;
}
