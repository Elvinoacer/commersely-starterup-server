import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import prisma from "../lib/db";
import fs from "fs";
import {
  deleteImageFromCloudinary,
  getPublicIdFromUrl,
} from "../config/cloudinary";

const MAX_BANNERS = 8;

export const addFeatureBanners = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No files provided",
      });
      return;
    }

    // Check current banner count
    const currentCount = await prisma.featureBanner.count();
    if (currentCount + files.length > MAX_BANNERS) {
      // Clean up uploaded files
      files.forEach((file) => fs.unlinkSync(file.path));

      res.status(400).json({
        success: false,
        message: `Cannot exceed ${MAX_BANNERS} banners. Currently have ${currentCount} banners.`,
      });
      return;
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "ecommerce-feature-banners",
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const banners = await Promise.all(
      uploadResults.map((res) =>
        prisma.featureBanner.create({
          data: {
            imageUrl: res.secure_url,
            cloudinaryId: res.public_id,
          },
        })
      )
    );

    // Clean up uploaded files
    files.forEach((file) => fs.unlinkSync(file.path));

    res.status(201).json({
      success: true,
      banners,
    });
  } catch (e) {
    console.error(e);
    // Clean up any uploaded files if error occurred
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach((file) =>
        fs.unlinkSync(file.path)
      );
    }
    res.status(500).json({
      success: false,
      message: "Failed to add feature banners",
    });
  }
};

export const fetchFeatureBanners = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const banners = await prisma.featureBanner.findMany({
      orderBy: { createdAt: "desc" },
      take: MAX_BANNERS,
    });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feature banners",
    });
  }
};

export const updateFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { bannerId } = req.params;
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No file provided",
      });
      return;
    }

    // Find the existing banner
    const existingBanner = await prisma.featureBanner.findUnique({
      where: { id: bannerId },
    });

    if (!existingBanner) {
      fs.unlinkSync(file.path);
      res.status(404).json({
        success: false,
        message: "Banner not found",
      });
      return;
    }

    // Upload new image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "ecommerce-feature-banners",
    });

    try {
      // Delete old image from Cloudinary if it exists
      if (existingBanner.cloudinaryId) {
        await deleteImageFromCloudinary(existingBanner.cloudinaryId);
      }

      // Update the banner in database
      const updatedBanner = await prisma.featureBanner.update({
        where: { id: bannerId },
        data: {
          imageUrl: uploadResult.secure_url,
          cloudinaryId: uploadResult.public_id,
        },
      });

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      res.status(200).json({
        success: true,
        banner: updatedBanner,
      });
    } catch (updateError) {
      // If update fails, delete the newly uploaded image from Cloudinary
      await deleteImageFromCloudinary(uploadResult.public_id);
      fs.unlinkSync(file.path);
      throw updateError;
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to update feature banner",
    });
  }
};

export const deleteFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { bannerId } = req.params;

    // Find the banner first to get Cloudinary ID
    const banner = await prisma.featureBanner.findUnique({
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
      await deleteImageFromCloudinary(banner.cloudinaryId);
    }

    // Delete from database
    await prisma.featureBanner.delete({
      where: { id: bannerId },
    });

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to delete feature banner",
    });
  }
};

// Your existing featured products functions remain the same
export const updateFeaturedProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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
    await prisma.product.updateMany({
      data: { isFeatured: false },
    });

    // Set selected products as featured
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { isFeatured: true },
    });

    res.status(200).json({
      success: true,
      message: "Featured products updated successfully!",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to update feature products",
    });
  }
};

export const getFeaturedProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true }, // Only fetch featured products
    });
    res.status(200).json({
      success: true,
      featuredProducts,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feature products",
    });
  }
};
