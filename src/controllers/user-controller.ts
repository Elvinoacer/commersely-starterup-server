import prisma from "../lib/db";
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Get all customers (admin)
export async function getCustomers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userRole = req.user?.role;
    if (!userRole || userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count of customers
    const totalItems = await prisma.user.count({
      where: { role: "USER" },
    });

    const customers = await prisma.user.findMany({
      where: { role: "USER" },
      skip,
      take: limit,
      omit: { password: true },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
}

// Get customer details (admin)
export async function getCustomerDetails(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userRole = req.user?.role;
    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const { customerId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        wishlist: {
          include: { product: { select: { id: true, name: true } } },
        },
        orders: {
          include: {
            items: { select: { id: true, productId: true, quantity: true } },
            address: true,
            coupon: { select: { id: true, code: true } },
          },
        },
        addresses: true,
        cart: {
          include: {
            items: { select: { id: true, productId: true, quantity: true } },
          },
        },
      },
      omit: { password: true },
    });

    if (!user || user.role !== "USER") {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "Customer details fetched",
    });
  } catch (error: any) {
    console.error("Error fetching customer details:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch customer details",
    });
  }
}

// Delete a customer (admin)
export async function deleteCustomer(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userRole = req.user?.role;
    if (userRole !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Unauthorized request" });
      return;
    }

    const { customerId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!user || user.role !== "USER") {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    // Delete related data to avoid foreign key constraints
    await prisma.$transaction([
      // Delete cart items first, then cart
      prisma.cartItem.deleteMany({ where: { cart: { userId: customerId } } }),
      prisma.cart.deleteMany({ where: { userId: customerId } }),
      // Delete wishlist
      prisma.wishlist.deleteMany({ where: { userId: customerId } }),
      // Delete addresses
      prisma.address.deleteMany({ where: { userId: customerId } }),
      // Delete reviews
      prisma.review.deleteMany({ where: { userId: customerId } }),
      // Delete orders and their items
      prisma.orderItem.deleteMany({ where: { order: { userId: customerId } } }),
      prisma.order.deleteMany({ where: { userId: customerId } }),
      // Delete subscription if exists
      prisma.subscription.deleteMany({ where: { email: user.email } }),
      // Delete user
      prisma.user.delete({ where: { id: customerId } }),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    if (error?.code === "P2025") {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete customer",
    });
  }
}
