import express from "express";
import { getAssignedSubstation,getAllSubstationData,getVoltageCurrentByDate} from "../controllers/attendantcontroller.js";
import {isAuthenticated} from "../middleware/authMiddleware.js"

const router = express.Router();

router.use(isAuthenticated)
router.get("/assigned-substation",getAssignedSubstation);
router.get("/SubstationData",getAllSubstationData);
router.get("/substationDashboard",getVoltageCurrentByDate);
export default router;
