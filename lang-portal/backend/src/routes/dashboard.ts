import { Router } from 'express'
import { dashboardController } from '../controllers/dashboard'

const router = Router()

// GET /api/dashboard/last_study_session - Get last study session
router.get('/last_study_session', dashboardController.getLastStudySession)

// GET /api/dashboard/study_progress - Get study progress
router.get('/study_progress', dashboardController.getStudyProgress)

// GET /api/dashboard/quick_stats - Get quick stats
router.get('/quick_stats', dashboardController.getQuickStats)

export default router 