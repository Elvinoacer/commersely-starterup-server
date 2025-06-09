// require("dotenv").config();
const { IntaSend } = require("@intasend/intasend-node");

// Initialize IntaSend client
const intasend = new IntaSend({
  token: "ISPubKey_live_5ad888ac-01e9-40bf-ba17-2dbbb9be1fef",
  publishableKey: "SSecretKey_live_ed4e8327-c880-4bc3-8efb-f1e8bedfa825",
  test: false, // Set to false for production
});

async function createPaymentLink(
  amount,
  currency,
  customerEmail,
  customerPhone,
  description
) {
  try {
    const response = await intasend.collection.checkout({
      amount,
      currency,
      email: customerEmail,
      phone_number: customerPhone,
      description,
    });
    const paymentLink = response.url;
    const transactionId = response.id;
    return { paymentLink, transactionId };
  } catch (error) {
    console.error("Error creating payment link:", error.message);
    return { paymentLink: null, transactionId: null };
  }
}

async function verifyPayment(
  transactionId,
  maxAttempts = 10,
  intervalSeconds = 10
) {
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await intasend.collection.status({
        transaction_id: transactionId,
      });
      const status = response.status;
      console.log(
        `Attempt ${attempt}/${maxAttempts}: Payment status is ${status}`
      );

      if (status === "COMPLETED") {
        console.log("Payment verified successfully!");
        return true;
      } else if (status === "FAILED" || status === "CANCELLED") {
        console.log("Payment failed or was cancelled.");
        return false;
      }

      // Wait before the next polling attempt
      await new Promise((resolve) =>
        setTimeout(resolve, intervalSeconds * 1000)
      );
    }

    console.log("Payment verification timed out after maximum attempts.");
    return false;
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    return false;
  }
}

async function main() {
  // Example payment details
  const amount = 10; // Amount in specified currency
  const currency = "KES"; // Currency code (e.g., KES for Kenyan Shilling)
  const customerEmail = "omondielvin@gmail.com";
  const customerPhone = "+254790670542"; // Replace with valid phone number
  const description = "Test Payment";

  // Create payment link
  const { paymentLink, transactionId } = await createPaymentLink(
    amount,
    currency,
    customerEmail,
    customerPhone,
    description
  );

  if (!paymentLink || !transactionId) {
    console.error("Failed to create payment link.");
    return;
  }

  console.log("Payment Link:", paymentLink);
  console.log("Transaction ID:", transactionId);

  // Verify payment
  const isPaymentVerified = await verifyPayment(transactionId);
  console.log("Payment Verification Result:", isPaymentVerified);
}

// Run the main function
main().catch((error) => console.error("Error in main:", error.message));
