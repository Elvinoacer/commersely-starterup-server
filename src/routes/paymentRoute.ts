import express from "express";
import { handlePaymentWebhook } from "../controllers/paymentController";

const router = express.Router();

router.post("/handle-money", handlePaymentWebhook);

export default router;
