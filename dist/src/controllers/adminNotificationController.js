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
exports.clearAllNotifications = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getAdminNotifications = void 0;
const db_1 = __importDefault(require("../lib/db"));
const getAdminNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { page = "1", limit = "10", search = "" } = req.query;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if ((user === null || user === void 0 ? void 0 : user.role) !== "SUPER_ADMIN") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
            return;
        }
        const searchLower = search.toLowerCase();
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        if (search) {
            // Execute raw SQL queries for search
            const notifications = yield db_1.default.$queryRaw `
        SELECT * FROM "AdminNotification"
        WHERE 
          "adminId" = ${userId} AND
          (
            LOWER("type"::text) LIKE ${`%${searchLower}%`} OR
            LOWER("details"::text) LIKE ${`%${searchLower}%`}
          )
        ORDER BY "createdAt" DESC
        LIMIT ${limitNum}
        OFFSET ${skip}
      `;
            const totalCountResult = yield db_1.default.$queryRaw `
        SELECT COUNT(*) FROM "AdminNotification"
        WHERE 
          "adminId" = ${userId} AND
          (
            LOWER("type"::text) LIKE ${`%${searchLower}%`} OR
            LOWER("details"::text) LIKE ${`%${searchLower}%`}
          )
      `;
            const totalItems = parseInt(totalCountResult[0].count);
            res.status(200).json({
                success: true,
                data: notifications,
                pagination: {
                    currentPage: pageNum,
                    itemsPerPage: limitNum,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limitNum),
                },
            });
            return;
        }
        // Regular non-search query
        const [notifications, totalItems] = yield Promise.all([
            db_1.default.adminNotification.findMany({
                where: { adminId: userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
                include: {
                    admin: {
                        select: { name: true, email: true },
                    },
                },
            }),
            db_1.default.adminNotification.count({
                where: { adminId: userId },
            }),
        ]);
        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                currentPage: pageNum,
                itemsPerPage: limitNum,
                totalItems,
                totalPages: Math.ceil(totalItems / limitNum),
            },
        });
    }
    catch (e) {
        console.error("Error fetching notifications:", e);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
});
exports.getAdminNotifications = getAdminNotifications;
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { notificationId } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if ((user === null || user === void 0 ? void 0 : user.role) !== "SUPER_ADMIN") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
            return;
        }
        const notification = yield db_1.default.adminNotification.findUnique({
            where: {
                id: notificationId,
                adminId: userId,
            },
        });
        if (!notification) {
            res.status(404).json({
                success: false,
                message: "Notification not found",
            });
            return;
        }
        const updatedNotification = yield db_1.default.adminNotification.update({
            where: {
                id: notificationId,
                adminId: userId,
            },
            data: {
                isRead: true,
            },
            include: {
                admin: {
                    select: { name: true, email: true },
                },
            },
        });
        res.status(200).json({
            success: true,
            data: updatedNotification,
            message: "Notification marked as read",
        });
    }
    catch (e) {
        console.error("Error marking notification as read:", e);
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if ((user === null || user === void 0 ? void 0 : user.role) !== "SUPER_ADMIN") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
            return;
        }
        yield db_1.default.adminNotification.updateMany({
            where: {
                adminId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    }
    catch (e) {
        console.error("Error marking all notifications as read:", e);
        res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read",
        });
    }
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { notificationId } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if ((user === null || user === void 0 ? void 0 : user.role) !== "SUPER_ADMIN") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
            return;
        }
        const notification = yield db_1.default.adminNotification.findUnique({
            where: {
                id: notificationId,
                adminId: userId,
            },
        });
        if (!notification) {
            res.status(404).json({
                success: false,
                message: "Notification not found",
            });
            return;
        }
        yield db_1.default.adminNotification.delete({
            where: {
                id: notificationId,
                adminId: userId,
            },
        });
        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    }
    catch (e) {
        console.error("Error deleting notification:", e);
        res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
});
exports.deleteNotification = deleteNotification;
const clearAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if ((user === null || user === void 0 ? void 0 : user.role) !== "SUPER_ADMIN") {
            res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
            return;
        }
        yield db_1.default.adminNotification.deleteMany({
            where: {
                adminId: userId,
            },
        });
        res.status(200).json({
            success: true,
            message: "All notifications cleared successfully",
        });
    }
    catch (e) {
        console.error("Error clearing all notifications:", e);
        res.status(500).json({
            success: false,
            message: "Failed to clear all notifications",
        });
    }
});
exports.clearAllNotifications = clearAllNotifications;
