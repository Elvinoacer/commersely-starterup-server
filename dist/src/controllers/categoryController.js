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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const db_1 = __importDefault(require("../lib/db"));
// Create a new category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const { name, description } = req.body;
        if (!userId || userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        if (!name) {
            res
                .status(400)
                .json({ success: false, message: "Category name is required" });
            return;
        }
        const existingCategory = yield db_1.default.category.findUnique({
            where: { name },
        });
        if (existingCategory) {
            res
                .status(400)
                .json({ success: false, message: "Category name already exists" });
            return;
        }
        const category = yield db_1.default.category.create({
            data: {
                name,
                description,
            },
        });
        // Log admin activity
        yield db_1.default.adminActivity.create({
            data: {
                adminId: userId,
                action: "ADDED_COLLECTION",
                details: {
                    categoryId: category.id,
                    categoryName: category.name,
                },
            },
        });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        console.error("Error creating category:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2002") {
            res
                .status(400)
                .json({ success: false, message: "Category name already exists" });
            return;
        }
        res
            .status(500)
            .json({ success: false, message: "Failed to create category" });
    }
});
exports.createCategory = createCategory;
// Get all categories
// Get all categories with pagination and search
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const whereClause = {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ],
        };
        const [categories, totalItems] = yield Promise.all([
            db_1.default.category.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    products: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            db_1.default.category.count({
                where: whereClause,
            }),
        ]);
        res.status(200).json({
            success: true,
            data: categories,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
});
exports.getCategories = getCategories;
// Get a single category by ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield db_1.default.category.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: true,
                    },
                },
            },
        });
        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        console.error("Error fetching category:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch category" });
    }
});
exports.getCategoryById = getCategoryById;
// Update a category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const { id } = req.params;
        const { name, description } = req.body;
        if (!userId || userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        if (name) {
            const existingCategory = yield db_1.default.category.findUnique({
                where: { name },
            });
            if (existingCategory && existingCategory.id !== id) {
                res
                    .status(400)
                    .json({ success: false, message: "Category name already exists" });
                return;
            }
        }
        const category = yield db_1.default.category.update({
            where: { id },
            data: {
                name,
                description,
            },
        });
        // Log admin activity
        yield db_1.default.adminActivity.create({
            data: {
                adminId: userId,
                action: "UPDATED_CATEGORY",
                details: {
                    categoryId: category.id,
                    categoryName: category.name,
                },
            },
        });
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        console.error("Error updating category:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2002") {
            res
                .status(400)
                .json({ success: false, message: "Category name already exists" });
            return;
        }
        res
            .status(500)
            .json({ success: false, message: "Failed to update category" });
    }
});
exports.updateCategory = updateCategory;
// Delete a category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId || userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        const category = yield db_1.default.category.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }
        const productCount = yield db_1.default.product.count({
            where: { categoryId: id },
        });
        if (productCount > 0) {
            res.status(400).json({
                success: false,
                message: "Cannot delete category with associated products",
            });
            return;
        }
        // Log admin activity
        yield db_1.default.adminActivity.create({
            data: {
                adminId: userId,
                action: "REMOVED_CATEGORY",
                details: {
                    categoryId: category.id,
                    categoryName: category.name,
                },
            },
        });
        yield db_1.default.category.delete({
            where: { id },
        });
        res
            .status(204)
            .json({ success: true, message: "Category deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting category:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }
        res
            .status(500)
            .json({ success: false, message: "Failed to delete category" });
    }
});
exports.deleteCategory = deleteCategory;
