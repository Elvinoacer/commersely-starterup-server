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
exports.initiatePayment = exports.getOrdersByUserId = exports.getAllOrdersForAdmin = exports.updateOrderStatus = exports.getOrder = exports.createFinalOrder = void 0;
const db_1 = __importDefault(require("../lib/db"));
const logAdminNotification_1 = require("../utils/logAdminNotification");
const client_1 = require("@prisma/client");
const intasend_node_1 = __importDefault(require("intasend-node"));
const createFinalOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { items, addressId, couponId, total, paymentId, email, paymentMethod, paymentStatus, } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        // Fetch the COD setting
        const setting = yield db_1.default.setting.findUnique({
            where: { id: "global_settings" },
        });
        // If COD is disabled, enforce completed payment for non-COD methods
        if (!(setting === null || setting === void 0 ? void 0 : setting.isCashOnDelivery) && paymentMethod === "CASH_ON_DELIVERY") {
            res.status(400).json({
                success: false,
                message: "Cash on Delivery is currently disabled",
            });
            return;
        }
        // If COD is disabled, ensure payment is completed for other methods
        if (!(setting === null || setting === void 0 ? void 0 : setting.isCashOnDelivery) &&
            paymentMethod !== "CASH_ON_DELIVERY" &&
            paymentStatus !== "COMPLETED") {
            res.status(400).json({
                success: false,
                message: "Payment must be completed before placing the order",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        });
        const order = yield db_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const newOrder = yield prisma.order.create({
                data: {
                    userId,
                    addressId,
                    email,
                    couponId,
                    total,
                    paymentMethod,
                    paymentStatus: paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : paymentStatus,
                    paymentId,
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            orderImages: [item.image],
                            productName: item.productName,
                            productCategory: item.productCategory,
                            quantity: item.quantity,
                            size: item.size,
                            color: item.color,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });
            // Update product stock and sold count
            for (const item of items) {
                yield prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                        soldCount: { increment: item.quantity },
                    },
                });
            }
            // Clear cart
            yield prisma.cartItem.deleteMany({
                where: { cart: { userId } },
            });
            yield prisma.cart.delete({
                where: { userId },
            });
            // Update coupon usage
            if (couponId) {
                yield prisma.coupon.update({
                    where: { id: couponId },
                    data: { usageCount: { increment: 1 } },
                });
            }
            // Log notification
            yield (0, logAdminNotification_1.logAdminNotification)({
                type: client_1.NotificationType.NEW_ORDER_PLACED,
                details: {
                    orderId: newOrder.id,
                    userId,
                    userName: user === null || user === void 0 ? void 0 : user.name,
                    userEmail: user === null || user === void 0 ? void 0 : user.email,
                    total,
                    itemCount: items.length,
                    paymentMethod,
                },
            });
            return newOrder;
        }));
        res.status(201).json(order);
    }
    catch (e) {
        console.log(req.body);
        res.status(500).json({
            success: false,
            message: "Unexpected error occurred!",
        });
    }
});
exports.createFinalOrder = createFinalOrder;
const getOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { orderId } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const order = yield db_1.default.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: true,
                address: true,
                coupon: true,
            },
        });
        res.status(200).json(order);
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Unexpected error occurred!",
        });
    }
});
exports.getOrder = getOrder;
const updateOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { orderId } = req.params;
        const { status } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        yield db_1.default.order.updateMany({
            where: {
                id: orderId,
            },
            data: {
                status,
            },
        });
        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Unexpected error occurred!",
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const getAllOrdersForAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        // Get total count of orders
        const totalItems = yield db_1.default.order.count();
        const orders = yield db_1.default.order.findMany({
            skip,
            take: limit,
            include: {
                items: true,
                address: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Unexpected error occurred!",
        });
    }
});
exports.getAllOrdersForAdmin = getAllOrdersForAdmin;
const getOrdersByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const orders = yield db_1.default.order.findMany({
            where: {
                userId: userId,
            },
            include: {
                items: true,
                address: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(orders);
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Unexpected error occurred!",
        });
    }
});
exports.getOrdersByUserId = getOrdersByUserId;
// Add this to your order controller
const initiatePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, email, amount, firstName, lastName, redirectUrl } = req.body;
        // Validate the order exists and belongs to the user
        const cart = yield db_1.default.cart.findUnique({
            where: { userId: userId },
            include: { user: true },
        });
        if (!cart) {
            res.status(404).json({
                success: false,
                message: "cart not found",
            });
            return;
        }
        // Initialize IntaSend
        const intasend = new intasend_node_1.default(process.env.INTASEND_PUBLIC_KEY, process.env.INTASEND_SECRET_KEY, false);
        const collection = intasend.collection();
        // Create payment link
        const response = yield collection.charge({
            first_name: firstName,
            last_name: lastName,
            email: email,
            host: redirectUrl,
            amount: amount,
            currency: "KES",
            api_ref: userId, // Using order ID as reference
            redirect_url: redirectUrl,
        });
        res.status(200).json({
            success: true,
            paymentUrl: response.url,
        });
    }
    catch (e) {
        console.error("Payment initiation error:", e);
        res.status(500).json({
            success: false,
            message: "Failed to initiate payment",
        });
    }
});
exports.initiatePayment = initiatePayment;
