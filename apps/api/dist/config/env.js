import { config } from 'dotenv';
import { validateEnv } from '@archaeologist/shared';
import { logger } from '../utils/logger.js';
config();
let env;
try {
    env = validateEnv(process.env);
}
catch {
    logger.fatal('Failed to validate environment variables');
    process.exit(1);
}
export { env };
//# sourceMappingURL=env.js.map