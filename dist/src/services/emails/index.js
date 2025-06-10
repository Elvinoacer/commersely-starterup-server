"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 1
const nodemailer = require("nodemailer");
exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
    },
});
// async function sendMail() {
//   try {
//     const info = await transporter.sendMail({
//       from: '"LVNTECHEIES" <lvntechies@gmail.com>',
//       to: "omondielvin@gmail.com",
//       subject: "Test from Nodemailer with Gmail",
//       text: "Hello world?",
//       html: "<b>Hello world?</b>",
//     });
//     console.log("Message sent: %s", info.messageId);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// }
// sendMail();
