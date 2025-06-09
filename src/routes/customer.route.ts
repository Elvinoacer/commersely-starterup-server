import express from "express";
import {
  getCustomers,
  getCustomerDetails,
  deleteCustomer,
} from "../controllers/user-controller";
import { authenticateJwt } from "../middleware/authMiddleware";

const router = express.Router();
router.use(authenticateJwt);

// Get all customers
router.get("/get-customers", getCustomers);

// Get specific customer details
router.get("/:customerId", getCustomerDetails);

// Delete a customer
router.delete("/:customerId", deleteCustomer);

export default router;
