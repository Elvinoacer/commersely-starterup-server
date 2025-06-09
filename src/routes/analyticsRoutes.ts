import { Router } from "express";
import { AnalyticsController } from "../controllers/analyticsController";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";

const router = Router();
const analyticsController = new AnalyticsController();

router.get(
  "/",
  authenticateJwt,
  isSuperAdmin,
  analyticsController.getAnalytics.bind(analyticsController)
);

export default router;
