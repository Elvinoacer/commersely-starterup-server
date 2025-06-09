import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import prisma from "./lib/db";
import addressRoutes from "./routes/addressRoutes";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import couponRoutes from "./routes/couponRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";
import settingsRoutes from "./routes/settingRoutes";
import adminSettings from "./routes/adminsettingsRoutes";
import wishlistRoute from "./routes/wishlist";
import categoryRoutes from "./routes/categoryRoutes";
import customerRoutes from "./routes/customer.route";
import reviewRoutes from "./routes/reviews.route";
import emailRoutes from "./routes/email.route";
import adminActivityRoutes from "./routes/adminActivityRoutes";
import adminNotificationRouter from "./routes/adminNotificationRoute";
import adminAnalytics from "./routes/analyticsRoutes";
import paymentRoute from "./routes/paymentRoute";
import subscriptionRoutes from "./routes/subscription.routes";
import { sendNotifications } from "./services/test";

dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || "10000", 10);

const corsOptions = {
  origin: [
    "https://commersely-starterup.vercel.app",
    "https://commersely-starterup-server-1.onrender.com",
    "http://localhost:3000",
    "https://3888-197-136-187-86.ngrok-free.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable preflight for all routes
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json(
    "Hello there, check this out, https://elvin-juma-portfolio.vercel.app/"
  );
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
