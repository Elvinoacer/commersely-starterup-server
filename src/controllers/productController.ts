import { Prisma } from "@prisma/client";
import { Response } from "express";
import cloudinary, {
  deleteImageFromCloudinary,
  getPublicIdFromUrl,
} from "../config/cloudinary";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

interface Color {
  hex: string;
  name: string;
}

interface Sku {
  key: string;
  value: string;
}

// Create a product (admin)
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    if (userRole !== "SUPER_ADMIN" || !userId) {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const {
      name,
      brand,
      description,
      categoryId,
      gender,
      sizes,
      colors,
      skus,
      price,
      stock,
      isFeatured,
      isOnOffer,
      offerPrice,
    } = req.body;

    if (
      !name ||
      !brand ||
      !categoryId ||
      !gender ||
      !sizes ||
      !colors ||
      !price ||
      !stock
    ) {
      res.status(400).json({ error: "All required fields must be provided" });
      return;
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    let parsedColors: Color[];
    try {
      parsedColors = JSON.parse(colors);
      if (
        !Array.isArray(parsedColors) ||
        !parsedColors.every((c) => c.hex && c.name)
      ) {
        throw new Error("Invalid colors format");
      }
    } catch (e) {
      res.status(400).json({ error: "Invalid colors format" });
      return;
    }

    let parsedSkus: Sku[] | undefined;
    if (skus) {
      try {
        parsedSkus = JSON.parse(skus);
        if (
          !Array.isArray(parsedSkus) ||
          !parsedSkus.every((s) => s.key && s.value)
        ) {
          throw new Error("Invalid SKUs format");
        }
      } catch (e) {
        res.status(400).json({ error: "Invalid SKUs format" });
        return;
      }
    }

    const files = req.files as Express.Multer.File[];
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`, // 👈 Key change
        { folder: "ecommerce" }
      )
    );

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    const newlyCreatedProduct = await prisma.product.create({
      data: {
        name,
        brand,
        description,
        categoryId,
        gender,
        sizes: sizes.split(",").map((s: string) => s.trim()),
        colors: JSON.stringify(parsedColors),
        skus: parsedSkus ? JSON.stringify(parsedSkus) : undefined,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: imageUrls,
        soldCount: 0,
        isFeatured: isFeatured === "true" || isFeatured === true,
        isOnOffer: isOnOffer === "true" || isOnOffer === true,
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    await prisma.adminActivity.create({
      data: {
        adminId: userId,
        action: "ADDED_PRODUCT",
        details: {
          productId: newlyCreatedProduct.id,
          productName: newlyCreatedProduct.name,
          categoryName: category.name,
        },
      },
    });

    // files.forEach((file) => fs.unlinkSync(file.path));
    res.status(201).json(newlyCreatedProduct);
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error?.code === "P2002") {
      res.status(400).json({ error: "Product with this name already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Fetch all products (admin)
export const fetchAllProductsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    const where: Prisma.productWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          reviews: {
            select: { id: true, rating: true, comment: true, createdAt: true },
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Get a single product
export const getProductByID = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Update a product (admin)
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    if (!userId || userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const { id } = req.params;
    const {
      name,
      brand,
      description,
      categoryId,
      gender,
      sizes,
      colors,
      skus,
      price,
      stock,
      isFeatured,
      removeImageUrls,
      isOnOffer,
      offerPrice,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
    }

    let parsedColors: Color[] | undefined;
    if (colors) {
      try {
        parsedColors = JSON.parse(colors);
        if (
          !Array.isArray(parsedColors) ||
          !parsedColors.every((c) => c.hex && c.name)
        ) {
          throw new Error("Invalid colors format");
        }
      } catch (e) {
        res.status(400).json({ error: "Invalid colors format" });
        return;
      }
    }

    let parsedSkus: Sku[] | undefined;
    if (skus) {
      try {
        parsedSkus = JSON.parse(skus);
        if (
          !Array.isArray(parsedSkus) ||
          !parsedSkus.every((s) => s.key && s.value)
        ) {
          throw new Error("Invalid SKUs format");
        }
      } catch (e) {
        res.status(400).json({ error: "Invalid SKUs format" });
        return;
      }
    }

    const files = req.files as Express.Multer.File[];
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`, // 👈 Key change
          { folder: "ecommerce" }
        )
      );
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    let updatedImages = existingProduct.images;
    if (removeImageUrls && Array.isArray(removeImageUrls)) {
      updatedImages = updatedImages.filter(
        (url) => !removeImageUrls.includes(url)
      );
      const deletePromises = removeImageUrls.map((url: string) =>
        cloudinary.uploader.destroy(url.split("/").pop()?.split(".")[0] || "")
      );
      await Promise.all(deletePromises);
    }

    updatedImages = [...updatedImages, ...imageUrls];

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        brand: brand || existingProduct.brand,
        description: description || existingProduct.description,
        categoryId: categoryId || existingProduct.categoryId,
        gender: gender || existingProduct.gender,
        sizes: sizes
          ? sizes.split(",").map((s: string) => s.trim())
          : existingProduct.sizes,
        colors: parsedColors
          ? JSON.stringify(parsedColors)
          : existingProduct.colors !== null
          ? existingProduct.colors
          : undefined,
        skus:
          parsedSkus !== undefined
            ? JSON.stringify(parsedSkus)
            : existingProduct.skus !== null
            ? existingProduct.skus
            : undefined,
        price: price ? parseFloat(price) : existingProduct.price,
        stock: stock ? parseInt(stock) : existingProduct.stock,
        images:
          updatedImages.length > 0 ? updatedImages : existingProduct.images,
        isFeatured:
          isFeatured !== undefined
            ? isFeatured === "true" || isFeatured === true
            : existingProduct.isFeatured,
        isOnOffer:
          isOnOffer !== undefined
            ? isOnOffer === "true" || isOnOffer === true
            : existingProduct.isOnOffer,
        offerPrice: offerPrice
          ? parseFloat(offerPrice)
          : existingProduct.offerPrice,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    if (stock && parseInt(stock) === 0 && existingProduct.stock > 0) {
      await prisma.adminActivity.create({
        data: {
          adminId: userId,
          action: "OUT_OF_STOCK",
          details: {
            productId: product.id,
            productName: product.name,
            categoryName: product.category.name,
          },
        },
      });
    }

    // if (files && files.length > 0) {
    //   files.forEach((file) => fs.unlinkSync(file.path));
    // }

    res.status(200).json(product);
  } catch (error: any) {
    console.error("Error updating product:", error);
    if (error?.code === "P2025") {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Delete a product (admin)
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    if (!userId || userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await prisma.adminActivity.create({
      data: {
        adminId: userId,
        action: "DELETED_PRODUCTS",
        details: {
          productId: product.id,
          productName: product.name,
          categoryId: product.categoryId,
        },
      },
    });

    const deletePromises = product.images.map((url) => {
      const publicId = getPublicIdFromUrl(url);
      return deleteImageFromCloudinary(publicId);
    });
    await Promise.all(deletePromises);

    await prisma.product.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    if (error?.code === "P2025") {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Fetch products with filter (client)
export const getProductsForClient = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryIds = ((req.query.categoryIds as string) || "")
      .split(",")
      .filter(Boolean);
    const brands = ((req.query.brands as string) || "")
      .split(",")
      .filter(Boolean);
    const sizes = ((req.query.sizes as string) || "")
      .split(",")
      .filter(Boolean);
    const colors = ((req.query.colors as string) || "")
      .split(",")
      .filter(Boolean);
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice =
      parseFloat(req.query.maxPrice as string) || Number.MAX_SAFE_INTEGER;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const skip = (page - 1) * limit;

    const where: Prisma.productWhereInput = {
      AND: [
        categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {},
        brands.length > 0 ? { brand: { in: brands, mode: "insensitive" } } : {},
        sizes.length > 0 ? { sizes: { hasSome: sizes } } : {},
        colors.length > 0
          ? {
              colors: {
                array_contains: colors.map((c) => ({ hex: c, name: c })),
              },
            }
          : {},
        {
          price: { gte: minPrice, lte: maxPrice },
        },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          category: { select: { id: true, name: true } },
          reviews: {
            select: { id: true, rating: true, comment: true, createdAt: true },
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};
