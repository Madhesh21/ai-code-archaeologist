import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodNumber>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    MONGODB_URI: z.ZodString;
    NEO4J_URI: z.ZodString;
    NEO4J_USER: z.ZodString;
    NEO4J_PASSWORD: z.ZodString;
    QDRANT_URL: z.ZodString;
    OPENAI_API_KEY: z.ZodString;
}, "strip", z.ZodTypeAny, {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    MONGODB_URI: string;
    NEO4J_URI: string;
    NEO4J_USER: string;
    NEO4J_PASSWORD: string;
    QDRANT_URL: string;
    OPENAI_API_KEY: string;
}, {
    MONGODB_URI: string;
    NEO4J_URI: string;
    NEO4J_USER: string;
    NEO4J_PASSWORD: string;
    QDRANT_URL: string;
    OPENAI_API_KEY: string;
    PORT?: number | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
}>;
export declare function validateEnv(env: Record<string, string | undefined>): {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    MONGODB_URI: string;
    NEO4J_URI: string;
    NEO4J_USER: string;
    NEO4J_PASSWORD: string;
    QDRANT_URL: string;
    OPENAI_API_KEY: string;
};
export type Env = z.infer<typeof envSchema>;
export {};
//# sourceMappingURL=env.d.ts.map