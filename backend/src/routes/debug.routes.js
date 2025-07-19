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
const auth_1 = require("../middleware/auth");
const name_anonymizer_service_1 = require("../services/name-anonymizer.service");
const router = (0, express_1.Router)();
// Debug route - only enable in development
if (process.env.NODE_ENV !== 'production') {
    router.use(auth_1.authenticate);
    // GET /api/debug/session - Check session state
    router.get('/session', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const sessionInfo = req.sessionId ? name_anonymizer_service_1.NameAnonymizerService.getSessionInfo(req.sessionId) : null;
            res.json({
                sessionId: req.sessionId,
                currentUserId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
                sessionExists: !!sessionInfo,
                sessionData: sessionInfo ? {
                    currentUserId: sessionInfo.currentUserId,
                    createdAt: sessionInfo.createdAt,
                    mappingCount: sessionInfo.nameMapping.size,
                    mappings: Object.fromEntries(sessionInfo.nameMapping)
                } : null
            });
        }
        catch (error) {
            next(error);
        }
    }));
}
exports.default = router;
