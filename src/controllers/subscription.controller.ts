// src/controllers/subscription.controller.ts
import { Request, Response } from "express";
import { validateEmail } from "../utils/validators";
import prisma from "../lib/db";

export const SubscriptionController = {
  // Create or update a subscription
  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { email, notificationToken } = req.body;

      // Validate email
      if (email && !validateEmail(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      // At least one of email or token must be provided
      if (!email && !notificationToken) {
        res.status(400).json({
          error: "Either email or notification token is required",
        });
        return;
      }

      let subscription;

      if (email) {
        // Check if subscription exists
        const existing = await prisma.subscription.findUnique({
          where: { email },
        });

        if (existing) {
          // Update existing subscription
          subscription = await prisma.subscription.update({
            where: { email },
            data: {
              isSubscribed: true,
              notificationToken:
                notificationToken || existing.notificationToken,
            },
          });
        } else {
          // Create new subscription
          subscription = await prisma.subscription.create({
            data: {
              email,
              notificationToken,
              isSubscribed: true,
            },
          });
        }
      } else if (notificationToken) {
        // Handle token-only subscriptions (for push notifications)
        const existing = await prisma.subscription.findFirst({
          where: { notificationToken },
        });

        if (existing) {
          subscription = existing;
        } else {
          subscription = await prisma.subscription.create({
            data: {
              notificationToken,
              isSubscribed: true,
            },
          });
        }
      }

      res.status(200).json({
        message: "Subscription successful",
        subscription,
      });
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(500).json({
        error: "An error occurred while processing subscription",
      });
    }
  },

  // Unsubscribe by email or token
  async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { email, notificationToken } = req.body;

      if (!email) {
        res.status(400).json({
          error: "Email  is required",
        });
        return;
      }

      let subscription;

      if (email) {
        subscription = await prisma.subscription.update({
          where: { email },
          data: { isSubscribed: false },
        });
      } else if (notificationToken) {
        subscription = await prisma.subscription.updateMany({
          where: { notificationToken },
          data: { isSubscribed: false },
        });
      }

      res.status(200).json({
        message: "Unsubscription successful",
        subscription,
      });
    } catch (error) {
      console.error("Unsubscription error:", error);
      res.status(500).json({
        error: "An error occurred while processing unsubscription",
      });
    }
  },

  // Get all active subscriptions
  async getAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { isSubscribed: true },
      });

      res.status(200).json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({
        error: "An error occurred while fetching subscriptions",
      });
    }
  },

  // Get subscription by email or token
  async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { email, notificationToken } = req.query;

      if (!email && !notificationToken) {
        res.status(400).json({
          error: "Either email or notification token is required",
        });
        return;
      }

      let subscription;

      if (email) {
        subscription = await prisma.subscription.findUnique({
          where: { email: email as string },
        });
      } else if (notificationToken) {
        subscription = await prisma.subscription.findFirst({
          where: { notificationToken: notificationToken as string },
        });
      }

      if (!subscription) {
        res.status(404).json({
          error: "Subscription not found",
        });
        return;
      }

      res.status(200).json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({
        error: "An error occurred while fetching subscription",
      });
    }
  },
};
