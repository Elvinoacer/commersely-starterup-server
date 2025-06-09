"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminNotificationController_1 = require("../controllers/adminNotificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/notifications", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, adminNotificationController_1.getAdminNotifications);
router.put("/notifications/:notificationId/read", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, adminNotificationController_1.markNotificationAsRead);
router.put("/notifications/read-all", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, adminNotificationController_1.markAllNotificationsAsRead);
router.delete("/notifications/:notificationId", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, adminNotificationController_1.deleteNotification);
router.delete("/clear-notifications", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, adminNotificationController_1.clearAllNotifications);
exports.default = router;
