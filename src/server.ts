import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import prisma from "./lib/db";
import addressRoutes from "./routes/addressRoutes";
import adminActivityRoutes from "./routes/adminActivityRoutes";
import adminNotificationRouter from "./routes/adminNotificationRoute";
import adminSettings from "./routes/adminsettingsRoutes";
import adminAnalytics from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import couponRoutes from "./routes/couponRoutes";
import customerRoutes from "./routes/customer.route";
import emailRoutes from "./routes/email.route";
import orderRoutes from "./routes/orderRoutes";
import paymentRoute from "./routes/paymentRoute";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviews.route";
import settingsRoutes from "./routes/settingRoutes";
import subscriptionRoutes from "./routes/subscription.routes";
import wishlistRoute from "./routes/wishlist";

dotenv.config();
const app = express();
const PORT = parseInt("3001", 10);

// const corsOptions = {
//   origin: ["https://commersely-starterup.vercel.app", "http://localhost:3000"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "Accept",
//     "Cookie",
//     "Set-Cookie",
//   ],
//   exposedHeaders: ["set-cookie", "Set-Cookie"],
// };

const corsOptions = {
  origin: "https://commersely-starterup.vercel.app",
  credentials: true,
  exposedHeaders: ["set-cookie", "Set-Cookie"],
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie", "Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ yourCookies: req.cookies.refreshToken });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/customers", customerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/admin-activities", adminActivityRoutes);
app.use("/api/admin", adminNotificationRouter);
app.use("/api/admin-settings", adminSettings);
app.use("/api/admin-analytics", adminAnalytics);
app.use("/api/payment", paymentRoute);
app.use("/api/subscriptions", subscriptionRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is now running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("unhandledRejection", async (err) => {
  console.error("Unhandled Rejection:", err);
  await prisma.$disconnect();
  process.exit(1);
});
