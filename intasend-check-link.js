const IntaSend = require("intasend-node");

let intasend = new IntaSend(
  "ISPubKey_live_5ad888ac-01e9-40bf-ba17-2dbbb9be1fef",
  "ISSecretKey_live_ed4e8327-c880-4bc3-8efb-f1e8bedfa825",
  false // Test ? Set true for test environment
);

let collection = intasend.collection();
collection
  .charge({
    first_name: "Elvin",
    last_name: "Omondi",
    email: "omondielvin@gmail.com",
    host: "http://localhost:3000",
    amount: 10,
    currency: "KES",
    api_ref: "test",
    redirect_url: "http://localhost:3000",
  })
  .then((resp) => {
    console.log(`Charge Resp:`, resp);
  })
  .catch((err) => {
    console.error(`Charge error:`, err);
  });
