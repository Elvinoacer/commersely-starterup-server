"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminsettingsController_1 = require("../controllers/adminsettingsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateJwt);
router.get("/cash-on-delivery", adminsettingsController_1.getCashOnDeliverySetting);
router.put("/cash-on-delivery", authMiddleware_1.isSuperAdmin, adminsettingsController_1.updateCashOnDeliverySetting);
exports.default = router;
