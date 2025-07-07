import express from 'express'
import authRoutes from './authRoutes.js'
import tableRoutes from './tableRoutes.js'
import roundRoutes from './roundRoutes.js'
import productRoutes from './productRoutes.js'
import liquorRoutes from './liquorRoutes.js'
import softDrinkRoutes from './softDrinkRoutes.js'
import accountingRoutes from './accountingRoutes.js'
import ticketRoutes from './ticketRoutes.js'
import iceCreamRoutes from './iceCreamRoutes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/tables', tableRoutes)
router.use('/rounds', roundRoutes)
router.use('/products', productRoutes)
router.use('/licores', liquorRoutes)
router.use('/refrescos', softDrinkRoutes)
router.use('/accounting', accountingRoutes)
router.use('/tickets', ticketRoutes)
router.use('/icecreams', iceCreamRoutes)

export default router 