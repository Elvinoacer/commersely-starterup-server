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
// src/services/notification.service.ts
const firebase_admin_1 = __importDefault(require("../lib/firebase-admin"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = __importDefault(require("../lib/db"));
class NotificationService {
    constructor() {
        this.prisma = db_1.default;
        // Configure nodemailer (update with your SMTP settings)
        this.mailer = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "465"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            },
        });
    }
    /**
     * Process notifications in batches to avoid memory issues
     */
    sendBulkNotifications(emailOptions_1, notificationOptions_1) {
        return __awaiter(this, arguments, void 0, function* (emailOptions, notificationOptions, batchSize = 1000) {
            const result = {
                emailSuccessCount: 0,
                emailFailureCount: 0,
                pushSuccessCount: 0,
                pushFailureCount: 0,
                duplicateTokensSkipped: 0,
            };
            // Get total count of active subscribers
            const totalSubscribers = yield this.prisma.subscription.count({
                where: { isSubscribed: true },
            });
            console.log(`Processing ${totalSubscribers} subscribers in batches of ${batchSize}`);
            // Process in batches
            for (let skip = 0; skip < totalSubscribers; skip += batchSize) {
                const batch = yield this.prisma.subscription.findMany({
                    where: { isSubscribed: true },
                    skip,
                    take: batchSize,
                    select: {
                        email: true,
                        notificationToken: true,
                    },
                });
                // Process the current batch
                const batchResult = yield this.processBatch(batch, emailOptions, notificationOptions);
                // Aggregate results
                result.emailSuccessCount += batchResult.emailSuccessCount;
                result.emailFailureCount += batchResult.emailFailureCount;
                result.pushSuccessCount += batchResult.pushSuccessCount;
                result.pushFailureCount += batchResult.pushFailureCount;
                //   result.duplicateTokensSkipped += batchResult.duplicateTokensSkipped;
                console.log(`Processed batch ${skip / batchSize + 1}/${Math.ceil(totalSubscribers / batchSize)}`);
            }
            return result;
        });
    }
    /**
     * Process a single batch of subscribers
     */
    processBatch(batch, emailOptions, notificationOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const batchResult = {
                emailSuccessCount: 0,
                emailFailureCount: 0,
                pushSuccessCount: 0,
                pushFailureCount: 0,
            };
            // Track seen tokens to avoid duplicates
            const seenTokens = new Set();
            // Process emails and push notifications in parallel
            yield Promise.all([
                // Process emails
                this.processEmails(batch, emailOptions, batchResult),
                // Process push notifications
                this.processPushNotifications(batch, notificationOptions, seenTokens, batchResult),
            ]);
            return batchResult;
        });
    }
    /**
     * Send emails to a batch of subscribers
     */
    processEmails(batch, emailOptions, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailPromises = batch
                .filter((subscriber) => subscriber.email)
                .map((subscriber) => {
                return this.mailer
                    .sendMail(Object.assign(Object.assign({}, emailOptions), { to: subscriber.email }))
                    .then(() => {
                    result.emailSuccessCount++;
                })
                    .catch((error) => {
                    console.error(`Failed to send email to ${subscriber.email}:`, error);
                    result.emailFailureCount++;
                });
            });
            yield Promise.all(emailPromises);
        });
    }
    /**
     * Send push notifications to a batch of subscribers
     */
    processPushNotifications(batch, notificationOptions, seenTokens, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const pushPromises = batch
                .filter((subscriber) => subscriber.notificationToken)
                .map((subscriber) => {
                var _a, _b, _c;
                const token = subscriber.notificationToken;
                // Skip duplicate tokens
                if (seenTokens.has(token)) {
                    if (result.duplicateTokensSkipped !== undefined) {
                        result.duplicateTokensSkipped++;
                    }
                    return Promise.resolve();
                }
                seenTokens.add(token);
                const message = {
                    notification: {
                        title: notificationOptions.title,
                        body: notificationOptions.body,
                    },
                    data: notificationOptions.data,
                    token,
                    webpush: {
                        notification: {
                            icon: ((_a = notificationOptions.data) === null || _a === void 0 ? void 0 : _a.icon) ||
                                "https://i.pinimg.com/736x/8e/38/0c/8e380caa74c0a829a4dc16f063e1100b.jpg",
                            badge: ((_b = notificationOptions.data) === null || _b === void 0 ? void 0 : _b.icon) ||
                                "https://i.pinimg.com/736x/ef/2e/1b/ef2e1b69d6aed75e8b9c16bd6013303c.jpg",
                        },
                        fcmOptions: {
                            link: ((_c = notificationOptions.data) === null || _c === void 0 ? void 0 : _c.lead) || "/",
                        },
                    },
                };
                return firebase_admin_1.default
                    .messaging()
                    .send(message)
                    .then(() => {
                    result.pushSuccessCount++;
                })
                    .catch((error) => {
                    console.error(`Failed to send push notification to token ${token}:`, error);
                    result.pushFailureCount++;
                });
            });
            yield Promise.all(pushPromises);
        });
    }
    /**
     * Alternative method for sending to all subscribers using multicast (more efficient for push)
     */
    sendMulticastNotification(emailOptions_1, notificationOptions_1) {
        return __awaiter(this, arguments, void 0, function* (emailOptions, notificationOptions, batchSize = 1000) {
            const result = {
                emailSuccessCount: 0,
                emailFailureCount: 0,
                pushSuccessCount: 0,
                pushFailureCount: 0,
                duplicateTokensSkipped: 0,
            };
            // Get total count of active subscribers
            const totalSubscribers = yield this.prisma.subscription.count({
                where: { isSubscribed: true },
            });
            console.log(`Processing ${totalSubscribers} subscribers in batches of ${batchSize}`);
            // Process in batches
            for (let skip = 0; skip < totalSubscribers; skip += batchSize) {
                const batch = yield this.prisma.subscription.findMany({
                    where: { isSubscribed: true },
                    skip,
                    take: batchSize,
                    select: {
                        email: true,
                        notificationToken: true,
                    },
                });
                // Process emails
                yield this.processEmails(batch, emailOptions, result);
                // Process push notifications using multicast (more efficient)
                const uniqueTokens = this.getUniqueTokens(batch);
                result.duplicateTokensSkipped +=
                    batch.filter((s) => s.notificationToken).length - uniqueTokens.length;
                if (uniqueTokens.length > 0) {
                    try {
                        const multicastMessage = {
                            tokens: uniqueTokens,
                            notification: {
                                title: notificationOptions.title,
                                body: notificationOptions.body,
                            },
                            data: notificationOptions.data,
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
                        const response = yield firebase_admin_1.default
                            .messaging()
                            .sendEachForMulticast(multicastMessage);
                        result.pushSuccessCount += response.successCount;
                        result.pushFailureCount += response.failureCount;
                    }
                    catch (error) {
                        console.error("Failed to send multicast notification:", error);
                        result.pushFailureCount += uniqueTokens.length;
                    }
                }
                console.log(`Processed batch ${skip / batchSize + 1}/${Math.ceil(totalSubscribers / batchSize)}`);
            }
            return result;
        });
    }
    /**
     * Extract unique tokens from a batch of subscribers
     */
    getUniqueTokens(batch) {
        const tokens = new Set();
        batch.forEach((subscriber) => {
            if (subscriber.notificationToken) {
                tokens.add(subscriber.notificationToken);
            }
        });
        return Array.from(tokens);
    }
    /**
     * Clean up resources
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.$disconnect();
            this.mailer.close();
        });
    }
}
exports.default = new NotificationService();
