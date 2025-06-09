import express from "express";
import {
  getCashOnDeliverySetting,
  updateCashOnDeliverySetting,
} from "../controllers/adminsettingsController";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticateJwt);

router.get("/cash-on-delivery", getCashOnDeliverySetting);
router.put("/cash-on-delivery", isSuperAdmin, updateCashOnDeliverySetting);

export default router;
