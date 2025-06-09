export function outOfStock() {
  return `
    
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Out of Stock Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #e94b3c; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Item Out of Stock</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Dear [User's Name],</p>
              <p style="margin: 0 0 20px;">We wanted to let you know that the <strong>[Item Name]</strong> in the [Category Name] category is currently out of stock. We apologize for any inconvenience this may cause.</p>
              <p style="margin: 0 0 20px;">Don't worry! We're working hard to restock this item as soon as possible. You can sign up to be notified when it's back in stock.</p>
              <!-- Call to Action -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px auto;">
                <tr>
                  <td style="background-color: #e94b3c; border-radius: 5px; text-align: center;">
                    <a href="[Restock Notification URL]" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Notify Me When Available</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px;">In the meantime, feel free to explore similar items in the [Category Name] category or contact our support team at <a href="mailto:support@yourcompany.com" style="color: #e94b3c; text-decoration: none;">support@yourcompany.com</a> for assistance.</p>
              <p style="margin: 0;">Thank you for your understanding!</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #666666; font-size: 14px;">
              <p style="margin: 0 0 10px;">© 2025 Your Company Name. All rights reserved.</p>
              <p style="margin: 0;">
                <a href="[Unsubscribe URL]" style="color: #e94b3c; text-decoration: none;">Unsubscribe</a> | 
                <a href="[Privacy Policy URL]" style="color: #e94b3c; text-decoration: none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
