import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
export function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError && err.isOperational) {
        logger.warn({ code: err.code, message: err.message }, 'Operational error');
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
        });
        return;
    }
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}
//# sourceMappingURL=errorHandler.js.map