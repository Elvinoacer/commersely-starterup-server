"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlistController_1 = require("../controllers/wishlistController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateJwt);
router.get("/get-wishlist", wishlistController_1.getWishlist);
router.post("/toggle-wishlist", wishlistController_1.toggleWishlist);
router.delete("/clear-wishlist", wishlistController_1.clearWishlist);
exports.default = router;
