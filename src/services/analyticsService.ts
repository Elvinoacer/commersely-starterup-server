import { PrismaClient } from "@prisma/client";
import { AnalyticsResponse } from "../types/analytics";

const prisma = new PrismaClient();

export class AnalyticsService {
  async getAnalytics(): Promise<AnalyticsResponse> {
    const [userStats, orderStats, productStats, categoryStats, reviewStats] =
      await Promise.all([
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
  }

  private async getUserStats() {
    const total = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });
    const byRole = await prisma.user.groupBy({
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
  }

  private async getOrderStats() {
    const total = await prisma.order.count();
    const revenue = await prisma.order.aggregate({
      _sum: { total: true },
    });
    const averageOrderValue = revenue._sum.total
      ? revenue._sum.total / total
      : 0;
    const byStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const byPaymentMethod = await prisma.order.groupBy({
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
  }

  private async getProductStats() {
    const total = await prisma.product.count();
    const lowStock = await prisma.product.count({
      where: { stock: { lte: 10 } },
    });
    const topSelling = await prisma.product.findMany({
      orderBy: { soldCount: "desc" },
      take: 5,
      select: { id: true, name: true, soldCount: true },
    });

    return { total, lowStock, topSelling };
  }

  private async getCategoryStats() {
    const total = await prisma.category.count();
    const byCategory = await prisma.category.findMany({
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
  }

  private async getReviewStats() {
    const totalReviews = await prisma.review.count();
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    return {
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
    };
  }
}
