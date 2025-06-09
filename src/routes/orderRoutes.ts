import express from "express";
import {
  createFinalOrder,
  getAllOrdersForAdmin,
  getOrder,
  getOrdersByUserId,
  initiatePayment,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticateJwt);

router.post("/create-final-order", createFinalOrder);
router.get("/get-single-order/:orderId", getOrder);
router.get("/get-order-by-user-id", getOrdersByUserId);
router.get("/get-all-orders-for-admin", isSuperAdmin, getAllOrdersForAdmin);
router.put("/:orderId/status", isSuperAdmin, updateOrderStatus);
router.post("/initiate-payment", authenticateJwt, initiatePayment);

export default router;
