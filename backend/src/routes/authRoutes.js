import express from 'express'
import { login, register, getUsers } from '../controllers/authController.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', requireAuth, requireAdmin, register)
router.get('/users', requireAuth, requireAdmin, getUsers)

export default router 