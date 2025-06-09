// src/controllers/notification.controller.ts
import { Request, Response } from "express";
import admin from "../lib/firebase-admin";

interface NotificationRequest {
  token?: string;
  tokens?: string[];
  topic?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface NotificationResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  successCount?: number;
  failureCount?: number;
  responses?: Array<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export const NotificationController = {
  async sendNotification(req: Request, res: Response) {
    try {
      const body: NotificationRequest = req.body;

      // Validate required fields
      if (!body.title || !body.body) {
        return res.status(400).json({
          success: false,
          message: "Title and body are required",
        });
      }

      // Validate at least one target exists
      if (!body.token && !body.tokens && !body.topic) {
        return res.status(400).json({
          success: false,
          message: "Either token, tokens, or topic is required",
        });
      }

      let response: NotificationResponse;

      if (body.token) {
        // Single token notification
        const message: admin.messaging.Message = {
          notification: {
            title: body.title,
            body: body.body,
          },
          data: body.data || {},
          token: body.token,
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

        const messageId = await admin.messaging().send(message);
        response = {
          success: true,
          messageId,
        };
      } else if (body.tokens) {
        // Multiple tokens notification
        const results = await Promise.all(
          body.tokens.map(async (token) => {
            try {
              const message: admin.messaging.Message = {
                notification: {
                  title: body.title,
                  body: body.body,
                },
                data: body.data,
                token,
              };
              const messageId = await admin.messaging().send(message);
              return { success: true, messageId };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
              };
            }
          })
        );

        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.length - successCount;

        response = {
          success: true,
          message: "Multicast sent",
          successCount,
          failureCount,
          responses: results,
        };
      } else if (body.topic) {
        // Topic notification
        const message: admin.messaging.Message = {
          notification: {
            title: body.title,
            body: body.body,
          },
          data: body.data,
          topic: body.topic,
        };

        const messageId = await admin.messaging().send(message);
        response = {
          success: true,
          messageId,
        };
      } else {
        // Fallback (shouldn't reach here due to validation)
        return res.status(400).json({
          success: false,
          message: "No valid target for notification",
        });
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send notification",
      });
    }
  },
};
