// const axios = require("axios");

// // IntaSend API credentials
// const PUBLISHABLE_KEY = "ISPubKey_live_5ad888ac-01e9-40bf-ba17-2dbbb9be1fef";
// const SECRET_KEY = "SSecretKey_live_ed4e8327-c880-4bc3-8efb-f1e8bedfa825";

// // IntaSend API endpoints
// const STK_PUSH_URL =
//   "https://payment.intasend.com/api/v1/payment/mpesa-stk-push/";

// /**
//  * Initiate M-Pesa STK Push payment request
//  * @param {string} phoneNumber - Customer phone number in format 2547XXXXXXXX
//  * @param {number} amount - Payment amount
//  * @param {string} narrative - Payment description
//  * @returns {Promise} - API response
//  */
// async function initiateStkPush(phoneNumber, amount, narrative) {
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${PUBLISHABLE_KEY}:${SECRET_KEY}`,
//     };

//     const payload = {
//       first_name: "Customer", // Optional
//       last_name: "User", // Optional
//       phone_number: phoneNumber,
//       email: "omondielvin@gmail.com", // Optional
//       amount: amount,
//       currency: "KES",
//       narrative: narrative,
//       api_ref: `order_${Date.now()}`, // Unique reference
//     };

//     const response = await axios.post(STK_PUSH_URL, payload, { headers });
//     return response.data;
//   } catch (error) {
//     console.error("STK Push Error:", error.response?.data || error.message);
//     throw error;
//   }
// }

// // Example usage
// (async () => {
//   try {
//     const phoneNumber = "254790670542"; // Replace with customer's phone number
//     const amount = 10; // KES 10
//     const narrative = "Test payment";

//     const result = await initiateStkPush(phoneNumber, amount, narrative);
//     console.log("STK Push Response:", result);

//     if (result.status === "PENDING") {
//       console.log(
//         "STK Push initiated successfully. Waiting for customer to complete payment..."
//       );
//     }
//   } catch (error) {
//     console.error("Error in example usage:", error);
//   }
// })();

const IntaSend = require("intasend-node");

let intasend = new IntaSend(
  "ISPubKey_live_5ad888ac-01e9-40bf-ba17-2dbbb9be1fef",
  "SSecretKey_live_ed4e8327-c880-4bc3-8efb-f1e8bedfa825",
  false // Test ? Set true for test environment
);

let collection = intasend.collection();
collection
  .mpesaStkPush({
    first_name: "Ely",
    last_name: "Doe",
    email: "joe@doe.com",
    host: "https://yourwebsite.com",
    amount: 10,
    phone_number: "254790670542",
    api_ref: "test-22",
  })
  .then((resp) => {
    // Redirect user to URL to complete payment
    console.log(`STK Push Resp:`, resp);
  })
  .catch((err) => {
    console.error(`STK Push Resp error:`, err);
  });
