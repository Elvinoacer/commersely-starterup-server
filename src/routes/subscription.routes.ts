// src/routes/subscription.routes.ts
import express from "express";
import { SubscriptionController } from "../controllers/subscription.controller";

const router = express.Router();

router.post("/subscribe", SubscriptionController.subscribe);
router.post("/unsubscribe", SubscriptionController.unsubscribe);
router.get("/subscriptions", SubscriptionController.getAllSubscriptions);
router.get("/subscription", SubscriptionController.getSubscription);

export default router;
