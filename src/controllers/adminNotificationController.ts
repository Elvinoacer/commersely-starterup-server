import { Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getAdminNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { page = "1", limit = "10", search = "" } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
      return;
    }

    const searchLower = (search as string).toLowerCase();
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    if (search) {
      // Execute raw SQL queries for search
      const notifications = await prisma.$queryRaw`
        SELECT * FROM "AdminNotification"
        WHERE 
          "adminId" = ${userId} AND
          (
            LOWER("type"::text) LIKE ${`%${searchLower}%`} OR
            LOWER("details"::text) LIKE ${`%${searchLower}%`}
          )
        ORDER BY "createdAt" DESC
        LIMIT ${limitNum}
        OFFSET ${skip}
      `;

      const totalCountResult: any = await prisma.$queryRaw`
        SELECT COUNT(*) FROM "AdminNotification"
        WHERE 
          "adminId" = ${userId} AND
          (
            LOWER("type"::text) LIKE ${`%${searchLower}%`} OR
            LOWER("details"::text) LIKE ${`%${searchLower}%`}
          )
      `;

      const totalItems = parseInt(totalCountResult[0].count);

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          currentPage: pageNum,
          itemsPerPage: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
        },
      });
      return;
    }

    // Regular non-search query
    const [notifications, totalItems] = await Promise.all([
      prisma.adminNotification.findMany({
        where: { adminId: userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.adminNotification.count({
        where: { adminId: userId },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: pageNum,
        itemsPerPage: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (e) {
    console.error("Error fetching notifications:", e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};
export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
      return;
    }

    const notification = await prisma.adminNotification.findUnique({
      where: {
        id: notificationId,
        adminId: userId,
      },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    const updatedNotification = await prisma.adminNotification.update({
      where: {
        id: notificationId,
        adminId: userId,
      },
      data: {
        isRead: true,
      },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedNotification,
      message: "Notification marked as read",
    });
  } catch (e) {
    console.error("Error marking notification as read:", e);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
      return;
    }

    await prisma.adminNotification.updateMany({
      where: {
        adminId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (e) {
    console.error("Error marking all notifications as read:", e);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
      return;
    }

    const notification = await prisma.adminNotification.findUnique({
      where: {
        id: notificationId,
        adminId: userId,
      },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    await prisma.adminNotification.delete({
      where: {
        id: notificationId,
        adminId: userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting notification:", e);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

export const clearAllNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
      return;
    }

    await prisma.adminNotification.deleteMany({
      where: {
        adminId: userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "All notifications cleared successfully",
    });
  } catch (e) {
    console.error("Error clearing all notifications:", e);
    res.status(500).json({
      success: false,
      message: "Failed to clear all notifications",
    });
  }
};
