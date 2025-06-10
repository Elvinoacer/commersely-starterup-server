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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotifications = sendNotifications;
const added_productTemplate_1 = require("../templates/added-productTemplate");
const notification_service_1 = __importDefault(require("./notification.service"));
// "New collection from Commersely store"
function sendNotifications(_a) {
    return __awaiter(this, arguments, void 0, function* ({ title, text, productsWithContent, }) {
        // Send notifications
        const result = yield notification_service_1.default.sendBulkNotifications({
            from: process.env.USER_EMAIL,
            subject: title,
            text: text,
            html: (0, added_productTemplate_1.productTemplate)(productsWithContent),
        }, {
            title: "Notification Title",
            body: "Notification body content",
            data: { key: "value" }, // optional
        }, 1000 // batch size
        );
        console.log("Notification results:", result);
    });
}
// // Or use the multicast version (more efficient for push notifications)
// const multicastResult = await notificationService.sendMulticastNotification(
//   { /* email options */ },
//   { /* notification options */ },
//   1000 // batch size
// );
// console.log('Multicast results:', multicastResult);
