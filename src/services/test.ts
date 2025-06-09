// Example usage in a controller or job
import { dummyProducts } from "../templates/dummyproducts";
import {
  ProductEmailTemplate,
  productTemplate,
} from "../templates/added-productTemplate";
import notificationService from "./notification.service";

export interface NotificationService {
  title: string;
  smallDescription: string;
  text: string;
  productsWithContent: ProductEmailTemplate;
}

// "New collection from Commersely store"
export async function sendNotifications({
  title,
  text,
  productsWithContent,
}: NotificationService) {
  // Send notifications
  const result = await notificationService.sendBulkNotifications(
    {
      from: process.env.USER_EMAIL!,
      subject: title,
      text: text,
      html: productTemplate(productsWithContent),
    },
    {
      title: "Notification Title",
      body: "Notification body content",
      data: { key: "value" }, // optional
    },
    1000 // batch size
  );

  console.log("Notification results:", result);
}

// // Or use the multicast version (more efficient for push notifications)
// const multicastResult = await notificationService.sendMulticastNotification(
//   { /* email options */ },
//   { /* notification options */ },
//   1000 // batch size
// );

// console.log('Multicast results:', multicastResult);
