import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import prisma from "../lib/db";
import { AdminAction, Prisma } from "@prisma/client"; // Make sure to import your AdminAction enum and Prisma for QueryMode

const ITEMS_PER_PAGE = 10;

export const getRecentAdminActivities = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const searchQuery = (req.query.search as string)?.trim() || "";

    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    // Set time range (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Build search conditions with type safety
    const searchConditions = searchQuery
      ? {
          OR: [
            // Correct nested relation filter for admin name
            {
              admin: {
                name: {
                  contains: searchQuery,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
            // Correct Prisma JSON filtering syntax (if supported by your Prisma version)
            {
              details: {
                path: ["productName"],
                string_contains: searchQuery,
              },
            },
            {
              details: {
                path: ["collectionName"],
                string_contains: searchQuery,
              },
            },
            {
              details: {
                path: ["categoryName"],
                string_contains: searchQuery,
              },
            },
            // Optionally, filter action by enum values matching the search query
            ...Object.values(AdminAction)
              .filter((action) =>
                action.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((action) => ({
                action: action,
              })),
          ],
        }
      : {};

    // Only include adminId if it is defined
    const whereClause = {
      ...(userId ? { adminId: userId } : {}),
      createdAt: {
        gte: oneWeekAgo,
      },
      ...searchConditions,
    };

    // Get activities with pagination
    const [activities, totalCount] = await Promise.all([
      prisma.adminActivity.findMany({
        where: whereClause,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          admin: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.adminActivity.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Type-safe response
    res.status(200).json({
      success: true,
      activities: activities.map((activity) => ({
        ...activity,
        // Ensure details is properly typed in the response
        details: activity.details as Record<string, unknown>,
      })),
      currentPage: page,
      totalPages,
      totalItems: totalCount,
    });
  } catch (error: any) {
    console.error("Error fetching admin activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
