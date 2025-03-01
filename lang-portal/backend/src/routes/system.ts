import { Router } from 'express'
import { systemController } from '../controllers/system'

const router = Router()

// POST /api/reset_history - Reset study history
router.post('/reset_history', systemController.resetHistory)

// POST /api/full_reset - Perform a full system reset
router.post('/full_reset', systemController.fullReset)

export default router 