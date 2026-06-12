import { logger } from '../utils/logger.js';
export function requestLogger(req, res, next) {
    const start = Date.now();
    const { method, url } = req;
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const logData = { method, url, statusCode, duration: `${duration}ms` };
        if (statusCode >= 500) {
            logger.error(logData, 'request completed');
        }
        else if (statusCode >= 400) {
            logger.warn(logData, 'request completed');
        }
        else {
            logger.info(logData, 'request completed');
        }
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map