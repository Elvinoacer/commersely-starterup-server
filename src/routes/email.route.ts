import express from "express";
import { emailController } from "../controllers/email-controller";
const router = express.Router();
router.post("/send-email", emailController.sendEmail);
router.post("/send-email-alert", emailController.sendAlertEmail);

export default router;
