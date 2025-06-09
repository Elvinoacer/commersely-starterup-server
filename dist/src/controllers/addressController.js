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
exports.deleteAddress = exports.updateAddress = exports.getAddresses = exports.createAddress = void 0;
const db_1 = __importDefault(require("../lib/db"));
const createAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthenticated user",
        });
        return;
    }
    const { name, address, city, country, postalCode, phone, isDefault } = req.body;
    if (isDefault) {
        yield db_1.default.address.updateMany({
            where: { userId },
            data: {
                isDefault: false,
            },
        });
    }
    const newlyCreatedAddress = yield db_1.default.address.create({
        data: {
            userId,
            name,
            address,
            city,
            country,
            postalCode,
            phone,
            isDefault: isDefault || false,
        },
    });
    res.status(201).json({
        success: true,
        address: newlyCreatedAddress,
    });
    try {
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
});
exports.createAddress = createAddress;
const getAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const fetchedAllAddresses = yield db_1.default.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({
            success: true,
            address: fetchedAllAddresses,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
});
exports.getAddresses = getAddresses;
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const existingAddress = yield db_1.default.address.findFirst({
            where: { id, userId },
        });
        if (!existingAddress) {
            res.status(404).json({
                success: false,
                message: "Address not found!",
            });
            return;
        }
        const { name, address, city, country, postalCode, phone, isDefault } = req.body;
        if (isDefault) {
            yield db_1.default.address.updateMany({
                where: { userId },
                data: {
                    isDefault: false,
                },
            });
        }
        const updatedAddress = yield db_1.default.address.update({
            where: { id },
            data: {
                name,
                address,
                city,
                country,
                postalCode,
                phone,
                isDefault: isDefault || false,
            },
        });
        res.status(200).json({
            success: true,
            address: updatedAddress,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
});
exports.updateAddress = updateAddress;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthenticated user",
            });
            return;
        }
        const existingAddress = yield db_1.default.address.findFirst({
            where: { id, userId },
        });
        if (!existingAddress) {
            res.status(404).json({
                success: false,
                message: "Address not found!",
            });
            return;
        }
        yield db_1.default.address.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "Address deleted successfully!",
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
});
exports.deleteAddress = deleteAddress;
