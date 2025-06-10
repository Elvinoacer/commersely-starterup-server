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
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getReviewsByProduct = exports.createReview = void 0;
const db_1 = __importDefault(require("../lib/db"));
// Helper function to update product rating
function updateProductRating(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const reviews = yield db_1.default.review.findMany({
            where: { productId },
            select: { rating: true },
        });
        if (reviews.length === 0) {
            yield db_1.default.product.update({
                where: { id: productId },
                data: { rating: null },
            });
            return;
        }
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        yield db_1.default.product.update({
            where: { id: productId },
            data: { rating: avgRating },
        });
    });
}
// Create a new review
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId, rating, comment } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const product = yield db_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        const review = yield db_1.default.review.create({
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
        yield updateProductRating(productId);
        res.status(201).json(review);
    }
    catch (error) {
        console.error("Error creating review:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2002") {
            res.status(400).json({ error: "User has already reviewed this product" });
            return;
        }
        res.status(500).json({ error: "Failed to create review" });
    }
});
exports.createReview = createReview;
// Get all reviews for a product
const getReviewsByProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const reviews = yield db_1.default.review.findMany({
            where: { productId },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});
exports.getReviewsByProduct = getReviewsByProduct;
// Get a single review by ID
const getReviewById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const review = yield db_1.default.review.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching review:", error);
        res.status(500).json({ error: "Failed to fetch review" });
    }
});
exports.getReviewById = getReviewById;
// Update a review
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId) {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        if (rating && (rating < 1 || rating > 5)) {
            res.status(400).json({ error: "Rating must be between 1 and 5" });
            return;
        }
        const review = yield db_1.default.review.findUnique({ where: { id } });
        if (!review) {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        if (review.userId !== userId && userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        const updatedReview = yield db_1.default.review.update({
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
        yield updateProductRating(review.productId);
        res.status(200).json(updatedReview);
    }
    catch (error) {
        console.error("Error updating review:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        res.status(500).json({ error: "Failed to update review" });
    }
});
exports.updateReview = updateReview;
// Delete a review
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId) {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        const review = yield db_1.default.review.findUnique({ where: { id } });
        if (!review) {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        if (review.userId !== userId && userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        yield db_1.default.review.delete({ where: { id } });
        // Update product rating
        yield updateProductRating(review.productId);
        res
            .status(204)
            .json({ success: true, message: "Review deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting review:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        res.status(500).json({ error: "Failed to delete review" });
    }
});
exports.deleteReview = deleteReview;
