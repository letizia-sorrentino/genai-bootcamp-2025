import { Router } from 'express'
import { studyActivitiesController } from '../controllers/studyActivities'

const router = Router()

// GET /api/study_activities - Get all study activities
router.get('/', studyActivitiesController.getAll)

// GET /api/study_activities/:id - Get single study activity
router.get('/:id', studyActivitiesController.getById)

// GET /api/study_activities/:id/study_sessions - Get study sessions for an activity
router.get('/:id/study_sessions', studyActivitiesController.getStudySessions)

// POST /api/study_activities/:id/launch - Launch a study activity
router.post('/:id/launch', studyActivitiesController.launch)

export default router 