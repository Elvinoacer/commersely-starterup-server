"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const analyticsController = new analyticsController_1.AnalyticsController();
router.get("/", authMiddleware_1.authenticateJwt, authMiddleware_1.isSuperAdmin, analyticsController.getAnalytics.bind(analyticsController));
exports.default = router;
