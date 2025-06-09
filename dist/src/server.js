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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./lib/db"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const adminsettingsRoutes_1 = __importDefault(require("./routes/adminsettingsRoutes"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const customer_route_1 = __importDefault(require("./routes/customer.route"));
const reviews_route_1 = __importDefault(require("./routes/reviews.route"));
const email_route_1 = __importDefault(require("./routes/email.route"));
const adminActivityRoutes_1 = __importDefault(require("./routes/adminActivityRoutes"));
const adminNotificationRoute_1 = __importDefault(require("./routes/adminNotificationRoute"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const paymentRoute_1 = __importDefault(require("./routes/paymentRoute"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "10000", 10);
const corsOptions = {
    origin: [
        "https://commersely-starterup.vercel.app/",
        "http://localhost:3000",
        "https://3888-197-136-187-86.ngrok-free.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.json("Hello there, check this out, https://elvin-juma-portfolio.vercel.app/");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/coupon", couponRoutes_1.default);
app.use("/api/settings", settingRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/address", addressRoutes_1.default);
app.use("/api/order", orderRoutes_1.default);
app.use("/api/wishlist", wishlist_1.default);
app.use("/api/customers", customer_route_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/reviews", reviews_route_1.default);
app.use("/api/emails", email_route_1.default);
app.use("/api/admin-activities", adminActivityRoutes_1.default);
app.use("/api/admin", adminNotificationRoute_1.default);
app.use("/api/admin-settings", adminsettingsRoutes_1.default);
app.use("/api/admin-analytics", analyticsRoutes_1.default);
app.use("/api/payment", paymentRoute_1.default);
app.use("/api/subscriptions", subscription_routes_1.default);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is now running on port ${PORT}`);
});
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.$disconnect();
    process.exit();
}));
process.on("uncaughtException", (err) => __awaiter(void 0, void 0, void 0, function* () {
    console.error("Uncaught Exception:", err);
    yield db_1.default.$disconnect();
    process.exit(1);
}));
process.on("unhandledRejection", (err) => __awaiter(void 0, void 0, void 0, function* () {
    console.error("Unhandled Rejection:", err);
    yield db_1.default.$disconnect();
    process.exit(1);
}));
