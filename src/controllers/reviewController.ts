import prisma from "../lib/db";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Helper function to update product rating
async function updateProductRating(productId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { rating: null },
    });
    return;
  }

  const avgRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: avgRating },
  });
}

// Create a new review
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    if (!productId || !rating || rating < 1 || rating > 5) {
      res
        .status(400)
        .json({ error: "Valid product ID and rating (1-5) are required" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error: any) {
    console.error("Error creating review:", error);
    if (error?.code === "P2002") {
      res.status(400).json({ error: "User has already reviewed this product" });
      return;
    }
    res.status(500).json({ error: "Failed to create review" });
  }
};

// Get all reviews for a product
export const getReviewsByProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(reviews);
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get a single review by ID
export const getReviewById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    res.status(200).json(review);
  } catch (error: any) {
    console.error("Error fetching review:", error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
};

// Update a review
export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    if (review.userId !== userId && userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating || review.rating,
        comment: comment !== undefined ? comment : review.comment,
      },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });

    // Update product rating
    await updateProductRating(review.productId);

    res.status(200).json(updatedReview);
  } catch (error: any) {
    console.error("Error updating review:", error);
    if (error?.code === "P2025") {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update review" });
  }
};

// Delete a review
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    if (review.userId !== userId && userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    await prisma.review.delete({ where: { id } });

    // Update product rating
    await updateProductRating(review.productId);

    res
      .status(204)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    if (error?.code === "P2025") {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    res.status(500).json({ error: "Failed to delete review" });
  }
};
