import { allLinks } from "../lib/custom-ntf";

export function removedCategory() {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Important Update About Category Changes</title>
    <style type="text/css">
        /* Base styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
        }

        /* Email container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }

        /* Content */
        .content {
            padding: 30px;
        }

        /* Update card */
        .update-card {
            background: #f9f9f9;
            border-left: 4px solid #6e8efb;
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 0 4px 4px 0;
        }

        .update-title {
            color: #444;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 15px;
        }

        .update-message {
            color: #666;
            margin-bottom: 15px;
        }

        .impact-list {
            padding-left: 20px;
            color: #666;
        }

        .impact-list li {
            margin-bottom: 8px;
        }

        /* Action section */
        .action-section {
            background: #f0f4ff;
            padding: 20px;
            border-radius: 4px;
            margin: 25px 0;
        }

        .action-title {
            color: #444;
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 15px;
        }

        /* Button */
        .cta-button {
            display: inline-block;
            background: #6e8efb;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 16px;
            transition: background 0.3s ease;
            margin-top: 15px;
        }

        .cta-button:hover {
            background: #5a7df0;
        }

        /* Footer */
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }

        .social-icons {
            margin: 15px 0;
        }

        .social-icons a {
            display: inline-block;
            margin: 0 5px;
            color: #777;
            text-decoration: none;
            font-size: 16px;
        }

        /* Responsive adjustments */
        @media only screen and (max-width: 480px) {
            .header h1 {
                font-size: 24px;
            }
            
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Important Category Update</h1>
        </div>

        <div class="content">
            <p>Dear Valued User,</p>
            
            <p>We're writing to inform you about an important change to our platform that may affect your experience.</p>
            
            <div class="update-card">
                <h2 class="update-title">Category Removal Notification</h2>
                <p class="update-message">Some categories has been removed from our platform. This change is part of our ongoing efforts to improve and streamline our service offerings.</p>
                
                <p class="update-message">Here's what this means for you:</p>
                <ul class="impact-list">
                  <!--  <li>Any content previously categorized under REMOVED_CATEGORY has been moved to the most relevant alternative categories</li> -->
                    <li>Your saved preferences related to this category have been updated accordingly</li>
                    <li>Search functionality remains unchanged - you can still find all content</li>
                </ul>
            </div>

            <div class="action-section">
                <h3 class="action-title">What You Can Do</h3>
                <p>If you had favorites or preferences related to this category:</p>
                <ul class="impact-list">
                    <li>Review your updated preferences in your account settings</li>
                    <li>Explore similar categories that might interest you</li>
                    <li>Contact our support team if you need assistance</li>
                </ul>
                
                <!--<a href="#" class="cta-button">Update Your Preferences</a>-->
            </div>

            <p>We appreciate your understanding as we continue to improve our platform. If you have any questions or concerns about this change, please don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>The Commersely Team</p>
        </div>

        <div class="footer">
            <div class="social-icons">
                <a href="${allLinks.socialLinks.facebook}">Facebook</a> • <a href="${allLinks.socialLinks.twitter}">Twitter</a> • <a href="${allLinks.socialLinks.instagram}">Instagram</a>
            </div>
            <p>© 2023 Your Company Name. All rights reserved.</p>
            <p>
                <a href="#" style="color: #777">Unsubscribe</a> |
                <a href="#" style="color: #777">Privacy Policy</a> |
                <a href="#" style="color: #777">Contact Us</a>
            </p>
            <p>123 Business Street, City, State 12345</p>
        </div>
    </div>
</body>
</html>
    `;
}
