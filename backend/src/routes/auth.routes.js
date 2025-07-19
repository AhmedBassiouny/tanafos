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
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
// POST /api/auth/signup
router.post('/signup', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const validatedData = validation_1.Validator.validateSignup(req.body);
        // Create user
        const result = yield auth_service_1.AuthService.signup(validatedData);
        res.status(201).json({
            message: 'User created successfully',
            user: result.user,
            token: result.token
        });
    }
    catch (error) {
        next(error);
    }
}));
// POST /api/auth/login
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const validatedData = validation_1.Validator.validateLogin(req.body);
        // Login user
        const result = yield auth_service_1.AuthService.login(validatedData);
        res.json({
            message: 'Login successful',
            user: result.user,
            token: result.token
        });
    }
    catch (error) {
        next(error);
    }
}));
// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: 'Logout successful' });
});
exports.default = router;
