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
exports.getCashOnDeliverySetting = exports.updateCashOnDeliverySetting = void 0;
const db_1 = __importDefault(require("../lib/db"));
const updateCashOnDeliverySetting = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { isCashOnDelivery } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        // Ensure the user is a SUPER_ADMIN
        const user = yield db_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if ((user === null || user === void 0 ? void 0 : user.role) !== "SUPER_ADMIN") {
            res.status(403).json({
                success: false,
                message: "Only super admins can update settings",
            });
            return;
        }
        // Upsert the setting (create if it doesn't exist, update if it does)
        const setting = yield db_1.default.setting.upsert({
            where: { id: "global_settings" },
            update: { isCashOnDelivery },
            create: {
                id: "global_settings",
                isCashOnDelivery,
            },
        });
        res.status(200).json({
            success: true,
            message: "Cash on Delivery setting updated successfully",
            data: setting,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Unexpected error occurred!",
        });
    }
});
exports.updateCashOnDeliverySetting = updateCashOnDeliverySetting;
const getCashOnDeliverySetting = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield db_1.default.setting.findUnique({
            where: { id: "global_settings" },
        });
        res.status(200).json({
            success: true,
            data: setting || { id: "global_settings", isCashOnDelivery: true },
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Unexpected error occurred!",
        });
    }
});
exports.getCashOnDeliverySetting = getCashOnDeliverySetting;
