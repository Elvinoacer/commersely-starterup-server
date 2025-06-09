import { product } from "@prisma/client";
import { baseUrl } from "../lib/custom-ntf";
export interface ProductEmailTemplate {
  products: product[];
  socialLinks?: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  pageLinks?: {
    unsubsribe: string;
    privacy: string;
    allProducts: string;
  };
}
export function productTemplate(productWithContents: ProductEmailTemplate) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Our Special Offers Just For You!</title>
    <style type="text/css">
      /* Base styles */
      body,
      html {
        margin: 0;
        padding: 0;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
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

      .header p {
        margin: 10px 0 0;
        font-size: 16px;
        opacity: 0.9;
      }

      /* Content */
      .content {
        padding: 20px;
      }

      /* Product grid */
      .product-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-top: 20px;
      }

      .product-card {
        border: 1px solid #eaeaea;
        border-radius: 6px;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        text-decoration: none;
        color: inherit;
        display: block;
      }

      .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }

      .product-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
      }

      .product-details {
        padding: 15px;
      }

      .product-name {
        font-weight: 600;
        font-size: 16px;
        margin: 0 0 5px;
        color: #333;
      }

      .product-price {
        color: #6e8efb;
        font-weight: 700;
        font-size: 18px;
        margin: 5px 0;
      }

      .product-description {
        font-size: 14px;
        color: #666;
        margin: 5px 0 0;
      }

      .original-price {
        text-decoration: line-through;
        color: #999;
        font-size: 14px;
        margin-left: 5px;
      }

      /* Call to action */
      .cta {
        text-align: center;
        margin: 30px 0 20px;
      }

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
        .product-grid {
          grid-template-columns: 1fr;
        }

        .header h1 {
          font-size: 24px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Special Offers Just For You!</h1>
        <p>
          Discover our curated collection of premium products at unbeatable
          prices
        </p>
      </div>

      <div class="content">
        <h2 style="text-align: center; color: #444">Featured Products</h2>

        <div class="product-grid">
          <a href="${
            baseUrl + "/" + productWithContents.products?.[0]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[0].images?.[0]}"
              alt="${productWithContents.products[0]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[0]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[0]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[0]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[0]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[1]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[1]?.images[0]}"
              alt="${productWithContents.products[1]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[1]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[1]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[1]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[1]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[2]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[2]?.images[0]}"
              alt="${productWithContents.products[2]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[2]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[2]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[2]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[2]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[3]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[3]?.images[0]}"
              alt="${productWithContents.products[3]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[3]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[3]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[3]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[3]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[4]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[4]?.images[0]}"
              alt="${productWithContents.products[4]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[4]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[4]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[4]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[4]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[5]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[5]?.images[0]}"
              alt="${productWithContents.products[5]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[5]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[5]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[5]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[5]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[6]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[6]?.images[0]}"
              alt="${productWithContents.products[6]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[6]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[6]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[6]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[6]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[7]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[7]?.images[0]}"
              alt="${productWithContents.products[7]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[7]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[7]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[7]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[7]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[8]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[8]?.images[0]}"
              alt="${productWithContents.products[8]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[8]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[8]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[8]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[8]?.description
              }</p>
            </div>
          </a>

          <a href="${
            baseUrl + "/" + productWithContents.products[9]?.id
          }" class="product-card">
            <img
              src="${productWithContents.products[9]?.images[0]}"
              alt="${productWithContents.products[9]?.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${
                productWithContents.products[9]?.name
              }</h3>
              <div class="product-price">
                Kes ${productWithContents.products[9]?.offerPrice}
                <span class="original-price">Kes ${
                  productWithContents.products[9]?.price
                }</span>
              </div>
              <p class="product-description">${
                productWithContents.products[9]?.description
              }</p>
            </div>
          </a>
        </div>

        <div class="cta">
          <a href="${
            productWithContents.pageLinks?.allProducts
          }" class="cta-button"
            >Shop All Products</a
          >
        </div>
      </div>

      <div class="footer">
        <div class="social-icons">
          <a href="">Facebook</a> • <a href="#">Instagram</a> •
          <a href="#">Twitter</a>
        </div>
        <p>© 2023 Your Company Name. All rights reserved.</p>
        <p>
          <a href="#" style="color: #777">Unsubscribe</a> |
          <a href="#" style="color: #777">Privacy Policy</a>
        </p>
        <p>123 Business Street, City, State 12345</p>
      </div>
    </div>
  </body>
</html>`;
}
