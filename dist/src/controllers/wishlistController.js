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
exports.clearWishlist = exports.toggleWishlist = exports.getWishlist = void 0;
const db_1 = __importDefault(require("../lib/db"));
const logAdminNotification_1 = require("../utils/logAdminNotification");
const client_1 = require("@prisma/client");
const getWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        if (!userId) {
            res.status(400).json({ message: "User ID required", success: false });
            return;
        }
        // Get total count of wishlist items
        const wishlist = yield db_1.default.wishlist.findFirst({
            where: { userId },
            include: { product: true },
        });
        const totalItems = wishlist ? wishlist.product.length : 0;
        const totalPages = Math.ceil(totalItems / limit);
        // Get paginated wishlist items
        const paginatedProducts = wishlist
            ? wishlist.product.slice(skip, skip + limit)
            : [];
        res.status(200).json({
            success: true,
            wishlist: { product: paginatedProducts }, // Return consistent structure
            currentPage: page,
            totalPages,
            itemsPerPage: limit,
            totalItems,
        });
    }
    catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
});
exports.getWishlist = getWishlist;
const toggleWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { productId } = req.body;
        if (!userId || !productId) {
            res.status(400).json({
                message: "User ID or product ID is undefined",
                success: false,
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        });
        const product = yield db_1.default.product.findUnique({
            where: { id: productId },
            select: { id: true, name: true },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found", success: false });
            return;
        }
        let wishlist = yield db_1.default.wishlist.findFirst({
            where: { userId: userId },
            include: { product: true },
        });
        if (!wishlist) {
            wishlist = yield db_1.default.wishlist.create({
                data: {
                    userId: userId,
                    product: {
                        connect: { id: productId },
                    },
                },
                include: {
                    product: true,
                },
            });
            yield (0, logAdminNotification_1.logAdminNotification)({
                type: client_1.NotificationType.WISHLIST_ITEM_ADDED,
                details: {
                    userId,
                    userName: user === null || user === void 0 ? void 0 : user.name,
                    userEmail: user === null || user === void 0 ? void 0 : user.email,
                    productId,
                    productName: product.name,
                },
            });
            res.status(200).json({
                wishlist,
                message: "Product added to wishlist",
                success: true,
            });
        }
        else {
            const isProductInWishlist = wishlist.product.some((p) => p.id === productId);
            if (isProductInWishlist) {
                wishlist = yield db_1.default.wishlist.update({
                    where: { id: wishlist.id },
                    data: {
                        product: {
                            disconnect: { id: productId },
                        },
                    },
                    include: {
                        product: true,
                    },
                });
                res.status(200).json({
                    wishlist,
                    message: "Product removed from wishlist",
                    success: true,
                });
            }
            else {
                wishlist = yield db_1.default.wishlist.update({
                    where: { id: wishlist.id },
                    data: {
                        product: {
                            connect: { id: productId },
                        },
                    },
                    include: {
                        product: true,
                    },
                });
                yield (0, logAdminNotification_1.logAdminNotification)({
                    type: client_1.NotificationType.WISHLIST_ITEM_ADDED,
                    details: {
                        userId,
                        userName: user === null || user === void 0 ? void 0 : user.name,
                        userEmail: user === null || user === void 0 ? void 0 : user.email,
                        productId,
                        productName: product.name,
                    },
                });
                res.status(200).json({
                    wishlist,
                    message: "Product added to wishlist",
                    success: true,
                });
            }
        }
    }
    catch (error) {
        console.error("Error toggling wishlist:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
});
exports.toggleWishlist = toggleWishlist;
const clearWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "User ID is undefined", success: false });
            return;
        }
        const wishlist = yield db_1.default.wishlist.findFirst({
            where: { userId: userId },
        });
        if (!wishlist) {
            res.status(404).json({ message: "Wishlist not found", success: false });
            return;
        }
        const clearedWishlist = yield db_1.default.wishlist.update({
            where: { id: wishlist.id },
            data: {
                product: {
                    set: [],
                },
            },
            include: {
                product: true,
            },
        });
        res.status(200).json({
            wishlist: clearedWishlist,
            message: "Wishlist cleared",
            success: true,
        });
    }
    catch (error) {
        console.error("Error clearing wishlist:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
});
exports.clearWishlist = clearWishlist;
