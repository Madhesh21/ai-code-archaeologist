export class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(statusCode, code, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, 'RESOURCE_NOT_FOUND', message);
    }
}
export class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(400, 'VALIDATION_ERROR', message);
    }
}
export class InternalError extends AppError {
    constructor(message = 'Internal server error') {
        super(500, 'INTERNAL_SERVER_ERROR', message, false);
    }
}
//# sourceMappingURL=errors.js.map