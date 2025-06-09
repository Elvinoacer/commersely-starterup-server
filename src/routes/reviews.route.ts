import express from "express";
import {
  createReview,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";
import { authenticateJwt } from "../middleware/authMiddleware";

const router = express.Router();

// Middleware to check if user is authenticated

// Create a new review (POST /api/reviews)
router.post("/", authenticateJwt, createReview);

// Get all reviews for a product (GET /api/reviews/product/:productId)
router.get("/product/:productId", getReviewsByProduct);

// Get a single review by ID (GET /api/reviews/:id)
router.get("/:id", getReviewById);

// Update a review (PUT /api/reviews/:id)
router.put("/:id", authenticateJwt, updateReview);

// Delete a review (DELETE /api/reviews/:id)
router.delete("/:id", authenticateJwt, deleteReview);

export default router;
