"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_service_1 = require("../services/auth.service");
const name_anonymizer_service_1 = require("../services/name-anonymizer.service");
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new errorHandler_1.AppError('Authentication token is required', 401));
        }
        // Extract token
        const token = authHeader.split(' ')[1];
        // Verify token
        const payload = auth_service_1.AuthService.verifyToken(token);
        // Add user info to request
        req.user = payload;
        // Handle session ID for name anonymization
        let sessionId = req.headers['x-session-id'];
        if (!sessionId) {
            sessionId = name_anonymizer_service_1.NameAnonymizerService.generateSessionId();
            res.setHeader('x-session-id', sessionId);
        }
        req.sessionId = sessionId;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.name === 'JsonWebTokenError') {
            next(new errorHandler_1.AppError('Invalid token', 401));
            return;
        }
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            next(new errorHandler_1.AppError('Token expired', 401));
            return;
        }
        next(error);
    }
});
exports.authenticate = authenticate;
