// getUnsplashImages.js
const fs = require("fs");
const axios = require("axios");
// run this code where axios is present
// Make sure to set this in your .env file
const UNSPLASH_ACCESS_KEY = "vN1106m4c7Ujug8GxHI4xIgrPpGiDpKKwIzllyscatI";

async function getUnsplashImages() {
  try {
    const images = [];
    const queries = [
      "fashion",
      "clothing",
      "t-shirt",
      "jeans",
      "dress",
      "shoes",
      "accessories",
      "hoodie",
      "blazer",
      "activewear",
    ];

    for (let i = 0; i < 30; i++) {
      const query = queries[Math.floor(Math.random() * queries.length)];
      const response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`
      );

      const imageData = {
        id: response.data.id,
        url: response.data.urls.regular,
        description:
          response.data.description ||
          response.data.alt_description ||
          `Fashion image ${i + 1}`,
        width: response.data.width,
        height: response.data.height,
        color: response.data.color,
        download_location: response.data.links.download_location,
      };

      images.push(imageData);
      console.log(`Fetched image ${i + 1}: ${imageData.url}`);

      // Add slight delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Save to file
    fs.writeFileSync("unsplashImages.json", JSON.stringify(images, null, 2));
    console.log("Successfully saved 30 image URLs to unsplashImages.json");
  } catch (error) {
    console.error("Error fetching images from Unsplash:", error.message);
  }
}

getUnsplashImages();
