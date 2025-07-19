"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, // You can be more specific with your custom error type
req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message
        });
        return;
    }
    // Prisma errors (example check)
    if (err.message.includes('Unique constraint')) {
        res.status(400).json({
            error: 'This record already exists.'
        });
        return;
    }
    // Default to a 500 server error for any other unknown errors
    console.error('UNHANDLED ERROR:', err); // It's good practice to log the full error
    res.status(500).json({
        error: 'Something went wrong!'
    });
};
exports.errorHandler = errorHandler;
