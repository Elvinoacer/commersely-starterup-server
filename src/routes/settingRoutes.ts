import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import {
  addFeatureBanners,
  deleteFeatureBanner,
  fetchFeatureBanners,
  getFeaturedProducts,
  updateFeatureBanner,
  updateFeaturedProducts,
} from "../controllers/settingsController";

const router = express.Router();

router.post(
  "/banners",
  authenticateJwt,
  isSuperAdmin,
  upload.array("images", 5),
  addFeatureBanners
);

router.put(
  "/banners/:bannerId",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  updateFeatureBanner
);

router.get("/get-banners", fetchFeatureBanners);
router.delete(
  "/banners/:bannerId",
  authenticateJwt,
  isSuperAdmin,
  deleteFeatureBanner
);
router.post(
  "/update-feature-products",
  authenticateJwt,
  isSuperAdmin,
  updateFeaturedProducts
);
router.get("/fetch-feature-products", getFeaturedProducts);

export default router;
