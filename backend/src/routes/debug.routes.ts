import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth'
import { NameAnonymizerService } from '../services/name-anonymizer.service'

const router = Router()

// Debug route - only enable in development
if (process.env.NODE_ENV !== 'production') {
  router.use(authenticate)
  
  // GET /api/debug/session - Check session state
  router.get('/session', async (req: Request & { user?: any, sessionId?: string }, res: Response, next: NextFunction) => {
    try {
      const sessionInfo = req.sessionId ? NameAnonymizerService.getSessionInfo(req.sessionId) : null
      
      res.json({
        sessionId: req.sessionId,
        currentUserId: req.user?.userId,
        sessionExists: !!sessionInfo,
        sessionData: sessionInfo ? {
          currentUserId: sessionInfo.currentUserId,
          createdAt: sessionInfo.createdAt,
          mappingCount: sessionInfo.nameMapping.size,
          mappings: Object.fromEntries(sessionInfo.nameMapping)
        } : null
      })
    } catch (error) {
      next(error)
    }
  })
}

export default router