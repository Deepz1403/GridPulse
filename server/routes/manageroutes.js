import express from 'express';
import {
  createSubstation,
  addAttendant,
  // getAllSubstationsAndAttendants,
  assignSubstationToAttendants,
  deleteSubstation
} from '../controllers/managercontroller.js';
import { isManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isManager);

router.post('/addSubstation', createSubstation);
router.post('/addAttendant', addAttendant);
// router.get('/allInfo',getAllSubstationsAndAttendants)
router.put('/assignSubstation',assignSubstationToAttendants)
router.delete('/deleteSubstation/:name',deleteSubstation)

export default router;
