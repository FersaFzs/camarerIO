import { Router } from 'express'
import { 
  getTableRounds, 
  createRound, 
  addProductsToRound, 
  markRoundAsPaid,
  markAllRoundsAsPaid,
  getTableStatuses,
  updateRoundProducts,
  confirmTableService
} from '../controllers/roundController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/table/:tableNumber', requireAuth, getTableRounds)
router.post('/', requireAuth, createRound)
router.post('/:roundId/products', requireAuth, addProductsToRound)
router.put('/:roundId/pay', requireAuth, markRoundAsPaid)
router.put('/table/:tableNumber/pay-all', requireAuth, markAllRoundsAsPaid)
router.get('/statuses', getTableStatuses)
router.put('/:roundId', requireAuth, updateRoundProducts)
router.put('/table/:tableNumber/confirm-service', requireAuth, confirmTableService)

export default router 