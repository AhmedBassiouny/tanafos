import { ISLAMIC_NAMES, shuffleArray } from '../data/islamic-names'

interface SessionNameMapping {
  sessionId: string
  currentUserId: number
  nameMapping: Map<number, string>
  createdAt: Date
}

export class NameAnonymizerService {
  private static sessionMappings = new Map<string, SessionNameMapping>()
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

  static generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  static cleanupExpiredSessions(): void {
    const now = new Date()
    for (const [sessionId, mapping] of this.sessionMappings.entries()) {
      if (now.getTime() - mapping.createdAt.getTime() > this.SESSION_TIMEOUT) {
        this.sessionMappings.delete(sessionId)
      }
    }
  }

  static createSessionMapping(sessionId: string, currentUserId: number, allUserIds: number[]): void {
    // Clean up expired sessions first
    this.cleanupExpiredSessions()

    // Filter out the current user from the list
    const otherUserIds = allUserIds.filter(id => id !== currentUserId)
    
    // Get a shuffled list of Islamic names
    const shuffledNames = shuffleArray([...ISLAMIC_NAMES])
    
    // Create mapping for other users
    const nameMapping = new Map<number, string>()
    
    otherUserIds.forEach((userId, index) => {
      // Use modulo to cycle through names if we have more users than names
      const nameIndex = index % shuffledNames.length
      nameMapping.set(userId, shuffledNames[nameIndex])
    })

    // Store the session mapping
    this.sessionMappings.set(sessionId, {
      sessionId,
      currentUserId,
      nameMapping,
      createdAt: new Date()
    })
  }

  static getAnonymizedName(sessionId: string, userId: number, originalUsername: string): string {
    const sessionMapping = this.sessionMappings.get(sessionId)
    
    if (!sessionMapping) {
      // If no session mapping exists, return original name
      return originalUsername
    }

    // If this is the current user, return their real name
    if (userId === sessionMapping.currentUserId) {
      return originalUsername
    }

    // Return the mapped name or original if not found
    return sessionMapping.nameMapping.get(userId) || originalUsername
  }

  static anonymizeUserList<T extends { userId: number; username: string }>(
    sessionId: string,
    currentUserId: number,
    userList: T[]
  ): T[] {
    let sessionMapping = this.sessionMappings.get(sessionId)
    
    // Create session mapping if needed
    if (!sessionMapping) {
      const allUserIds = userList.map(user => user.userId)
      this.createSessionMapping(sessionId, currentUserId, allUserIds)
      sessionMapping = this.sessionMappings.get(sessionId)!
    }

    // For any new users not in the existing mapping, add them
    const newUserIds = userList
      .map(user => user.userId)
      .filter(userId => userId !== currentUserId && !sessionMapping!.nameMapping.has(userId))
    
    if (newUserIds.length > 0) {
      // Get unused names for new users
      const usedNames = new Set(Array.from(sessionMapping.nameMapping.values()))
      const availableNames = ISLAMIC_NAMES.filter(name => !usedNames.has(name))
      const shuffledAvailable = shuffleArray([...availableNames])
      
      newUserIds.forEach((userId, index) => {
        const nameIndex = index % shuffledAvailable.length
        sessionMapping!.nameMapping.set(userId, shuffledAvailable[nameIndex])
      })
    }

    // Apply anonymization to the list
    return userList.map(user => ({
      ...user,
      username: this.getAnonymizedName(sessionId, user.userId, user.username)
    }))
  }

  static getSessionInfo(sessionId: string): SessionNameMapping | undefined {
    this.cleanupExpiredSessions()
    return this.sessionMappings.get(sessionId)
  }

  static clearSession(sessionId: string): void {
    this.sessionMappings.delete(sessionId)
  }

  static clearAllSessions(): void {
    this.sessionMappings.clear()
  }
}