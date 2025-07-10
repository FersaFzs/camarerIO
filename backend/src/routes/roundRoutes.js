import { Router } from 'express'
import { 
  getTableRounds, 
  createRound, 
  addProductsToRound, 
  markRoundAsPaid,
  markAllRoundsAsPaid,
  getTableStatuses,
  updateRoundProducts,
  confirmTableService,
  cleanTableRounds,
  moveTableRounds,
  getAllActiveRounds,
  markRoundAsPrepared
} from '../controllers/roundController.js'

const router = Router()

router.get('/table/:tableNumber', getTableRounds)
router.post('/', createRound)
router.post('/:roundId/products', addProductsToRound)
router.put('/:roundId/pay', markRoundAsPaid)
router.put('/:roundId/prepared', markRoundAsPrepared)
router.put('/table/:tableNumber/pay-all', markAllRoundsAsPaid)
router.get('/statuses', getTableStatuses)
router.put('/:roundId', updateRoundProducts)
router.put('/table/:tableNumber/confirm-service', confirmTableService)
router.delete('/table/:tableNumber/clean', cleanTableRounds)
router.post('/table/:fromTableNumber/move', moveTableRounds)
router.get('/active', getAllActiveRounds)

export default router 