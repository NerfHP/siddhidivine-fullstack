import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
// These are needed for the modern ESM way to get the directory path.
import { fileURLToPath } from 'url';

// This is the ESM equivalent of __dirname, which is required for path resolution.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This line correctly finds your .env file from the project root.
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url().or(z.string().startsWith('file:')),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
  // This is the critical fix. .optional() tells Zod that this variable is allowed to be missing.
  CLIENT_ORIGIN: z.string().optional(), 
});

// Zod's .parse() will throw a detailed error if validation fails, which is perfect for debugging.
const envVars = envVarsSchema.parse(process.env);

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    url: envVars.DATABASE_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  clientOrigin: envVars.CLIENT_ORIGIN,
};

// This is the standard ES Module way to export a default object.
export default config;

