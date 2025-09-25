import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(), // Simplified for Supabase pooler URL
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
  CLIENT_ORIGIN: z.string().optional(),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  
  // --- ADDED: WhatsApp Notification Credentials ---
  WHATSAPP_PHONE_NUMBER: z.string().min(1, 'Your phone number for WhatsApp is required'),
  WHATSAPP_API_KEY: z.string().min(1, 'CallMeBot API key is required'),
});

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
  resendApiKey: envVars.RESEND_API_KEY,
  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
  },
  clerkSecretKey: envVars.CLERK_SECRET_KEY,
  
  // --- ADDED: Make WhatsApp credentials available to the app ---
  whatsapp: {
    phoneNumber: envVars.WHATSAPP_PHONE_NUMBER,
    apiKey: envVars.WHATSAPP_API_KEY,
  },
};

export default config;

