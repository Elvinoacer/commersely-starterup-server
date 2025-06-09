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
exports.NotificationController = void 0;
const firebase_admin_1 = __importDefault(require("../lib/firebase-admin"));
exports.NotificationController = {
    sendNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                // Validate required fields
                if (!body.title || !body.body) {
                    return res.status(400).json({
                        success: false,
                        message: "Title and body are required",
                    });
                }
                // Validate at least one target exists
                if (!body.token && !body.tokens && !body.topic) {
                    return res.status(400).json({
                        success: false,
                        message: "Either token, tokens, or topic is required",
                    });
                }
                let response;
                if (body.token) {
                    // Single token notification
                    const message = {
                        notification: {
                            title: body.title,
                            body: body.body,
                        },
                        data: body.data || {},
                        token: body.token,
                        webpush: {
                            notification: {
                                icon: "/icons/icon-192x192.png",
                                badge: "/icons/icon-192x192.png",
                            },
                            fcmOptions: {
                                link: "/notifications",
                            },
                        },
                    };
                    const messageId = yield firebase_admin_1.default.messaging().send(message);
                    response = {
                        success: true,
                        messageId,
                    };
                }
                else if (body.tokens) {
                    // Multiple tokens notification
                    const results = yield Promise.all(body.tokens.map((token) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const message = {
                                notification: {
                                    title: body.title,
                                    body: body.body,
                                },
                                data: body.data,
                                token,
                            };
                            const messageId = yield firebase_admin_1.default.messaging().send(message);
                            return { success: true, messageId };
                        }
                        catch (error) {
                            return {
                                success: false,
                                error: error instanceof Error ? error.message : String(error),
                            };
                        }
                    })));
                    const successCount = results.filter((r) => r.success).length;
                    const failureCount = results.length - successCount;
                    response = {
                        success: true,
                        message: "Multicast sent",
                        successCount,
                        failureCount,
                        responses: results,
                    };
                }
                else if (body.topic) {
                    // Topic notification
                    const message = {
                        notification: {
                            title: body.title,
                            body: body.body,
                        },
                        data: body.data,
                        topic: body.topic,
                    };
                    const messageId = yield firebase_admin_1.default.messaging().send(message);
                    response = {
                        success: true,
                        messageId,
                    };
                }
                else {
                    // Fallback (shouldn't reach here due to validation)
                    return res.status(400).json({
                        success: false,
                        message: "No valid target for notification",
                    });
                }
                return res.status(200).json(response);
            }
            catch (error) {
                console.error("Error sending message:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to send notification",
                });
            }
        });
    },
};
