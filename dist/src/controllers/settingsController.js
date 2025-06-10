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
exports.getFeaturedProducts = exports.updateFeaturedProducts = exports.deleteFeatureBanner = exports.updateFeatureBanner = exports.fetchFeatureBanners = exports.addFeatureBanners = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const db_1 = __importDefault(require("../lib/db"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_2 = require("../config/cloudinary");
const MAX_BANNERS = 8;
const addFeatureBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                message: "No files provided",
            });
            return;
        }
        // Check current banner count
        const currentCount = yield db_1.default.featureBanner.count();
        if (currentCount + files.length > MAX_BANNERS) {
            // Clean up uploaded files
            files.forEach((file) => fs_1.default.unlinkSync(file.path));
            res.status(400).json({
                success: false,
                message: `Cannot exceed ${MAX_BANNERS} banners. Currently have ${currentCount} banners.`,
            });
            return;
        }
        const uploadPromises = files.map((file) => cloudinary_1.default.uploader.upload(file.path, {
            folder: "ecommerce-feature-banners",
        }));
        const uploadResults = yield Promise.all(uploadPromises);
        const banners = yield Promise.all(uploadResults.map((res) => db_1.default.featureBanner.create({
            data: {
                imageUrl: res.secure_url,
                cloudinaryId: res.public_id,
            },
        })));
        // Clean up uploaded files
        files.forEach((file) => fs_1.default.unlinkSync(file.path));
        res.status(201).json({
            success: true,
            banners,
        });
    }
    catch (e) {
        console.error(e);
        // Clean up any uploaded files if error occurred
        if (req.files) {
            req.files.forEach((file) => fs_1.default.unlinkSync(file.path));
        }
        res.status(500).json({
            success: false,
            message: "Failed to add feature banners",
        });
    }
});
exports.addFeatureBanners = addFeatureBanners;
const fetchFeatureBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield db_1.default.featureBanner.findMany({
            orderBy: { createdAt: "desc" },
            take: MAX_BANNERS,
        });
        res.status(200).json({
            success: true,
            banners,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to fetch feature banners",
        });
    }
});
exports.fetchFeatureBanners = fetchFeatureBanners;
const updateFeatureBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bannerId } = req.params;
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                message: "No file provided",
            });
            return;
        }
        // Find the existing banner
        const existingBanner = yield db_1.default.featureBanner.findUnique({
            where: { id: bannerId },
        });
        if (!existingBanner) {
            fs_1.default.unlinkSync(file.path);
            res.status(404).json({
                success: false,
                message: "Banner not found",
            });
            return;
        }
        // Upload new image to Cloudinary
        const uploadResult = yield cloudinary_1.default.uploader.upload(file.path, {
            folder: "ecommerce-feature-banners",
        });
        try {
            // Delete old image from Cloudinary if it exists
            if (existingBanner.cloudinaryId) {
                yield (0, cloudinary_2.deleteImageFromCloudinary)(existingBanner.cloudinaryId);
            }
            // Update the banner in database
            const updatedBanner = yield db_1.default.featureBanner.update({
                where: { id: bannerId },
                data: {
                    imageUrl: uploadResult.secure_url,
                    cloudinaryId: uploadResult.public_id,
                },
            });
            // Clean up uploaded file
            fs_1.default.unlinkSync(file.path);
            res.status(200).json({
                success: true,
                banner: updatedBanner,
            });
        }
        catch (updateError) {
            // If update fails, delete the newly uploaded image from Cloudinary
            yield (0, cloudinary_2.deleteImageFromCloudinary)(uploadResult.public_id);
            fs_1.default.unlinkSync(file.path);
            throw updateError;
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to update feature banner",
        });
    }
});
exports.updateFeatureBanner = updateFeatureBanner;
const deleteFeatureBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bannerId } = req.params;
        // Find the banner first to get Cloudinary ID
        const banner = yield db_1.default.featureBanner.findUnique({
            where: { id: bannerId },
        });
        if (!banner) {
            res.status(404).json({
                success: false,
                message: "Banner not found",
            });
            return;
        }
        // Delete from Cloudinary if cloudinaryId exists
        if (banner.cloudinaryId) {
            yield (0, cloudinary_2.deleteImageFromCloudinary)(banner.cloudinaryId);
        }
        // Delete from database
        yield db_1.default.featureBanner.delete({
            where: { id: bannerId },
        });
        res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to delete feature banner",
        });
    }
});
exports.deleteFeatureBanner = deleteFeatureBanner;
// Your existing featured products functions remain the same
const updateFeaturedProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) {
            res.status(400).json({
                success: false,
                message: "Invalid product Ids format",
            });
            return;
        }
        if (productIds.length > MAX_BANNERS) {
            res.status(400).json({
                success: false,
                message: `Cannot feature more than ${MAX_BANNERS} products`,
            });
            return;
        }
        // Reset all products to not featured
        yield db_1.default.product.updateMany({
            data: { isFeatured: false },
        });
        // Set selected products as featured
        yield db_1.default.product.updateMany({
            where: { id: { in: productIds } },
            data: { isFeatured: true },
        });
        res.status(200).json({
            success: true,
            message: "Featured products updated successfully!",
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to update feature products",
        });
    }
});
exports.updateFeaturedProducts = updateFeaturedProducts;
const getFeaturedProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const featuredProducts = yield db_1.default.product.findMany({
            where: { isFeatured: true }, // Only fetch featured products
        });
        res.status(200).json({
            success: true,
            featuredProducts,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to fetch feature products",
        });
    }
});
exports.getFeaturedProducts = getFeaturedProducts;
