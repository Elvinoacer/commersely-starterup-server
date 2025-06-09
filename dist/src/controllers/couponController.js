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
exports.deleteCoupon = exports.fetchAllCoupons = exports.createCoupon = void 0;
const db_1 = __importDefault(require("../lib/db"));
const createCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, discountPercent, startDate, endDate, usageLimit } = req.body;
        const newlyCreatedCoupon = yield db_1.default.coupon.create({
            data: {
                code,
                discountPercent: parseInt(discountPercent),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                usageLimit: parseInt(usageLimit),
                usageCount: 0,
            },
        });
        res.status(201).json({
            success: true,
            message: "Coupon created successfully!",
            coupon: newlyCreatedCoupon,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to created coupon",
        });
    }
});
exports.createCoupon = createCoupon;
const fetchAllCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get total count of coupons
        const totalItems = yield db_1.default.coupon.count();
        const fetchAllCouponsList = yield db_1.default.coupon.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "asc" },
        });
        res.status(200).json({
            success: true,
            message: "Coupons fetched successfully!",
            couponList: fetchAllCouponsList,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to fetch coupon list",
        });
    }
});
exports.fetchAllCoupons = fetchAllCoupons;
const deleteCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db_1.default.coupon.delete({
            where: { id },
        });
        res.status(201).json({
            success: true,
            message: "Coupon deleted successfully!",
            id: id,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Failed to delete coupon",
        });
    }
});
exports.deleteCoupon = deleteCoupon;
