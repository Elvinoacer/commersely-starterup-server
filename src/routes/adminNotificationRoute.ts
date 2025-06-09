import express from "express";
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/adminNotificationController";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/notifications",
  authenticateJwt,
  isSuperAdmin,
  getAdminNotifications
);
router.put(
  "/notifications/:notificationId/read",
  authenticateJwt,
  isSuperAdmin,
  markNotificationAsRead
);
router.put(
  "/notifications/read-all",
  authenticateJwt,
  isSuperAdmin,
  markAllNotificationsAsRead
);
router.delete(
  "/notifications/:notificationId",
  authenticateJwt,
  isSuperAdmin,
  deleteNotification
);
router.delete(
  "/clear-notifications",
  authenticateJwt,
  isSuperAdmin,
  clearAllNotifications
);

export default router;
