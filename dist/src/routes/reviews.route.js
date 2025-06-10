"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Middleware to check if user is authenticated
// Create a new review (POST /api/reviews)
router.post("/", authMiddleware_1.authenticateJwt, reviewController_1.createReview);
// Get all reviews for a product (GET /api/reviews/product/:productId)
router.get("/product/:productId", reviewController_1.getReviewsByProduct);
// Get a single review by ID (GET /api/reviews/:id)
router.get("/:id", reviewController_1.getReviewById);
// Update a review (PUT /api/reviews/:id)
router.put("/:id", authMiddleware_1.authenticateJwt, reviewController_1.updateReview);
// Delete a review (DELETE /api/reviews/:id)
router.delete("/:id", authMiddleware_1.authenticateJwt, reviewController_1.deleteReview);
exports.default = router;
