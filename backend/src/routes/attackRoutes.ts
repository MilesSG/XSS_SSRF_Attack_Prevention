import { Router } from 'express';
import { simulateXSSAttack, getXSSAttackHistory } from '../controllers/xssController';
import { simulateSSRFAttack, getSSRFAttackHistory } from '../controllers/ssrfController';
import { simulateCombinedAttack, getCombinedAttackHistory } from '../controllers/combinedController';

const router = Router();

// XSS attack routes
router.post('/xss/simulate', simulateXSSAttack);
router.get('/xss/history', getXSSAttackHistory);

// SSRF attack routes
router.post('/ssrf/simulate', simulateSSRFAttack);
router.get('/ssrf/history', getSSRFAttackHistory);

// Combined attack routes
router.post('/combined/simulate', simulateCombinedAttack);
router.get('/combined/history', getCombinedAttackHistory);

export default router; 