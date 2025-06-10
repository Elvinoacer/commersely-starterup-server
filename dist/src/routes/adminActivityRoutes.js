"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminActivityController_1 = require("../controllers/adminActivityController");
const notification_sender_controller_1 = require("../controllers/notification-sender.controller");
const router = express_1.default.Router();
router.get("/recent-activities", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, adminActivityController_1.getRecentAdminActivities);
router.post("/send-notifications", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, notification_sender_controller_1.sendNotifications);
exports.default = router;
