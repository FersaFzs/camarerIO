import { Router } from 'express'
import { 
  getTableRounds, 
  createRound, 
  addProductsToRound, 
  markRoundAsPaid,
  markAllRoundsAsPaid,
  getTableStatuses,
  updateRoundProducts
} from '../controllers/roundController.js'

const router = Router()

router.get('/table/:tableNumber', getTableRounds)
router.post('/', createRound)
router.post('/:roundId/products', addProductsToRound)
router.put('/:roundId/pay', markRoundAsPaid)
router.put('/table/:tableNumber/pay-all', markAllRoundsAsPaid)
router.get('/statuses', getTableStatuses)
router.put('/:roundId', updateRoundProducts)

export default router 