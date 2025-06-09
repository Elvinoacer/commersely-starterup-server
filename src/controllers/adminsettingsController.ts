import { NextFunction, Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const updateCashOnDeliverySetting = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { isCashOnDelivery } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    // Ensure the user is a SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Only super admins can update settings",
      });
      return;
    }

    // Upsert the setting (create if it doesn't exist, update if it does)
    const setting = await prisma.setting.upsert({
      where: { id: "global_settings" },
      update: { isCashOnDelivery },
      create: {
        id: "global_settings",
        isCashOnDelivery,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cash on Delivery setting updated successfully",
      data: setting,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred!",
    });
  }
};

export const getCashOnDeliverySetting = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { id: "global_settings" },
    });

    res.status(200).json({
      success: true,
      data: setting || { id: "global_settings", isCashOnDelivery: true },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred!",
    });
  }
};
