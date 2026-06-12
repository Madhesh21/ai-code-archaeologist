import express from 'express';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
app.use(express.json());
app.use(requestLogger);
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: { status: 'healthy' },
    });
});
app.get('/ready', (_req, res) => {
    res.json({
        success: true,
        data: {
            mongo: 'not_connected',
            neo4j: 'not_connected',
            qdrant: 'not_connected',
        },
    });
});
app.use(errorHandler);
export { app };
//# sourceMappingURL=app.js.map