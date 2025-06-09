import prisma from "../lib/db";
import { Request, Response } from "express";
import { PaymentMethod } from "@prisma/client";

export const handlePaymentWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = req.body;
    console.log("Money payload", payload);

    const { invoice_id, state, provider } = payload;

    // Map provider to PaymentMethod enum
    const providerToPaymentMethod: { [key: string]: PaymentMethod } = {
      pesalink: PaymentMethod.PESALINK,
      card: PaymentMethod.CREDIT_CARD,
      "apple-pay": PaymentMethod.APPLE_PAY,
      gpay: PaymentMethod.GPAY,
      cashapp: PaymentMethod.CASHAPP,
      mpesa: PaymentMethod.MPESA,
    };

    const paymentMethod =
      providerToPaymentMethod[
        provider.toLowerCase() as keyof typeof providerToPaymentMethod
      ];

    // Handle different payment states
    switch (state) {
      case "PENDING":
        // Store initial payment details
        await prisma.order.updateMany({
          where: { paymentId: invoice_id },
          data: {
            paymentStatus: "PENDING",
            paymentMethod,
            paymentId: invoice_id,
          },
        });
        break;

      case "PROCESSING":
        // Update payment status to processing
        await prisma.order.updateMany({
          where: { paymentId: invoice_id },
          data: { paymentStatus: "PENDING" }, // Still pending until complete
        });
        break;

      case "COMPLETE":
        // Find the user based on api_ref (userId)
        const user = await prisma.user.findUnique({
          where: { id: payload.api_ref },
          include: {
            cart: {
              include: {
                items: {
                  include: {
                    // Include product details for each cart item
                    product: {
                      select: {
                        id: true,
                        name: true,
                        price: true,
                        offerPrice: true,
                        category: {
                          select: {
                            name: true,
                          },
                        },
                        images: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.cart || user.cart.items.length === 0) {
          res.status(400).json({ message: "No user or cart found" });
          return;
        }

        // Get user's default address
        const address = await prisma.address.findFirst({
          where: { userId: user.id, isDefault: true },
        });

        if (!address) {
          res.status(400).json({ message: "No default address found" });
          return;
        }

        // Create order items using product details
        const orderItems = user.cart.items.map((item) => {
          const product = item.product;
          return {
            productId: item.productId,
            productName: product.name,
            productCategory: product.category.name,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: product.offerPrice ? product.offerPrice : product.price,
            orderImages: product.images || [],
          };
        });

        // Create order
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            addressId: address.id,
            paymentId: invoice_id,
            paymentMethod: provider,
            paymentStatus: "COMPLETED",
            status: "PENDING",
            total: parseFloat(payload.net_amount),
            items: {
              create: orderItems,
            },
          },
        });

        // Create admin notification
        await prisma.adminNotification.create({
          data: {
            adminId: user.id,
            type: "NEW_ORDER_PLACED",
            details: {
              orderId: order.id,
              amount: payload.net_amount,
              paymentMethod,
            },
          },
        });

        // Clear the cart
        await prisma.cartItem.deleteMany({
          where: { cartId: user.cart.id },
        });

        await prisma.cart.update({
          where: { id: user.cart.id },
          data: { updatedAt: new Date() },
        });

        break;

      case "FAILED":
        // Update order with failed status
        await prisma.order.updateMany({
          where: { paymentId: invoice_id },
          data: {
            paymentStatus: "PENDING", // Or add FAILED status to enum if needed
            status: "PENDING",
          },
        });
        break;

      default:
        res.status(400).json({ message: "Invalid payment state" });
        return;
    }

    res.json({ message: "success" });
  } catch (error) {
    console.error("Payment webhook error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
