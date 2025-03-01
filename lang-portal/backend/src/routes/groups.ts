import { Router } from 'express'
import { groupsController } from '../controllers/groups'

const router = Router()

// GET /api/groups - Get paginated list of groups
router.get('/', groupsController.getAll)

// GET /api/groups/:id - Get single group
router.get('/:id', groupsController.getById)

// GET /api/groups/:id/words - Get words for a group
router.get('/:id/words', groupsController.getWords)

// GET /api/groups/:id/study_sessions - Get study sessions for a group
router.get('/:id/study_sessions', groupsController.getStudySessions)

export default router 