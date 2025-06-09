"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailController = void 0;
const emails_1 = require("../services/emails");
const email_1 = require("../templates/email");
const defaultAutoReplyParam = {
    subject: "Thanks for signup",
    message: "We have realized you have signup with us, \n welcome onboard as we start our mistery journey",
    // email,
    replyTimeframe: new Date(Date.now()).toDateString(),
    emergencyContact: "0790670542",
    companyName: "Commersely",
    additionalInfo: "Better we get you started soon",
};
const autoReply = (_a) => __awaiter(void 0, [_a], void 0, function* ({ senderName, subject, message, email, replyTimeframe, emergencyContact, companyName, additionalInfo, }) {
    try {
        // Validate required fields
        if (!senderName ||
            !email ||
            !subject ||
            !replyTimeframe ||
            !emergencyContact ||
            !companyName ||
            !additionalInfo) {
            console.log("missing some fields");
            throw new Error("Missing some fields");
        }
        // Construct email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Store receiver email in environment variable
            subject: `${subject}`,
            html: (0, email_1.autoReplyTemplate)({
                senderName,
                subject,
                message,
                replyTimeframe,
                emergencyContact,
                companyName,
                additionalInfo,
            }),
        };
        // Send email
        yield emails_1.transporter.sendMail(mailOptions);
        console.log("successfully sent the auto-response");
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
});
// Email controller
exports.emailController = {
    sendEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const _a = req.body, { name, email, title, message } = _a, otherFields = __rest(_a, ["name", "email", "title", "message"]);
            // Validate required fields
            if (!name || !email || !title || !message) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields: name, email, title, and message are required",
                });
                return;
            }
            // Construct email content
            const mailOptions = {
                from: email, // Store receiver email in environment variable
                to: process.env.ADMIN_EMAIL,
                subject: `New Contact Form Submission: ${title}`,
                html: (0, email_1.emailTemplate)({ name, email, title, message, otherFields }),
            };
            // Send email
            yield Promise.all([
                emails_1.transporter.sendMail(mailOptions),
                autoReply(Object.assign(Object.assign({}, defaultAutoReplyParam), { email, senderName: name })),
            ]); //transporter.sendMail(mailOptions);
            res.status(200).json({
                success: true,
                message: "Email sent successfully",
            });
        }
        catch (error) {
            console.error("Error sending email:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send email",
                error: error.message,
            });
        }
    }),
    sendAlertEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userName, email, notificationTitle, notificationMessage, activities, ctaLink, ctaText, } = req.body;
            // Validate required fields
            if (!userName ||
                !email ||
                !notificationTitle ||
                !notificationMessage ||
                !activities ||
                !ctaLink ||
                !ctaText) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields:userName,  notificationTitle,  notificationMessage,  activities,  ctaLink,  ctaText,  are required",
                });
                return;
            }
            // Construct email content
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email, // Store receiver email in environment variable
                subject: `${notificationTitle}`,
                html: (0, email_1.activityNotificationTemplate)({
                    userName,
                    notificationTitle,
                    notificationMessage,
                    activities,
                    ctaLink,
                    ctaText,
                }),
            };
            // Send email
            yield emails_1.transporter.sendMail(mailOptions);
            res.status(200).json({
                success: true,
                message: "Email sent successfully",
            });
        }
        catch (error) {
            console.error("Error sending email:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send email",
                error: error.message,
            });
        }
    }),
};
