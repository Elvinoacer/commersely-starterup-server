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
exports.clearEntireCart = exports.updateCartItemQuantity = exports.removeFromCart = exports.getCart = exports.addToCart = void 0;
const db_1 = __importDefault(require("../lib/db"));
const logAdminNotification_1 = require("../utils/logAdminNotification");
const client_1 = require("@prisma/client");
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { productId, quantity, size, color } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        });
        const cart = yield db_1.default.cart.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
        const cartItem = yield db_1.default.cartItem.upsert({
            where: {
                cartId_productId_size_color: {
                    cartId: cart.id,
                    productId,
                    size: size || null,
                    color: color || null,
                },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                cartId: cart.id,
                productId,
                quantity,
                size,
                color,
            },
        });
        const product = yield db_1.default.product.findUnique({
            where: { id: productId },
            select: {
                name: true,
                price: true,
                images: true,
            },
        });
        // Log notification
        yield (0, logAdminNotification_1.logAdminNotification)({
            type: client_1.NotificationType.CART_ITEM_ADDED,
            details: {
                userId,
                userName: user === null || user === void 0 ? void 0 : user.name,
                userEmail: user === null || user === void 0 ? void 0 : user.email,
                productId,
                productName: product === null || product === void 0 ? void 0 : product.name,
                quantity,
                size,
                color,
            },
        });
        const responseItem = {
            id: cartItem.id,
            productId: cartItem.productId,
            name: product === null || product === void 0 ? void 0 : product.name,
            price: product === null || product === void 0 ? void 0 : product.price,
            image: product === null || product === void 0 ? void 0 : product.images[0],
            color: cartItem.color,
            size: cartItem.size,
            quantity: cartItem.quantity,
        };
        res.status(201).json({
            success: true,
            data: responseItem,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Some error occurred!",
        });
    }
});
exports.addToCart = addToCart;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const cart = yield db_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: true,
            },
        });
        if (!cart) {
            res.json({
                success: false,
                message: "No Item found in cart",
                data: [],
            });
            return;
        }
        const cartItemsWithProducts = yield Promise.all(cart === null || cart === void 0 ? void 0 : cart.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield db_1.default.product.findUnique({
                where: { id: item.productId },
                select: {
                    name: true,
                    price: true,
                    images: true,
                },
            });
            return {
                id: item.id,
                productId: item.productId,
                name: product === null || product === void 0 ? void 0 : product.name,
                price: product === null || product === void 0 ? void 0 : product.price,
                image: product === null || product === void 0 ? void 0 : product.images[0],
                color: item.color,
                size: item.size,
                quantity: item.quantity,
            };
        })));
        res.json({
            success: true,
            data: cartItemsWithProducts,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch cart!",
        });
    }
});
exports.getCart = getCart;
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const cartItem = yield db_1.default.cartItem.findUnique({
            where: { id },
            select: { productId: true, quantity: true, size: true, color: true },
        });
        if (!cartItem) {
            res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        });
        const product = yield db_1.default.product.findUnique({
            where: { id: cartItem.productId },
            select: { name: true },
        });
        yield db_1.default.cartItem.delete({
            where: {
                id,
                cart: { userId },
            },
        });
        // Log notification
        yield (0, logAdminNotification_1.logAdminNotification)({
            type: client_1.NotificationType.CART_ITEM_REMOVED,
            details: {
                userId,
                userName: user === null || user === void 0 ? void 0 : user.name,
                userEmail: user === null || user === void 0 ? void 0 : user.email,
                productId: cartItem.productId,
                productName: product === null || product === void 0 ? void 0 : product.name,
                quantity: cartItem.quantity,
                size: cartItem.size,
                color: cartItem.color,
            },
        });
        res.status(200).json({
            success: true,
            message: "Item has been removed from cart",
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to remove from cart!",
        });
    }
});
exports.removeFromCart = removeFromCart;
const updateCartItemQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        const { quantity } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const updatedItem = yield db_1.default.cartItem.update({
            where: {
                id,
                cart: { userId },
            },
            data: { quantity },
        });
        const product = yield db_1.default.product.findUnique({
            where: { id: updatedItem.productId },
            select: {
                name: true,
                price: true,
                images: true,
            },
        });
        const responseItem = {
            id: updatedItem.id,
            productId: updatedItem.productId,
            name: product === null || product === void 0 ? void 0 : product.name,
            price: product === null || product === void 0 ? void 0 : product.price,
            image: product === null || product === void 0 ? void 0 : product.images[0],
            color: updatedItem.color,
            size: updatedItem.size,
            quantity: updatedItem.quantity,
        };
        res.json({
            success: true,
            data: responseItem,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to update cart item quantity",
        });
    }
});
exports.updateCartItemQuantity = updateCartItemQuantity;
const clearEntireCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield db_1.default.cartItem.deleteMany({
            where: {
                cart: { userId },
            },
        });
        res.status(200).json({
            success: true,
            message: "Cart cleared successfully!",
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to clear cart!",
        });
    }
});
exports.clearEntireCart = clearEntireCart;
