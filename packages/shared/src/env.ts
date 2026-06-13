import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  MONGODB_URI: z.string(),
  NEO4J_URI: z.string(),
  NEO4J_USER: z.string(),
  NEO4J_PASSWORD: z.string(),

  QDRANT_URL: z.string(),

  UPLOAD_DIR: z.string().default('./uploads'),

  OPENAI_API_KEY: z.string(),
});

export function validateEnv(env: Record<string, string | undefined>) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    console.error('Invalid environment variables:');
    const fields = result.error.flatten().fieldErrors;
    for (const [key, errors] of Object.entries(fields)) {
      console.error(`  ${key}: ${errors?.join(', ')}`);
    }
    process.exit(1);
  }
  return result.data;
}

export type Env = z.infer<typeof envSchema>;
