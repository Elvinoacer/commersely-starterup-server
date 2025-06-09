import { transporter } from "../services/emails";
import { Response, Request } from "express";
import {
  activityNotificationTemplate,
  autoReplyTemplate,
  emailTemplate,
} from "../templates/email";

const defaultAutoReplyParam = {
  subject: "Thanks for signup",
  message:
    "We have realized you have signup with us, \n welcome onboard as we start our mistery journey",
  // email,
  replyTimeframe: new Date(Date.now()).toDateString(),
  emergencyContact: "0790670542",
  companyName: "Commersely",
  additionalInfo: "Better we get you started soon",
};

const autoReply = async ({
  senderName,
  subject,
  message,
  email,
  replyTimeframe,
  emergencyContact,
  companyName,
  additionalInfo,
}: {
  senderName: string;
  email?: string;
  subject: string;
  message: string;
  replyTimeframe: string;
  emergencyContact?: string;
  companyName: string;
  additionalInfo?: string;
}) => {
  try {
    // Validate required fields
    if (
      !senderName ||
      !email ||
      !subject ||
      !replyTimeframe ||
      !emergencyContact ||
      !companyName ||
      !additionalInfo
    ) {
      console.log("missing some fields");
      throw new Error("Missing some fields");
    }

    // Construct email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Store receiver email in environment variable
      subject: `${subject}`,
      html: autoReplyTemplate({
        senderName,
        subject,
        message,
        replyTimeframe,
        emergencyContact,
        companyName,
        additionalInfo,
      }),
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("successfully sent the auto-response");
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Email controller
export const emailController = {
  sendEmail: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, title, message, ...otherFields } = req.body;

      // Validate required fields
      if (!name || !email || !title || !message) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: name, email, title, and message are required",
        });
        return;
      }

      // Construct email content
      const mailOptions = {
        from: email, // Store receiver email in environment variable
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Form Submission: ${title}`,
        html: emailTemplate({ name, email, title, message, otherFields }),
      };

      // Send email
      await Promise.all([
        transporter.sendMail(mailOptions),
        autoReply({ ...defaultAutoReplyParam, email, senderName: name }),
      ]); //transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: error.message,
      });
    }
  },
  sendAlertEmail: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        userName,
        email,
        notificationTitle,
        notificationMessage,
        activities,
        ctaLink,
        ctaText,
      } = req.body;

      // Validate required fields
      if (
        !userName ||
        !email ||
        !notificationTitle ||
        !notificationMessage ||
        !activities ||
        !ctaLink ||
        !ctaText
      ) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields:userName,  notificationTitle,  notificationMessage,  activities,  ctaLink,  ctaText,  are required",
        });
        return;
      }

      // Construct email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Store receiver email in environment variable
        subject: `${notificationTitle}`,
        html: activityNotificationTemplate({
          userName,
          notificationTitle,
          notificationMessage,
          activities,
          ctaLink,
          ctaText,
        }),
      };

      // Send email
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: error.message,
      });
    }
  },
};
