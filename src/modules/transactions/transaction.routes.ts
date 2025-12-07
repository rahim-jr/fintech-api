import { Router } from 'express';
import * as transactionController from './transaction.controller.js'
import { protect } from '../../middleware/auth.js';

const router = Router();

//keeping /send protected
router.post('/send', protect, transactionController.sendMoney);

export default router;
