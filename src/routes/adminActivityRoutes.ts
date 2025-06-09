import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { getRecentAdminActivities } from "../controllers/adminActivityController";
import { sendNotifications } from "../controllers/notification-sender.controller";

const router = express.Router();

router.get(
  "/recent-activities",
  authenticateJwt,
  isSuperAdmin,
  getRecentAdminActivities
);

router.post(
  "/send-notifications",
  authenticateJwt,
  isSuperAdmin,
  sendNotifications
);

export default router;
