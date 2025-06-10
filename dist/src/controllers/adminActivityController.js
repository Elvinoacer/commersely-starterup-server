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
exports.getRecentAdminActivities = void 0;
const db_1 = __importDefault(require("../lib/db"));
const client_1 = require("@prisma/client"); // Make sure to import your AdminAction enum and Prisma for QueryMode
const ITEMS_PER_PAGE = 10;
const getRecentAdminActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const page = parseInt(req.query.page) || 1;
        const searchQuery = ((_c = req.query.search) === null || _c === void 0 ? void 0 : _c.trim()) || "";
        if (userRole !== "SUPER_ADMIN") {
            res.status(403).json({ success: false, message: "Unauthorized request" });
            return;
        }
        // Set time range (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        // Build search conditions with type safety
        const searchConditions = searchQuery
            ? {
                OR: [
                    // Correct nested relation filter for admin name
                    {
                        admin: {
                            name: {
                                contains: searchQuery,
                                mode: client_1.Prisma.QueryMode.insensitive,
                            },
                        },
                    },
                    // Correct Prisma JSON filtering syntax (if supported by your Prisma version)
                    {
                        details: {
                            path: ["productName"],
                            string_contains: searchQuery,
                        },
                    },
                    {
                        details: {
                            path: ["collectionName"],
                            string_contains: searchQuery,
                        },
                    },
                    {
                        details: {
                            path: ["categoryName"],
                            string_contains: searchQuery,
                        },
                    },
                    // Optionally, filter action by enum values matching the search query
                    ...Object.values(client_1.AdminAction)
                        .filter((action) => action.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((action) => ({
                        action: action,
                    })),
                ],
            }
            : {};
        // Only include adminId if it is defined
        const whereClause = Object.assign(Object.assign(Object.assign({}, (userId ? { adminId: userId } : {})), { createdAt: {
                gte: oneWeekAgo,
            } }), searchConditions);
        // Get activities with pagination
        const [activities, totalCount] = yield Promise.all([
            db_1.default.adminActivity.findMany({
                where: whereClause,
                skip: (page - 1) * ITEMS_PER_PAGE,
                take: ITEMS_PER_PAGE,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    admin: {
                        select: { id: true, name: true },
                    },
                },
            }),
            db_1.default.adminActivity.count({
                where: whereClause,
            }),
        ]);
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        // Type-safe response
        res.status(200).json({
            success: true,
            activities: activities.map((activity) => (Object.assign(Object.assign({}, activity), { 
                // Ensure details is properly typed in the response
                details: activity.details }))),
            currentPage: page,
            totalPages,
            totalItems: totalCount,
        });
    }
    catch (error) {
        console.error("Error fetching admin activities:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});
exports.getRecentAdminActivities = getRecentAdminActivities;
