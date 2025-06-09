import { Request, Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { logAdminNotification } from "../utils/logAdminNotification";
import { NotificationType } from "@prisma/client";

export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req?.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;

    if (!userId) {
      res.status(400).json({ message: "User ID required", success: false });
      return;
    }

    // Get total count of wishlist items
    const wishlist = await prisma.wishlist.findFirst({
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
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
export const toggleWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req?.user?.userId;
    const { productId } = req.body;

    if (!userId || !productId) {
      res.status(400).json({
        message: "User ID or product ID is undefined",
        success: false,
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found", success: false });
      return;
    }

    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: userId },
      include: { product: true },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
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

      await logAdminNotification({
        type: NotificationType.WISHLIST_ITEM_ADDED,
        details: {
          userId,
          userName: user?.name,
          userEmail: user?.email,
          productId,
          productName: product.name,
        },
      });

      res.status(200).json({
        wishlist,
        message: "Product added to wishlist",
        success: true,
      });
    } else {
      const isProductInWishlist = wishlist.product.some(
        (p) => p.id === productId
      );

      if (isProductInWishlist) {
        wishlist = await prisma.wishlist.update({
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
      } else {
        wishlist = await prisma.wishlist.update({
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

        await logAdminNotification({
          type: NotificationType.WISHLIST_ITEM_ADDED,
          details: {
            userId,
            userName: user?.name,
            userEmail: user?.email,
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
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const clearWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req?.user?.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is undefined", success: false });
      return;
    }

    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: userId },
    });

    if (!wishlist) {
      res.status(404).json({ message: "Wishlist not found", success: false });
      return;
    }

    const clearedWishlist = await prisma.wishlist.update({
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
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
