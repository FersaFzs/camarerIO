import express from 'express'
import authRoutes from './authRoutes.js'
import tableRoutes from './tableRoutes.js'
import roundRoutes from './roundRoutes.js'
import productRoutes from './productRoutes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/tables', tableRoutes)
router.use('/rounds', roundRoutes)
router.use('/products', productRoutes)

export default router 