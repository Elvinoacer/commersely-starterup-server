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
exports.sendNotifications = sendNotifications;
const notification_service_1 = __importDefault(require("../services/notification.service"));
const added_productTemplate_1 = require("../templates/added-productTemplate");
const out_of_stocTemplate_1 = require("../templates/out-of-stocTemplate");
const removed_categoryTemplate_1 = require("../templates/removed-categoryTemplate");
const updatedCategoryTemplate_1 = require("../templates/updatedCategoryTemplate");
const db_1 = __importDefault(require("../lib/db"));
const custom_ntf_1 = require("../lib/custom-ntf");
const customIcon = "https://i.pinimg.com/736x/86/a6/b2/86a6b2ccb15c88b6f879f1f5a03b9165.jpg";
function sendNotifications(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { action } = req.body;
            const { pageLinks, socialLinks } = custom_ntf_1.allLinks;
            if (!action) {
                res.status(400).json({
                    success: false,
                    message: "No action or valid action provided",
                });
                return;
            }
            switch (action) {
                case custom_ntf_1.NotificationAction.ADDED_COLLECTION:
                    const productsCollection = yield (db_1.default === null || db_1.default === void 0 ? void 0 : db_1.default.product.findMany({
                        take: 10,
                        orderBy: {
                            createdAt: "desc",
                        },
                    }));
                    if (!productsCollection || productsCollection.length === 0) {
                        res.status(404).json({
                            success: false,
                            message: "Please add at least one product",
                        });
                        return;
                    }
                    const productResultCollection = yield notification_service_1.default.sendBulkNotifications({
                        from: process.env.USER_EMAIL,
                        subject: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.title,
                        text: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.text,
                        html: (0, added_productTemplate_1.productTemplate)({
                            products: productsCollection,
                            pageLinks,
                            socialLinks,
                        }),
                    }, {
                        title: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.title,
                        body: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.smallDescription,
                        data: {
                            icon: productsCollection[0].images[0],
                            lead: custom_ntf_1.baseUrl + "/listing",
                        },
                    }, 1000 // batch size
                    );
                    res.json({
                        success: true,
                        message: "Product notifications sent successfully",
                        data: productResultCollection,
                    });
                    break;
                case custom_ntf_1.NotificationAction.ADDED_PRODUCT:
                    const products = yield (db_1.default === null || db_1.default === void 0 ? void 0 : db_1.default.product.findMany({
                        take: 10,
                        orderBy: {
                            createdAt: "desc",
                        },
                    }));
                    if (!products || products.length === 0) {
                        res.status(404).json({
                            success: false,
                            message: "Please add at least one product",
                        });
                        return;
                    }
                    const productResult = yield notification_service_1.default.sendBulkNotifications({
                        from: process.env.USER_EMAIL,
                        subject: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.title,
                        text: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.text,
                        html: (0, added_productTemplate_1.productTemplate)({ products, pageLinks, socialLinks }),
                    }, {
                        title: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.title,
                        body: custom_ntf_1.NOTIFICATIONDATA.ADDED_PRODUCT.smallDescription,
                        data: { icon: products[0].images[0], lead: custom_ntf_1.baseUrl + "/listing" },
                    }, 1000 // batch size
                    );
                    res.json({
                        success: true,
                        message: "Product notifications sent successfully",
                        data: productResult,
                    });
                    break;
                case custom_ntf_1.NotificationAction.REMOVED_CATEGORY:
                    // Get the most recently removed category
                    const removedCatActivity = yield db_1.default.adminActivity.findFirst({
                        where: {
                            action: "REMOVED_CATEGORY",
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    });
                    if (!removedCatActivity) {
                        res.status(404).json({
                            success: false,
                            message: "No removed category found",
                        });
                        return;
                    }
                    const removedCategoryResult = yield notification_service_1.default.sendBulkNotifications({
                        from: process.env.USER_EMAIL,
                        subject: custom_ntf_1.NOTIFICATIONDATA.REMOVED_CATEGORY.title,
                        text: custom_ntf_1.NOTIFICATIONDATA.REMOVED_CATEGORY.text,
                        html: (0, removed_categoryTemplate_1.removedCategory)(),
                    }, {
                        title: custom_ntf_1.NOTIFICATIONDATA.REMOVED_CATEGORY.title,
                        body: custom_ntf_1.NOTIFICATIONDATA.REMOVED_CATEGORY.smallDescription,
                        data: { icon: customIcon, lead: custom_ntf_1.baseUrl + "/listing" },
                    }, 1000 // batch size
                    );
                    res.json({
                        success: true,
                        message: "Removed category notifications sent successfully",
                        data: removedCategoryResult,
                    });
                    break;
                case custom_ntf_1.NotificationAction.UPDATED_CATEGORY:
                    // Get the most recently updated category
                    const updatedCatActivity = yield db_1.default.adminActivity.findFirst({
                        where: {
                            action: "UPDATED_CATEGORY",
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    });
                    if (!updatedCatActivity) {
                        res.status(404).json({
                            success: false,
                            message: "No updated category found",
                        });
                        return;
                    }
                    const updatedCategoryResult = yield notification_service_1.default.sendBulkNotifications({
                        from: process.env.USER_EMAIL,
                        subject: custom_ntf_1.NOTIFICATIONDATA.UPDATED_CATEGORY.title,
                        text: custom_ntf_1.NOTIFICATIONDATA.UPDATED_CATEGORY.text,
                        html: (0, updatedCategoryTemplate_1.updatedCategory)(),
                    }, {
                        title: custom_ntf_1.NOTIFICATIONDATA.UPDATED_CATEGORY.title,
                        body: custom_ntf_1.NOTIFICATIONDATA.UPDATED_CATEGORY.smallDescription,
                        data: { icon: customIcon, lead: custom_ntf_1.baseUrl + "/listing" },
                    }, 1000 // batch size
                    );
                    res.json({
                        success: true,
                        message: "Updated category notifications sent successfully",
                        data: updatedCategoryResult,
                    });
                    break;
                case custom_ntf_1.NotificationAction.OUT_OF_STOCK:
                    // Get out of stock products
                    const outOfStockProducts = yield db_1.default.product.findMany({
                        where: {
                            stock: 0,
                        },
                        take: 5,
                        orderBy: {
                            updatedAt: "desc",
                        },
                    });
                    if (!outOfStockProducts || outOfStockProducts.length === 0) {
                        res.status(404).json({
                            success: false,
                            message: "No out of stock products found",
                        });
                        return;
                    }
                    const outOfStockResult = yield notification_service_1.default.sendBulkNotifications({
                        from: process.env.USER_EMAIL,
                        subject: custom_ntf_1.NOTIFICATIONDATA.OUT_OF_STOCK.title,
                        text: custom_ntf_1.NOTIFICATIONDATA.OUT_OF_STOCK.text,
                        html: (0, out_of_stocTemplate_1.outOfStock)(),
                    }, {
                        title: custom_ntf_1.NOTIFICATIONDATA.OUT_OF_STOCK.title,
                        body: custom_ntf_1.NOTIFICATIONDATA.OUT_OF_STOCK.smallDescription,
                        data: {
                            icon: outOfStockProducts[0].images[0] || customIcon,
                            lead: custom_ntf_1.baseUrl + "/product/" + outOfStockProducts[0].id,
                        },
                    }, 1000 // batch size
                    );
                    res.json({
                        success: true,
                        message: "Out of stock notifications sent successfully",
                        data: outOfStockResult,
                    });
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        message: "Invalid action provided",
                    });
                    break;
            }
        }
        catch (error) {
            console.error("Notification error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Something went wrong",
            });
        }
    });
}
