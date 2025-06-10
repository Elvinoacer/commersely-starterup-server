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
exports.handlePaymentWebhook = void 0;
const db_1 = __importDefault(require("../lib/db"));
const client_1 = require("@prisma/client");
const handlePaymentWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        console.log("Money payload", payload);
        const { invoice_id, state, provider } = payload;
        // Map provider to PaymentMethod enum
        const providerToPaymentMethod = {
            pesalink: client_1.PaymentMethod.PESALINK,
            card: client_1.PaymentMethod.CREDIT_CARD,
            "apple-pay": client_1.PaymentMethod.APPLE_PAY,
            gpay: client_1.PaymentMethod.GPAY,
            cashapp: client_1.PaymentMethod.CASHAPP,
            mpesa: client_1.PaymentMethod.MPESA,
        };
        const paymentMethod = providerToPaymentMethod[provider.toLowerCase()];
        // Handle different payment states
        switch (state) {
            case "PENDING":
                // Store initial payment details
                yield db_1.default.order.updateMany({
                    where: { paymentId: invoice_id },
                    data: {
                        paymentStatus: "PENDING",
                        paymentMethod,
                        paymentId: invoice_id,
                    },
                });
                break;
            case "PROCESSING":
                // Update payment status to processing
                yield db_1.default.order.updateMany({
                    where: { paymentId: invoice_id },
                    data: { paymentStatus: "PENDING" }, // Still pending until complete
                });
                break;
            case "COMPLETE":
                // Find the user based on api_ref (userId)
                const user = yield db_1.default.user.findUnique({
                    where: { id: payload.api_ref },
                    include: {
                        cart: {
                            include: {
                                items: {
                                    include: {
                                        // Include product details for each cart item
                                        product: {
                                            select: {
                                                id: true,
                                                name: true,
                                                price: true,
                                                offerPrice: true,
                                                category: {
                                                    select: {
                                                        name: true,
                                                    },
                                                },
                                                images: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                if (!user || !user.cart || user.cart.items.length === 0) {
                    res.status(400).json({ message: "No user or cart found" });
                    return;
                }
                // Get user's default address
                const address = yield db_1.default.address.findFirst({
                    where: { userId: user.id, isDefault: true },
                });
                if (!address) {
                    res.status(400).json({ message: "No default address found" });
                    return;
                }
                // Create order items using product details
                const orderItems = user.cart.items.map((item) => {
                    const product = item.product;
                    return {
                        productId: item.productId,
                        productName: product.name,
                        productCategory: product.category.name,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                        price: product.offerPrice ? product.offerPrice : product.price,
                        orderImages: product.images || [],
                    };
                });
                // Create order
                const order = yield db_1.default.order.create({
                    data: {
                        userId: user.id,
                        addressId: address.id,
                        paymentId: invoice_id,
                        paymentMethod: provider,
                        paymentStatus: "COMPLETED",
                        status: "PENDING",
                        total: parseFloat(payload.net_amount),
                        items: {
                            create: orderItems,
                        },
                    },
                });
                // Create admin notification
                yield db_1.default.adminNotification.create({
                    data: {
                        adminId: user.id,
                        type: "NEW_ORDER_PLACED",
                        details: {
                            orderId: order.id,
                            amount: payload.net_amount,
                            paymentMethod,
                        },
                    },
                });
                // Clear the cart
                yield db_1.default.cartItem.deleteMany({
                    where: { cartId: user.cart.id },
                });
                yield db_1.default.cart.update({
                    where: { id: user.cart.id },
                    data: { updatedAt: new Date() },
                });
                break;
            case "FAILED":
                // Update order with failed status
                yield db_1.default.order.updateMany({
                    where: { paymentId: invoice_id },
                    data: {
                        paymentStatus: "PENDING", // Or add FAILED status to enum if needed
                        status: "PENDING",
                    },
                });
                break;
            default:
                res.status(400).json({ message: "Invalid payment state" });
                return;
        }
        res.json({ message: "success" });
    }
    catch (error) {
        console.error("Payment webhook error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.handlePaymentWebhook = handlePaymentWebhook;
