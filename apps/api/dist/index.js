import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API server started');
});
function shutdown() {
    logger.info('Shutting down server');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
//# sourceMappingURL=index.js.map