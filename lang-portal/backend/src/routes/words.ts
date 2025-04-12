import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { wordsController } from '../controllers/words'

const router = Router()

// GET /api/words - Get paginated list of words
router.get('/', wordsController.getAll)

// GET /api/words/:id - Get single word
router.get('/:id', wordsController.getById)

router.post('/:id/stats', wordsController.updateStats)

export default router 