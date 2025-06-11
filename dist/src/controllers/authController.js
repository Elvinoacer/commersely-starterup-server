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
exports.logout = exports.refreshAccessToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../lib/db"));
function generateToken(userId, email, role) {
    const accessToken = jsonwebtoken_1.default.sign({
        userId,
        email,
        role,
    }, process.env.JWT_ACCESS_SECRET, { expiresIn: "60m" });
    const refreshToken = jsonwebtoken_1.default.sign({
        userId,
        email,
        role,
    }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}
function setTokens(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === "production";
    const frontendDomain = isProduction
        ? "commersely-starterup.vercel.app"
        : "localhost";
    const commonOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? "none" : "lax"),
        path: "/",
        domain: isProduction ? ".commersely-starterup.vercel.app" : undefined,
    };
    res.cookie("accessToken", accessToken, Object.assign(Object.assign({}, commonOptions), { maxAge: 60 * 60 * 1000 }));
    res.cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, commonOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }));
}
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: "User with this email exists! Please login.",
            });
            return;
        }
        // Hash password and create user
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = yield db_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
            },
        });
        // Notify all SUPER_ADMIN users
        const admins = yield db_1.default.user.findMany({
            where: { role: "SUPER_ADMIN" },
            select: { id: true },
        });
        // Create a notification for each admin
        yield db_1.default.adminNotification.createMany({
            data: admins.map((admin) => ({
                adminId: admin.id,
                type: "NEW_USER_REGISTERED",
                details: {
                    userId: user.id,
                    userEmail: user.email,
                    userName: user.name,
                },
                isRead: false,
            })),
        });
        res.status(201).json({
            message: "User registered successfully",
            success: true,
            userId: user.id,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: (error === null || error === void 0 ? void 0 : error.message) ||
                "Registration failed, check your details and try again",
            success: false,
        });
    }
});
exports.register = register;
// Other functions (login, refreshAccessToken, logout) remain unchanged
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const extractCurrentUser = yield db_1.default.user.findUnique({
            where: { email },
            include: { wishlist: true },
        });
        if (!extractCurrentUser ||
            !(yield bcryptjs_1.default.compare(password, extractCurrentUser.password))) {
            res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
            return;
        }
        const { accessToken, refreshToken } = generateToken(extractCurrentUser.id, extractCurrentUser.email, extractCurrentUser.role);
        // Store refreshToken in the database
        yield db_1.default.user.update({
            where: { id: extractCurrentUser.id },
            data: { refreshToken },
        });
        yield setTokens(res, accessToken, refreshToken);
        res.status(200).json({
            success: true,
            message: "Login successfully",
            user: {
                id: extractCurrentUser.id,
                name: extractCurrentUser.name,
                email: extractCurrentUser.email,
                role: extractCurrentUser.role,
                wishlist: extractCurrentUser.wishlist,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
});
exports.login = login;
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({
            success: false,
            error: "Invalid refresh token",
        });
        return;
    }
    try {
        const user = yield db_1.default.user.findFirst({
            where: { refreshToken: refreshToken },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        const { accessToken, refreshToken: newRefreshToken } = generateToken(user.id, user.email, user.role);
        // Update refresh token in the database
        yield db_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });
        yield setTokens(res, accessToken, newRefreshToken);
        res.status(200).json({
            success: true,
            message: "Refresh token refreshed successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Refresh token error" });
    }
});
exports.refreshAccessToken = refreshAccessToken;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
    });
    res.clearCookie("refreshToken", {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
    });
    res.json({
        success: true,
        message: "User logged out successfully",
    });
});
exports.logout = logout;
