import { Router } from 'express'
import { studySessionsController } from '../controllers/studySessions'

const router = Router()

// GET /api/study_sessions - Get all study sessions
router.get('/', studySessionsController.getAll)

// GET /api/study_sessions/:id - Get single study session
router.get('/:id', studySessionsController.getById)

// GET /api/study_sessions/:id/words - Get words for a study session
router.get('/:id/words', studySessionsController.getWords)

// POST /api/study_sessions/:id/words/:word_id/review - Record a word review
router.post('/:id/words/:word_id/review', studySessionsController.recordReview)

export default router 