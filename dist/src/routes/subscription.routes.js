"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/subscription.routes.ts
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("../controllers/subscription.controller");
const router = express_1.default.Router();
router.post("/subscribe", subscription_controller_1.SubscriptionController.subscribe);
router.post("/unsubscribe", subscription_controller_1.SubscriptionController.unsubscribe);
router.get("/subscriptions", subscription_controller_1.SubscriptionController.getAllSubscriptions);
router.get("/subscription", subscription_controller_1.SubscriptionController.getSubscription);
exports.default = router;
