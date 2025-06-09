export function updatedCategory() {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Category Update Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4a90e2; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Category Update Notification</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Dear Customer</p>
              <p style="margin: 0 0 20px;">We're excited to inform you that the <strong>[Category Name]</strong> category has been updated! We've made some improvements to enhance your experience, including [brief description of changes, e.g., new features, updated content, or improved organization].</p>
              <p style="margin: 0 0 20px;">Explore the updated category to discover what's new and how it can benefit you.</p>
              <!-- Call to Action -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px auto;">
                <tr>
                  <td style="background-color: #4a90e2; border-radius: 5px; text-align: center;">
                    <a href="[Your Category URL]" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Explore Now</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px;">If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@yourcompany.com" style="color: #4a90e2; text-decoration: none;">support@yourcompany.com</a>.</p>
              <p style="margin: 0;">Thank you for being a valued user!</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #666666; font-size: 14px;">
              <p style="margin: 0 0 10px;">&copy; 2025 Your Company Name. All rights reserved.</p>
              <p style="margin: 0;">
                <a href="[Unsubscribe URL]" style="color: #4a90e2; text-decoration: none;">Unsubscribe</a> | 
                <a href="[Privacy Policy URL]" style="color: #4a90e2; text-decoration: none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
