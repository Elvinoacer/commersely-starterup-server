"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getProductsForClient = exports.deleteProduct = exports.updateProduct = exports.getProductByID = exports.fetchAllProductsForAdmin = exports.createProduct = void 0;
const cloudinary_1 = __importStar(require("../config/cloudinary"));
const db_1 = __importDefault(require("../lib/db"));
// Create a product (admin)
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (userRole !== "SUPER_ADMIN" || !userId) {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        const { name, brand, description, categoryId, gender, sizes, colors, skus, price, stock, isFeatured, isOnOffer, offerPrice, } = req.body;
        if (!name ||
            !brand ||
            !categoryId ||
            !gender ||
            !sizes ||
            !colors ||
            !price ||
            !stock) {
            res.status(400).json({ error: "All required fields must be provided" });
            return;
        }
        const category = yield db_1.default.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        let parsedColors;
        try {
            parsedColors = JSON.parse(colors);
            if (!Array.isArray(parsedColors) ||
                !parsedColors.every((c) => c.hex && c.name)) {
                throw new Error("Invalid colors format");
            }
        }
        catch (e) {
            res.status(400).json({ error: "Invalid colors format" });
            return;
        }
        let parsedSkus;
        if (skus) {
            try {
                parsedSkus = JSON.parse(skus);
                if (!Array.isArray(parsedSkus) ||
                    !parsedSkus.every((s) => s.key && s.value)) {
                    throw new Error("Invalid SKUs format");
                }
            }
            catch (e) {
                res.status(400).json({ error: "Invalid SKUs format" });
                return;
            }
        }
        const files = req.files;
        const uploadPromises = files.map((file) => cloudinary_1.default.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, // 👈 Key change
        { folder: "ecommerce" }));
        const uploadResults = yield Promise.all(uploadPromises);
        const imageUrls = uploadResults.map((result) => result.secure_url);
        const newlyCreatedProduct = yield db_1.default.product.create({
            data: {
                name,
                brand,
                description,
                categoryId,
                gender,
                sizes: sizes.split(",").map((s) => s.trim()),
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
        yield db_1.default.adminActivity.create({
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
    }
    catch (error) {
        console.error("Error creating product:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2002") {
            res.status(400).json({ error: "Product with this name already exists" });
            return;
        }
        res.status(500).json({ success: false, message: "Some error occurred!" });
    }
});
exports.createProduct = createProduct;
// Fetch all products (admin)
const fetchAllProductsForAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { brand: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};
        const [products, total] = yield Promise.all([
            db_1.default.product.findMany({
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
            db_1.default.product.count({ where }),
        ]);
        res.status(200).json({
            success: true,
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Some error occurred!" });
    }
});
exports.fetchAllProductsForAdmin = fetchAllProductsForAdmin;
// Get a single product
const getProductByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield db_1.default.product.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Some error occurred!" });
    }
});
exports.getProductByID = getProductByID;
// Update a product (admin)
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId || userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        const { id } = req.params;
        const { name, brand, description, categoryId, gender, sizes, colors, skus, price, stock, isFeatured, removeImageUrls, isOnOffer, offerPrice, } = req.body;
        const existingProduct = yield db_1.default.product.findUnique({ where: { id } });
        if (!existingProduct) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        if (categoryId) {
            const category = yield db_1.default.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                res.status(404).json({ error: "Category not found" });
                return;
            }
        }
        let parsedColors;
        if (colors) {
            try {
                parsedColors = JSON.parse(colors);
                if (!Array.isArray(parsedColors) ||
                    !parsedColors.every((c) => c.hex && c.name)) {
                    throw new Error("Invalid colors format");
                }
            }
            catch (e) {
                res.status(400).json({ error: "Invalid colors format" });
                return;
            }
        }
        let parsedSkus;
        if (skus) {
            try {
                parsedSkus = JSON.parse(skus);
                if (!Array.isArray(parsedSkus) ||
                    !parsedSkus.every((s) => s.key && s.value)) {
                    throw new Error("Invalid SKUs format");
                }
            }
            catch (e) {
                res.status(400).json({ error: "Invalid SKUs format" });
                return;
            }
        }
        const files = req.files;
        let imageUrls = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => cloudinary_1.default.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, // 👈 Key change
            { folder: "ecommerce" }));
            const uploadResults = yield Promise.all(uploadPromises);
            imageUrls = uploadResults.map((result) => result.secure_url);
        }
        let updatedImages = existingProduct.images;
        if (removeImageUrls && Array.isArray(removeImageUrls)) {
            updatedImages = updatedImages.filter((url) => !removeImageUrls.includes(url));
            const deletePromises = removeImageUrls.map((url) => { var _a; return cloudinary_1.default.uploader.destroy(((_a = url.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0]) || ""); });
            yield Promise.all(deletePromises);
        }
        updatedImages = [...updatedImages, ...imageUrls];
        const product = yield db_1.default.product.update({
            where: { id },
            data: {
                name: name || existingProduct.name,
                brand: brand || existingProduct.brand,
                description: description || existingProduct.description,
                categoryId: categoryId || existingProduct.categoryId,
                gender: gender || existingProduct.gender,
                sizes: sizes
                    ? sizes.split(",").map((s) => s.trim())
                    : existingProduct.sizes,
                colors: parsedColors
                    ? JSON.stringify(parsedColors)
                    : existingProduct.colors !== null
                        ? existingProduct.colors
                        : undefined,
                skus: parsedSkus !== undefined
                    ? JSON.stringify(parsedSkus)
                    : existingProduct.skus !== null
                        ? existingProduct.skus
                        : undefined,
                price: price ? parseFloat(price) : existingProduct.price,
                stock: stock ? parseInt(stock) : existingProduct.stock,
                images: updatedImages.length > 0 ? updatedImages : existingProduct.images,
                isFeatured: isFeatured !== undefined
                    ? isFeatured === "true" || isFeatured === true
                    : existingProduct.isFeatured,
                isOnOffer: isOnOffer !== undefined
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
            yield db_1.default.adminActivity.create({
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
    }
    catch (error) {
        console.error("Error updating product:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.status(500).json({ success: false, message: "Some error occurred!" });
    }
});
exports.updateProduct = updateProduct;
// Delete a product (admin)
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId || userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        const { id } = req.params;
        const product = yield db_1.default.product.findUnique({ where: { id } });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        yield db_1.default.adminActivity.create({
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
            const publicId = (0, cloudinary_1.getPublicIdFromUrl)(url);
            return (0, cloudinary_1.deleteImageFromCloudinary)(publicId);
        });
        yield Promise.all(deletePromises);
        yield db_1.default.product.delete({ where: { id } });
        res
            .status(200)
            .json({ success: true, message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.status(500).json({ success: false, message: "Some error occurred!" });
    }
});
exports.deleteProduct = deleteProduct;
// Fetch products with filter (client)
const getProductsForClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const categoryIds = (req.query.categoryIds || "")
            .split(",")
            .filter(Boolean);
        const brands = (req.query.brands || "")
            .split(",")
            .filter(Boolean);
        const sizes = (req.query.sizes || "")
            .split(",")
            .filter(Boolean);
        const colors = (req.query.colors || "")
            .split(",")
            .filter(Boolean);
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder || "desc";
        const skip = (page - 1) * limit;
        const where = {
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
        const [products, total] = yield Promise.all([
            db_1.default.product.findMany({
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
            db_1.default.product.count({ where }),
        ]);
        res.status(200).json({
            success: true,
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Some error occurred!" });
    }
});
exports.getProductsForClient = getProductsForClient;
