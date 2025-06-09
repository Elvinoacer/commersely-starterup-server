import prisma from "../lib/db";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Create a new category
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    const { name, description } = req.body;

    if (!userId || userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    if (!name) {
      res
        .status(400)
        .json({ success: false, message: "Category name is required" });
      return;
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: userId,
        action: "ADDED_COLLECTION",
        details: {
          categoryId: category.id,
          categoryName: category.name,
        },
      },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error?.code === "P2002") {
      res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
      return;
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to create category" });
  }
};

// Get all categories
// Get all categories with pagination and search
export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    const whereClause = {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    };

    const [categories, totalItems] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.category.count({
        where: whereClause,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};
// Get a single category by ID
export const getCategoryById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    res.status(200).json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error fetching category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch category" });
  }
};

// Update a category
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req?.user?.role;
    const userId = req?.user?.userId;
    const { id } = req.params;
    const { name, description } = req.body;
    if (!userId || userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    if (name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name },
      });
      if (existingCategory && existingCategory.id !== id) {
        res
          .status(400)
          .json({ success: false, message: "Category name already exists" });
        return;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: userId,
        action: "UPDATED_CATEGORY",
        details: {
          categoryId: category.id,
          categoryName: category.name,
        },
      },
    });

    res.status(200).json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error updating category:", error);
    if (error?.code === "P2025") {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    if (error?.code === "P2002") {
      res
        .status(400)
        .json({ success: false, message: "Category name already exists" });
      return;
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to update category" });
  }
};

// Delete a category
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req?.user?.role;
    const userId = req.user?.userId;
    if (!userId || userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: "Cannot delete category with associated products",
      });
      return;
    }

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: userId,
        action: "REMOVED_CATEGORY",
        details: {
          categoryId: category.id,
          categoryName: category.name,
        },
      },
    });

    await prisma.category.delete({
      where: { id },
    });

    res
      .status(204)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    if (error?.code === "P2025") {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category" });
  }
};
