import { Router } from 'express'
import { userPreferencesController } from '../controllers/userPreferences'

const router = Router()

// GET /api/user_preferences - Get user preferences
router.get('/', userPreferencesController.get)

// PUT /api/user_preferences - Update user preferences
router.put('/', userPreferencesController.update)

export default router 