import express from 'express';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';
const app = express();
app.use(express.json());
app.use(requestLogger);
app.use('/api/v1', apiRouter);
app.use(errorHandler);
export { app };
//# sourceMappingURL=app.js.map