import { NextFunction, Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { logAdminNotification } from "../utils/logAdminNotification";
import { NotificationType } from "@prisma/client";
import IntaSend from "intasend-node";

export const createFinalOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      items,
      addressId,
      couponId,
      total,
      paymentId,
      email,
      paymentMethod,
      paymentStatus,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    // Fetch the COD setting
    const setting = await prisma.setting.findUnique({
      where: { id: "global_settings" },
    });

    // If COD is disabled, enforce completed payment for non-COD methods
    if (!setting?.isCashOnDelivery && paymentMethod === "CASH_ON_DELIVERY") {
      res.status(400).json({
        success: false,
        message: "Cash on Delivery is currently disabled",
      });
      return;
    }

    // If COD is disabled, ensure payment is completed for other methods
    if (
      !setting?.isCashOnDelivery &&
      paymentMethod !== "CASH_ON_DELIVERY" &&
      paymentStatus !== "COMPLETED"
    ) {
      res.status(400).json({
        success: false,
        message: "Payment must be completed before placing the order",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const order = await prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          userId,
          addressId,
          email,
          couponId,
          total,
          paymentMethod,
          paymentStatus:
            paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : paymentStatus,
          paymentId,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              orderImages: [item.image],
              productName: item.productName,
              productCategory: item.productCategory,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Update product stock and sold count
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Clear cart
      await prisma.cartItem.deleteMany({
        where: { cart: { userId } },
      });

      await prisma.cart.delete({
        where: { userId },
      });

      // Update coupon usage
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Log notification
      await logAdminNotification({
        type: NotificationType.NEW_ORDER_PLACED,
        details: {
          orderId: newOrder.id,
          userId,
          userName: user?.name,
          userEmail: user?.email,
          total,
          itemCount: items.length,
          paymentMethod,
        },
      });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (e) {
    console.log(req.body);
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred!",
    });
  }
};
export const getOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        address: true,
        coupon: true,
      },
    });

    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred!",
    });
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    await prisma.order.updateMany({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred!",
    });
  }
};

export const getAllOrdersForAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    // Get total count of orders
    const totalItems = await prisma.order.count();

    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      include: {
        items: true,
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred!",
    });
  }
};

export const getOrdersByUserId = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true,
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred!",
    });
  }
};

// Add this to your order controller
export const initiatePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, email, amount, firstName, lastName, redirectUrl } =
      req.body;

    // Validate the order exists and belongs to the user
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { user: true },
    });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "cart not found",
      });
      return;
    }

    // Initialize IntaSend
    const intasend = new IntaSend(
      process.env.INTASEND_PUBLIC_KEY!,
      process.env.INTASEND_SECRET_KEY!,
      false
    );

    const collection = intasend.collection();

    // Create payment link
    const response = await collection.charge({
      first_name: firstName,
      last_name: lastName,
      email: email,
      host: redirectUrl,
      amount: amount,
      currency: "KES",
      api_ref: userId, // Using order ID as reference
      redirect_url: redirectUrl,
    });

    res.status(200).json({
      success: true,
      paymentUrl: response.url,
    });
  } catch (e) {
    console.error("Payment initiation error:", e);
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
    });
  }
};
