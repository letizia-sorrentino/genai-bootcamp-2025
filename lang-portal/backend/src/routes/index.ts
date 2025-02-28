import { Router } from 'express'
import wordsRouter from './words'
import groupsRouter from './groups'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Mount routes
router.use('/words', wordsRouter)
router.use('/groups', groupsRouter)

export default router 