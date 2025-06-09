import { Request, Response } from "express";
import notificationService from "../services/notification.service";
import { productTemplate } from "../templates/added-productTemplate";
import { outOfStock } from "../templates/out-of-stocTemplate";
import { removedCategory } from "../templates/removed-categoryTemplate";
import { updatedCategory } from "../templates/updatedCategoryTemplate";
import prisma from "../lib/db";
import {
  allLinks,
  baseUrl,
  NotificationAction,
  NOTIFICATIONDATA,
} from "../lib/custom-ntf";

const customIcon =
  "https://i.pinimg.com/736x/86/a6/b2/86a6b2ccb15c88b6f879f1f5a03b9165.jpg";

export async function sendNotifications(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { action }: { action: NotificationAction } = req.body;
    const { pageLinks, socialLinks } = allLinks;

    if (!action) {
      res.status(400).json({
        success: false,
        message: "No action or valid action provided",
      });
      return;
    }

    switch (action) {
      case NotificationAction.ADDED_COLLECTION:
        const productsCollection = await prisma?.product.findMany({
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!productsCollection || productsCollection.length === 0) {
          res.status(404).json({
            success: false,
            message: "Please add at least one product",
          });
          return;
        }

        const productResultCollection =
          await notificationService.sendBulkNotifications(
            {
              from: process.env.USER_EMAIL!,
              subject: NOTIFICATIONDATA.ADDED_PRODUCT.title,
              text: NOTIFICATIONDATA.ADDED_PRODUCT.text,
              html: productTemplate({
                products: productsCollection,
                pageLinks,
                socialLinks,
              }),
            },
            {
              title: NOTIFICATIONDATA.ADDED_PRODUCT.title,
              body: NOTIFICATIONDATA.ADDED_PRODUCT.smallDescription,
              data: {
                icon: productsCollection[0].images[0],
                lead: baseUrl + "/listing",
              },
            },
            1000 // batch size
          );

        res.json({
          success: true,
          message: "Product notifications sent successfully",
          data: productResultCollection,
        });

        break;
      case NotificationAction.ADDED_PRODUCT:
        const products = await prisma?.product.findMany({
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!products || products.length === 0) {
          res.status(404).json({
            success: false,
            message: "Please add at least one product",
          });
          return;
        }

        const productResult = await notificationService.sendBulkNotifications(
          {
            from: process.env.USER_EMAIL!,
            subject: NOTIFICATIONDATA.ADDED_PRODUCT.title,
            text: NOTIFICATIONDATA.ADDED_PRODUCT.text,
            html: productTemplate({ products, pageLinks, socialLinks }),
          },
          {
            title: NOTIFICATIONDATA.ADDED_PRODUCT.title,
            body: NOTIFICATIONDATA.ADDED_PRODUCT.smallDescription,
            data: { icon: products[0].images[0], lead: baseUrl + "/listing" },
          },
          1000 // batch size
        );

        res.json({
          success: true,
          message: "Product notifications sent successfully",
          data: productResult,
        });
        break;

      case NotificationAction.REMOVED_CATEGORY:
        // Get the most recently removed category
        const removedCatActivity = await prisma.adminActivity.findFirst({
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

        const removedCategoryResult =
          await notificationService.sendBulkNotifications(
            {
              from: process.env.USER_EMAIL!,
              subject: NOTIFICATIONDATA.REMOVED_CATEGORY.title,
              text: NOTIFICATIONDATA.REMOVED_CATEGORY.text,
              html: removedCategory(),
            },
            {
              title: NOTIFICATIONDATA.REMOVED_CATEGORY.title,
              body: NOTIFICATIONDATA.REMOVED_CATEGORY.smallDescription,
              data: { icon: customIcon, lead: baseUrl + "/listing" },
            },
            1000 // batch size
          );

        res.json({
          success: true,
          message: "Removed category notifications sent successfully",
          data: removedCategoryResult,
        });
        break;

      case NotificationAction.UPDATED_CATEGORY:
        // Get the most recently updated category
        const updatedCatActivity = await prisma.adminActivity.findFirst({
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

        const updatedCategoryResult =
          await notificationService.sendBulkNotifications(
            {
              from: process.env.USER_EMAIL!,
              subject: NOTIFICATIONDATA.UPDATED_CATEGORY.title,
              text: NOTIFICATIONDATA.UPDATED_CATEGORY.text,
              html: updatedCategory(),
            },
            {
              title: NOTIFICATIONDATA.UPDATED_CATEGORY.title,
              body: NOTIFICATIONDATA.UPDATED_CATEGORY.smallDescription,
              data: { icon: customIcon, lead: baseUrl + "/listing" },
            },
            1000 // batch size
          );

        res.json({
          success: true,
          message: "Updated category notifications sent successfully",
          data: updatedCategoryResult,
        });
        break;

      case NotificationAction.OUT_OF_STOCK:
        // Get out of stock products
        const outOfStockProducts = await prisma.product.findMany({
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

        const outOfStockResult =
          await notificationService.sendBulkNotifications(
            {
              from: process.env.USER_EMAIL!,
              subject: NOTIFICATIONDATA.OUT_OF_STOCK.title,
              text: NOTIFICATIONDATA.OUT_OF_STOCK.text,
              html: outOfStock(),
            },
            {
              title: NOTIFICATIONDATA.OUT_OF_STOCK.title,
              body: NOTIFICATIONDATA.OUT_OF_STOCK.smallDescription,
              data: {
                icon: outOfStockProducts[0].images[0] || customIcon,
                lead: baseUrl + "/product/" + outOfStockProducts[0].id,
              },
            },
            1000 // batch size
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
  } catch (error: any) {
    console.error("Notification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Something went wrong",
    });
  }
}
