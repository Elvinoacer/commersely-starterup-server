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
exports.getCustomers = getCustomers;
exports.getCustomerDetails = getCustomerDetails;
exports.deleteCustomer = deleteCustomer;
const db_1 = __importDefault(require("../lib/db"));
// Get all customers (admin)
function getCustomers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            if (!userRole || userRole !== "SUPER_ADMIN") {
                res.status(403).json({ success: false, message: "Unauthorized request" });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            // Get total count of customers
            const totalItems = yield db_1.default.user.count({
                where: { role: "USER" },
            });
            const customers = yield db_1.default.user.findMany({
                where: { role: "USER" },
                skip,
                take: limit,
                omit: { password: true },
                include: {
                    orders: {
                        select: {
                            id: true,
                            total: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            res.status(200).json({
                success: true,
                data: customers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems,
                    itemsPerPage: limit,
                },
            });
        }
        catch (error) {
            console.error("Error fetching customers:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch customers",
            });
        }
    });
}
// Get customer details (admin)
function getCustomerDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            if (userRole !== "SUPER_ADMIN") {
                res.status(403).json({ success: false, message: "Unauthorized request" });
                return;
            }
            const { customerId } = req.params;
            const user = yield db_1.default.user.findUnique({
                where: { id: customerId },
                include: {
                    wishlist: {
                        include: { product: { select: { id: true, name: true } } },
                    },
                    orders: {
                        include: {
                            items: { select: { id: true, productId: true, quantity: true } },
                            address: true,
                            coupon: { select: { id: true, code: true } },
                        },
                    },
                    addresses: true,
                    cart: {
                        include: {
                            items: { select: { id: true, productId: true, quantity: true } },
                        },
                    },
                },
                omit: { password: true },
            });
            if (!user || user.role !== "USER") {
                res.status(404).json({ success: false, message: "Customer not found" });
                return;
            }
            res.status(200).json({
                success: true,
                data: user,
                message: "Customer details fetched",
            });
        }
        catch (error) {
            console.error("Error fetching customer details:", error);
            res.status(500).json({
                success: false,
                message: (error === null || error === void 0 ? void 0 : error.message) || "Failed to fetch customer details",
            });
        }
    });
}
// Delete a customer (admin)
function deleteCustomer(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            if (userRole !== "SUPER_ADMIN") {
                res.status(403).json({ success: false, message: "Unauthorized request" });
                return;
            }
            const { customerId } = req.params;
            const user = yield db_1.default.user.findUnique({
                where: { id: customerId },
            });
            if (!user || user.role !== "USER") {
                res.status(404).json({ success: false, message: "Customer not found" });
                return;
            }
            // Delete related data to avoid foreign key constraints
            yield db_1.default.$transaction([
                // Delete cart items first, then cart
                db_1.default.cartItem.deleteMany({ where: { cart: { userId: customerId } } }),
                db_1.default.cart.deleteMany({ where: { userId: customerId } }),
                // Delete wishlist
                db_1.default.wishlist.deleteMany({ where: { userId: customerId } }),
                // Delete addresses
                db_1.default.address.deleteMany({ where: { userId: customerId } }),
                // Delete reviews
                db_1.default.review.deleteMany({ where: { userId: customerId } }),
                // Delete orders and their items
                db_1.default.orderItem.deleteMany({ where: { order: { userId: customerId } } }),
                db_1.default.order.deleteMany({ where: { userId: customerId } }),
                // Delete subscription if exists
                db_1.default.subscription.deleteMany({ where: { email: user.email } }),
                // Delete user
                db_1.default.user.delete({ where: { id: customerId } }),
            ]);
            res
                .status(200)
                .json({ success: true, message: "Customer deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting customer:", error);
            if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
                res.status(404).json({ success: false, message: "Customer not found" });
                return;
            }
            res.status(500).json({
                success: false,
                message: (error === null || error === void 0 ? void 0 : error.message) || "Failed to delete customer",
            });
        }
    });
}
