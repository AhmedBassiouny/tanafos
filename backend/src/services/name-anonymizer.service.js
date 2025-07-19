"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NameAnonymizerService = void 0;
const islamic_names_1 = require("../data/islamic-names");
class NameAnonymizerService {
    static generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    static cleanupExpiredSessions() {
        const now = new Date();
        for (const [sessionId, mapping] of this.sessionMappings.entries()) {
            if (now.getTime() - mapping.createdAt.getTime() > this.SESSION_TIMEOUT) {
                this.sessionMappings.delete(sessionId);
            }
        }
    }
    static createSessionMapping(sessionId, currentUserId, allUserIds) {
        // Clean up expired sessions first
        this.cleanupExpiredSessions();
        // Filter out the current user from the list
        const otherUserIds = allUserIds.filter(id => id !== currentUserId);
        // Get a shuffled list of Islamic names
        const shuffledNames = (0, islamic_names_1.shuffleArray)([...islamic_names_1.ISLAMIC_NAMES]);
        // Create mapping for other users
        const nameMapping = new Map();
        otherUserIds.forEach((userId, index) => {
            // Use modulo to cycle through names if we have more users than names
            const nameIndex = index % shuffledNames.length;
            nameMapping.set(userId, shuffledNames[nameIndex]);
        });
        // Store the session mapping
        this.sessionMappings.set(sessionId, {
            sessionId,
            currentUserId,
            nameMapping,
            createdAt: new Date()
        });
    }
    static getAnonymizedName(sessionId, userId, originalUsername) {
        const sessionMapping = this.sessionMappings.get(sessionId);
        if (!sessionMapping) {
            // If no session mapping exists, return original name
            return originalUsername;
        }
        // If this is the current user, return their real name
        if (userId === sessionMapping.currentUserId) {
            return originalUsername;
        }
        // Return the mapped name or original if not found
        return sessionMapping.nameMapping.get(userId) || originalUsername;
    }
    static anonymizeUserList(sessionId, currentUserId, userList) {
        let sessionMapping = this.sessionMappings.get(sessionId);
        // Create session mapping if needed
        if (!sessionMapping) {
            const allUserIds = userList.map(user => user.userId);
            this.createSessionMapping(sessionId, currentUserId, allUserIds);
            sessionMapping = this.sessionMappings.get(sessionId);
        }
        // For any new users not in the existing mapping, add them
        const newUserIds = userList
            .map(user => user.userId)
            .filter(userId => userId !== currentUserId && !sessionMapping.nameMapping.has(userId));
        if (newUserIds.length > 0) {
            // Get unused names for new users
            const usedNames = new Set(Array.from(sessionMapping.nameMapping.values()));
            const availableNames = islamic_names_1.ISLAMIC_NAMES.filter(name => !usedNames.has(name));
            const shuffledAvailable = (0, islamic_names_1.shuffleArray)([...availableNames]);
            newUserIds.forEach((userId, index) => {
                const nameIndex = index % shuffledAvailable.length;
                sessionMapping.nameMapping.set(userId, shuffledAvailable[nameIndex]);
            });
        }
        // Apply anonymization to the list
        return userList.map(user => (Object.assign(Object.assign({}, user), { username: this.getAnonymizedName(sessionId, user.userId, user.username) })));
    }
    static getSessionInfo(sessionId) {
        this.cleanupExpiredSessions();
        return this.sessionMappings.get(sessionId);
    }
    static clearSession(sessionId) {
        this.sessionMappings.delete(sessionId);
    }
    static clearAllSessions() {
        this.sessionMappings.clear();
    }
}
exports.NameAnonymizerService = NameAnonymizerService;
NameAnonymizerService.sessionMappings = new Map();
NameAnonymizerService.SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
