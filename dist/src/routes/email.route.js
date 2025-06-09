"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_controller_1 = require("../controllers/email-controller");
const router = express_1.default.Router();
router.post("/send-email", email_controller_1.emailController.sendEmail);
router.post("/send-email-alert", email_controller_1.emailController.sendAlertEmail);
exports.default = router;
