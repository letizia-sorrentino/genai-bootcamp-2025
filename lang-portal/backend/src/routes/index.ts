import { Router } from 'express'
import wordsRouter from './words'
import groupsRouter from './groups'
import dashboardRouter from './dashboard'
import studyActivitiesRouter from './studyActivities'
import studySessionsRouter from './studySessions'
import userPreferencesRouter from './userPreferences'
import systemRouter from './system'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Mount routes
router.use('/words', wordsRouter)
router.use('/groups', groupsRouter)
router.use('/dashboard', dashboardRouter)
router.use('/study_activities', studyActivitiesRouter)
router.use('/study_sessions', studySessionsRouter)
router.use('/user_preferences', userPreferencesRouter)

// System management endpoints
router.use('/', systemRouter)

export default router 