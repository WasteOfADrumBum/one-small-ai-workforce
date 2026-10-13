import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://localhost:5432/onesmall"),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16).default("change-me-in-production"),
  DEMO_AUTH_USERNAME: z.string().default("demo"),
  DEMO_AUTH_PASSWORD: z.string().default("demo-password"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  DEMO_AUTH_USERNAME: process.env.DEMO_AUTH_USERNAME,
  DEMO_AUTH_PASSWORD: process.env.DEMO_AUTH_PASSWORD,
});
