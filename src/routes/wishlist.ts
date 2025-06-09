import express from "express";
import {
  toggleWishlist,
  clearWishlist,
  getWishlist,
} from "../controllers/wishlistController";
import { authenticateJwt } from "../middleware/authMiddleware";
const router = express.Router();

router.use(authenticateJwt);

router.get("/get-wishlist", getWishlist);
router.post("/toggle-wishlist", toggleWishlist);
router.delete("/clear-wishlist", clearWishlist);

export default router;
