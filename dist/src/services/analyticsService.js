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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AnalyticsService {
    getAnalytics() {
        return __awaiter(this, void 0, void 0, function* () {
            const [userStats, orderStats, productStats, categoryStats, reviewStats] = yield Promise.all([
                this.getUserStats(),
                this.getOrderStats(),
                this.getProductStats(),
                this.getCategoryStats(),
                this.getReviewStats(),
            ]);
            return {
                users: userStats,
                // @ts-ignore
                orders: orderStats,
                products: productStats,
                categories: categoryStats,
                reviews: reviewStats,
            };
        });
    }
    getUserStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield prisma.user.count();
            const newUsers = yield prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                    },
                },
            });
            const byRole = yield prisma.user.groupBy({
                by: ["role"],
                _count: { id: true },
            });
            return {
                total,
                newUsers,
                byRole: byRole.map((item) => ({
                    role: item.role,
                    count: item._count.id,
                })),
            };
        });
    }
    getOrderStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield prisma.order.count();
            const revenue = yield prisma.order.aggregate({
                _sum: { total: true },
            });
            const averageOrderValue = revenue._sum.total
                ? revenue._sum.total / total
                : 0;
            const byStatus = yield prisma.order.groupBy({
                by: ["status"],
                _count: { id: true },
            });
            const byPaymentMethod = yield prisma.order.groupBy({
                by: ["paymentMethod"],
                _count: { id: true },
            });
            return {
                total,
                revenue: revenue._sum.total || 0,
                averageOrderValue,
                byStatus: byStatus.map((item) => ({
                    status: item.status,
                    count: item._count.id,
                })),
                byPaymentMethod: byPaymentMethod.map((item) => ({
                    method: item.paymentMethod,
                    count: item._count.id,
                })),
            };
        });
    }
    getProductStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield prisma.product.count();
            const lowStock = yield prisma.product.count({
                where: { stock: { lte: 10 } },
            });
            const topSelling = yield prisma.product.findMany({
                orderBy: { soldCount: "desc" },
                take: 5,
                select: { id: true, name: true, soldCount: true },
            });
            return { total, lowStock, topSelling };
        });
    }
    getCategoryStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield prisma.category.count();
            const byCategory = yield prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: { products: true },
                    },
                },
            });
            return {
                total,
                byCategory: byCategory.map((item) => ({
                    id: item.id,
                    name: item.name,
                    productCount: item._count.products,
                })),
            };
        });
    }
    getReviewStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalReviews = yield prisma.review.count();
            const avgRating = yield prisma.review.aggregate({
                _avg: { rating: true },
            });
            return {
                totalReviews,
                averageRating: avgRating._avg.rating || 0,
            };
        });
    }
}
exports.AnalyticsService = AnalyticsService;
