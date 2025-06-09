// src/services/notification.service.ts
import admin from "../lib/firebase-admin";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import prisma from "../lib/db";

interface EmailOptions {
  from: string;
  subject: string;
  text: string;
  html?: string;
}

interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface NotificationResult {
  emailSuccessCount: number;
  emailFailureCount: number;
  pushSuccessCount: number;
  pushFailureCount: number;
  duplicateTokensSkipped: number;
}

class NotificationService {
  private prisma: PrismaClient;
  private mailer: nodemailer.Transporter;

  constructor() {
    this.prisma = prisma;

    // Configure nodemailer (update with your SMTP settings)
    this.mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });
  }

  /**
   * Process notifications in batches to avoid memory issues
   */
  async sendBulkNotifications(
    emailOptions: EmailOptions,
    notificationOptions: NotificationOptions,
    batchSize = 1000
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailSuccessCount: 0,
      emailFailureCount: 0,
      pushSuccessCount: 0,
      pushFailureCount: 0,
      duplicateTokensSkipped: 0,
    };

    // Get total count of active subscribers
    const totalSubscribers = await this.prisma.subscription.count({
      where: { isSubscribed: true },
    });

    console.log(
      `Processing ${totalSubscribers} subscribers in batches of ${batchSize}`
    );

    // Process in batches
    for (let skip = 0; skip < totalSubscribers; skip += batchSize) {
      const batch = await this.prisma.subscription.findMany({
        where: { isSubscribed: true },
        skip,
        take: batchSize,
        select: {
          email: true,
          notificationToken: true,
        },
      });

      // Process the current batch
      const batchResult = await this.processBatch(
        batch,
        emailOptions,
        notificationOptions
      );

      // Aggregate results
      result.emailSuccessCount += batchResult.emailSuccessCount;
      result.emailFailureCount += batchResult.emailFailureCount;
      result.pushSuccessCount += batchResult.pushSuccessCount;
      result.pushFailureCount += batchResult.pushFailureCount;
      //   result.duplicateTokensSkipped += batchResult.duplicateTokensSkipped;

      console.log(
        `Processed batch ${skip / batchSize + 1}/${Math.ceil(
          totalSubscribers / batchSize
        )}`
      );
    }

    return result;
  }

  /**
   * Process a single batch of subscribers
   */
  private async processBatch(
    batch: { email: string | null; notificationToken: string | null }[],
    emailOptions: EmailOptions,
    notificationOptions: NotificationOptions
  ): Promise<Omit<NotificationResult, "duplicateTokensSkipped">> {
    const batchResult: Omit<NotificationResult, "duplicateTokensSkipped"> = {
      emailSuccessCount: 0,
      emailFailureCount: 0,
      pushSuccessCount: 0,
      pushFailureCount: 0,
    };

    // Track seen tokens to avoid duplicates
    const seenTokens = new Set<string>();

    // Process emails and push notifications in parallel
    await Promise.all([
      // Process emails
      this.processEmails(batch, emailOptions, batchResult),

      // Process push notifications
      this.processPushNotifications(
        batch,
        notificationOptions,
        seenTokens,
        batchResult
      ),
    ]);

    return batchResult;
  }

  /**
   * Send emails to a batch of subscribers
   */
  private async processEmails(
    batch: { email: string | null }[],
    emailOptions: EmailOptions,
    result: { emailSuccessCount: number; emailFailureCount: number }
  ): Promise<void> {
    const emailPromises = batch
      .filter((subscriber) => subscriber.email)
      .map((subscriber) => {
        return this.mailer
          .sendMail({
            ...emailOptions,
            to: subscriber.email!,
          })
          .then(() => {
            result.emailSuccessCount++;
          })
          .catch((error) => {
            console.error(
              `Failed to send email to ${subscriber.email}:`,
              error
            );
            result.emailFailureCount++;
          });
      });

    await Promise.all(emailPromises);
  }

  /**
   * Send push notifications to a batch of subscribers
   */
  private async processPushNotifications(
    batch: { notificationToken: string | null }[],
    notificationOptions: NotificationOptions,
    seenTokens: Set<string>,
    result: {
      pushSuccessCount: number;
      pushFailureCount: number;
      duplicateTokensSkipped?: number;
    }
  ): Promise<void> {
    const pushPromises = batch
      .filter((subscriber) => subscriber.notificationToken)
      .map((subscriber) => {
        const token = subscriber.notificationToken!;

        // Skip duplicate tokens
        if (seenTokens.has(token)) {
          if (result.duplicateTokensSkipped !== undefined) {
            result.duplicateTokensSkipped++;
          }
          return Promise.resolve();
        }

        seenTokens.add(token);

        const message: admin.messaging.Message = {
          notification: {
            title: notificationOptions.title,
            body: notificationOptions.body,
          },
          data: notificationOptions.data,
          token,
          webpush: {
            notification: {
              icon:
                notificationOptions.data?.icon ||
                "https://i.pinimg.com/736x/8e/38/0c/8e380caa74c0a829a4dc16f063e1100b.jpg",
              badge:
                notificationOptions.data?.icon ||
                "https://i.pinimg.com/736x/ef/2e/1b/ef2e1b69d6aed75e8b9c16bd6013303c.jpg",
            },
            fcmOptions: {
              link: notificationOptions.data?.lead || "/",
            },
          },
        };

        return admin
          .messaging()
          .send(message)
          .then(() => {
            result.pushSuccessCount++;
          })
          .catch((error) => {
            console.error(
              `Failed to send push notification to token ${token}:`,
              error
            );
            result.pushFailureCount++;
          });
      });

    await Promise.all(pushPromises);
  }

  /**
   * Alternative method for sending to all subscribers using multicast (more efficient for push)
   */
  async sendMulticastNotification(
    emailOptions: EmailOptions,
    notificationOptions: NotificationOptions,
    batchSize = 1000
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailSuccessCount: 0,
      emailFailureCount: 0,
      pushSuccessCount: 0,
      pushFailureCount: 0,
      duplicateTokensSkipped: 0,
    };

    // Get total count of active subscribers
    const totalSubscribers = await this.prisma.subscription.count({
      where: { isSubscribed: true },
    });

    console.log(
      `Processing ${totalSubscribers} subscribers in batches of ${batchSize}`
    );

    // Process in batches
    for (let skip = 0; skip < totalSubscribers; skip += batchSize) {
      const batch = await this.prisma.subscription.findMany({
        where: { isSubscribed: true },
        skip,
        take: batchSize,
        select: {
          email: true,
          notificationToken: true,
        },
      });

      // Process emails
      await this.processEmails(batch, emailOptions, result);

      // Process push notifications using multicast (more efficient)
      const uniqueTokens = this.getUniqueTokens(batch);
      result.duplicateTokensSkipped +=
        batch.filter((s) => s.notificationToken).length - uniqueTokens.length;

      if (uniqueTokens.length > 0) {
        try {
          const multicastMessage: admin.messaging.MulticastMessage = {
            tokens: uniqueTokens,
            notification: {
              title: notificationOptions.title,
              body: notificationOptions.body,
            },
            data: notificationOptions.data,
            webpush: {
              notification: {
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-192x192.png",
              },
              fcmOptions: {
                link: "/notifications",
              },
            },
          };

          const response = await admin
            .messaging()
            .sendEachForMulticast(multicastMessage);
          result.pushSuccessCount += response.successCount;
          result.pushFailureCount += response.failureCount;
        } catch (error) {
          console.error("Failed to send multicast notification:", error);
          result.pushFailureCount += uniqueTokens.length;
        }
      }

      console.log(
        `Processed batch ${skip / batchSize + 1}/${Math.ceil(
          totalSubscribers / batchSize
        )}`
      );
    }

    return result;
  }

  /**
   * Extract unique tokens from a batch of subscribers
   */
  private getUniqueTokens(
    batch: { notificationToken: string | null }[]
  ): string[] {
    const tokens = new Set<string>();
    batch.forEach((subscriber) => {
      if (subscriber.notificationToken) {
        tokens.add(subscriber.notificationToken);
      }
    });
    return Array.from(tokens);
  }

  /**
   * Clean up resources
   */
  async disconnect() {
    await this.prisma.$disconnect();
    this.mailer.close();
  }
}

export default new NotificationService();
