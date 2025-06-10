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
exports.SubscriptionController = void 0;
const validators_1 = require("../utils/validators");
const db_1 = __importDefault(require("../lib/db"));
exports.SubscriptionController = {
    // Create or update a subscription
    subscribe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, notificationToken } = req.body;
                // Validate email
                if (email && !(0, validators_1.validateEmail)(email)) {
                    res.status(400).json({ error: "Invalid email format" });
                    return;
                }
                // At least one of email or token must be provided
                if (!email && !notificationToken) {
                    res.status(400).json({
                        error: "Either email or notification token is required",
                    });
                    return;
                }
                let subscription;
                if (email) {
                    // Check if subscription exists
                    const existing = yield db_1.default.subscription.findUnique({
                        where: { email },
                    });
                    if (existing) {
                        // Update existing subscription
                        subscription = yield db_1.default.subscription.update({
                            where: { email },
                            data: {
                                isSubscribed: true,
                                notificationToken: notificationToken || existing.notificationToken,
                            },
                        });
                    }
                    else {
                        // Create new subscription
                        subscription = yield db_1.default.subscription.create({
                            data: {
                                email,
                                notificationToken,
                                isSubscribed: true,
                            },
                        });
                    }
                }
                else if (notificationToken) {
                    // Handle token-only subscriptions (for push notifications)
                    const existing = yield db_1.default.subscription.findFirst({
                        where: { notificationToken },
                    });
                    if (existing) {
                        subscription = existing;
                    }
                    else {
                        subscription = yield db_1.default.subscription.create({
                            data: {
                                notificationToken,
                                isSubscribed: true,
                            },
                        });
                    }
                }
                res.status(200).json({
                    message: "Subscription successful",
                    subscription,
                });
            }
            catch (error) {
                console.error("Subscription error:", error);
                res.status(500).json({
                    error: "An error occurred while processing subscription",
                });
            }
        });
    },
    // Unsubscribe by email or token
    unsubscribe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, notificationToken } = req.body;
                if (!email) {
                    res.status(400).json({
                        error: "Email  is required",
                    });
                    return;
                }
                let subscription;
                if (email) {
                    subscription = yield db_1.default.subscription.update({
                        where: { email },
                        data: { isSubscribed: false },
                    });
                }
                else if (notificationToken) {
                    subscription = yield db_1.default.subscription.updateMany({
                        where: { notificationToken },
                        data: { isSubscribed: false },
                    });
                }
                res.status(200).json({
                    message: "Unsubscription successful",
                    subscription,
                });
            }
            catch (error) {
                console.error("Unsubscription error:", error);
                res.status(500).json({
                    error: "An error occurred while processing unsubscription",
                });
            }
        });
    },
    // Get all active subscriptions
    getAllSubscriptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptions = yield db_1.default.subscription.findMany({
                    where: { isSubscribed: true },
                });
                res.status(200).json(subscriptions);
            }
            catch (error) {
                console.error("Error fetching subscriptions:", error);
                res.status(500).json({
                    error: "An error occurred while fetching subscriptions",
                });
            }
        });
    },
    // Get subscription by email or token
    getSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, notificationToken } = req.query;
                if (!email && !notificationToken) {
                    res.status(400).json({
                        error: "Either email or notification token is required",
                    });
                    return;
                }
                let subscription;
                if (email) {
                    subscription = yield db_1.default.subscription.findUnique({
                        where: { email: email },
                    });
                }
                else if (notificationToken) {
                    subscription = yield db_1.default.subscription.findFirst({
                        where: { notificationToken: notificationToken },
                    });
                }
                if (!subscription) {
                    res.status(404).json({
                        error: "Subscription not found",
                    });
                    return;
                }
                res.status(200).json(subscription);
            }
            catch (error) {
                console.error("Error fetching subscription:", error);
                res.status(500).json({
                    error: "An error occurred while fetching subscription",
                });
            }
        });
    },
};
