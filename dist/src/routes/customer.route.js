"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user-controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateJwt);
// Get all customers
router.get("/get-customers", user_controller_1.getCustomers);
// Get specific customer details
router.get("/:customerId", user_controller_1.getCustomerDetails);
// Delete a customer
router.delete("/:customerId", user_controller_1.deleteCustomer);
exports.default = router;
