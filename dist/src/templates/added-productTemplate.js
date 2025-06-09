"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTemplate = productTemplate;
const custom_ntf_1 = require("../lib/custom-ntf");
function productTemplate(productWithContents) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47;
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
          <a href="${custom_ntf_1.baseUrl + "/" + ((_b = (_a = productWithContents.products) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id)}" class="product-card">
            <img
              src="${(_c = productWithContents.products[0].images) === null || _c === void 0 ? void 0 : _c[0]}"
              alt="${(_d = productWithContents.products[0]) === null || _d === void 0 ? void 0 : _d.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_e = productWithContents.products[0]) === null || _e === void 0 ? void 0 : _e.name}</h3>
              <div class="product-price">
                Kes ${(_f = productWithContents.products[0]) === null || _f === void 0 ? void 0 : _f.offerPrice}
                <span class="original-price">Kes ${(_g = productWithContents.products[0]) === null || _g === void 0 ? void 0 : _g.price}</span>
              </div>
              <p class="product-description">${(_h = productWithContents.products[0]) === null || _h === void 0 ? void 0 : _h.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_j = productWithContents.products[1]) === null || _j === void 0 ? void 0 : _j.id)}" class="product-card">
            <img
              src="${(_k = productWithContents.products[1]) === null || _k === void 0 ? void 0 : _k.images[0]}"
              alt="${(_l = productWithContents.products[1]) === null || _l === void 0 ? void 0 : _l.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_m = productWithContents.products[1]) === null || _m === void 0 ? void 0 : _m.name}</h3>
              <div class="product-price">
                Kes ${(_o = productWithContents.products[1]) === null || _o === void 0 ? void 0 : _o.offerPrice}
                <span class="original-price">Kes ${(_p = productWithContents.products[1]) === null || _p === void 0 ? void 0 : _p.price}</span>
              </div>
              <p class="product-description">${(_q = productWithContents.products[1]) === null || _q === void 0 ? void 0 : _q.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_r = productWithContents.products[2]) === null || _r === void 0 ? void 0 : _r.id)}" class="product-card">
            <img
              src="${(_s = productWithContents.products[2]) === null || _s === void 0 ? void 0 : _s.images[0]}"
              alt="${(_t = productWithContents.products[2]) === null || _t === void 0 ? void 0 : _t.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_u = productWithContents.products[2]) === null || _u === void 0 ? void 0 : _u.name}</h3>
              <div class="product-price">
                Kes ${(_v = productWithContents.products[2]) === null || _v === void 0 ? void 0 : _v.offerPrice}
                <span class="original-price">Kes ${(_w = productWithContents.products[2]) === null || _w === void 0 ? void 0 : _w.price}</span>
              </div>
              <p class="product-description">${(_x = productWithContents.products[2]) === null || _x === void 0 ? void 0 : _x.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_y = productWithContents.products[3]) === null || _y === void 0 ? void 0 : _y.id)}" class="product-card">
            <img
              src="${(_z = productWithContents.products[3]) === null || _z === void 0 ? void 0 : _z.images[0]}"
              alt="${(_0 = productWithContents.products[3]) === null || _0 === void 0 ? void 0 : _0.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_1 = productWithContents.products[3]) === null || _1 === void 0 ? void 0 : _1.name}</h3>
              <div class="product-price">
                Kes ${(_2 = productWithContents.products[3]) === null || _2 === void 0 ? void 0 : _2.offerPrice}
                <span class="original-price">Kes ${(_3 = productWithContents.products[3]) === null || _3 === void 0 ? void 0 : _3.price}</span>
              </div>
              <p class="product-description">${(_4 = productWithContents.products[3]) === null || _4 === void 0 ? void 0 : _4.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_5 = productWithContents.products[4]) === null || _5 === void 0 ? void 0 : _5.id)}" class="product-card">
            <img
              src="${(_6 = productWithContents.products[4]) === null || _6 === void 0 ? void 0 : _6.images[0]}"
              alt="${(_7 = productWithContents.products[4]) === null || _7 === void 0 ? void 0 : _7.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_8 = productWithContents.products[4]) === null || _8 === void 0 ? void 0 : _8.name}</h3>
              <div class="product-price">
                Kes ${(_9 = productWithContents.products[4]) === null || _9 === void 0 ? void 0 : _9.offerPrice}
                <span class="original-price">Kes ${(_10 = productWithContents.products[4]) === null || _10 === void 0 ? void 0 : _10.price}</span>
              </div>
              <p class="product-description">${(_11 = productWithContents.products[4]) === null || _11 === void 0 ? void 0 : _11.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_12 = productWithContents.products[5]) === null || _12 === void 0 ? void 0 : _12.id)}" class="product-card">
            <img
              src="${(_13 = productWithContents.products[5]) === null || _13 === void 0 ? void 0 : _13.images[0]}"
              alt="${(_14 = productWithContents.products[5]) === null || _14 === void 0 ? void 0 : _14.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_15 = productWithContents.products[5]) === null || _15 === void 0 ? void 0 : _15.name}</h3>
              <div class="product-price">
                Kes ${(_16 = productWithContents.products[5]) === null || _16 === void 0 ? void 0 : _16.offerPrice}
                <span class="original-price">Kes ${(_17 = productWithContents.products[5]) === null || _17 === void 0 ? void 0 : _17.price}</span>
              </div>
              <p class="product-description">${(_18 = productWithContents.products[5]) === null || _18 === void 0 ? void 0 : _18.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_19 = productWithContents.products[6]) === null || _19 === void 0 ? void 0 : _19.id)}" class="product-card">
            <img
              src="${(_20 = productWithContents.products[6]) === null || _20 === void 0 ? void 0 : _20.images[0]}"
              alt="${(_21 = productWithContents.products[6]) === null || _21 === void 0 ? void 0 : _21.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_22 = productWithContents.products[6]) === null || _22 === void 0 ? void 0 : _22.name}</h3>
              <div class="product-price">
                Kes ${(_23 = productWithContents.products[6]) === null || _23 === void 0 ? void 0 : _23.offerPrice}
                <span class="original-price">Kes ${(_24 = productWithContents.products[6]) === null || _24 === void 0 ? void 0 : _24.price}</span>
              </div>
              <p class="product-description">${(_25 = productWithContents.products[6]) === null || _25 === void 0 ? void 0 : _25.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_26 = productWithContents.products[7]) === null || _26 === void 0 ? void 0 : _26.id)}" class="product-card">
            <img
              src="${(_27 = productWithContents.products[7]) === null || _27 === void 0 ? void 0 : _27.images[0]}"
              alt="${(_28 = productWithContents.products[7]) === null || _28 === void 0 ? void 0 : _28.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_29 = productWithContents.products[7]) === null || _29 === void 0 ? void 0 : _29.name}</h3>
              <div class="product-price">
                Kes ${(_30 = productWithContents.products[7]) === null || _30 === void 0 ? void 0 : _30.offerPrice}
                <span class="original-price">Kes ${(_31 = productWithContents.products[7]) === null || _31 === void 0 ? void 0 : _31.price}</span>
              </div>
              <p class="product-description">${(_32 = productWithContents.products[7]) === null || _32 === void 0 ? void 0 : _32.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_33 = productWithContents.products[8]) === null || _33 === void 0 ? void 0 : _33.id)}" class="product-card">
            <img
              src="${(_34 = productWithContents.products[8]) === null || _34 === void 0 ? void 0 : _34.images[0]}"
              alt="${(_35 = productWithContents.products[8]) === null || _35 === void 0 ? void 0 : _35.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_36 = productWithContents.products[8]) === null || _36 === void 0 ? void 0 : _36.name}</h3>
              <div class="product-price">
                Kes ${(_37 = productWithContents.products[8]) === null || _37 === void 0 ? void 0 : _37.offerPrice}
                <span class="original-price">Kes ${(_38 = productWithContents.products[8]) === null || _38 === void 0 ? void 0 : _38.price}</span>
              </div>
              <p class="product-description">${(_39 = productWithContents.products[8]) === null || _39 === void 0 ? void 0 : _39.description}</p>
            </div>
          </a>

          <a href="${custom_ntf_1.baseUrl + "/" + ((_40 = productWithContents.products[9]) === null || _40 === void 0 ? void 0 : _40.id)}" class="product-card">
            <img
              src="${(_41 = productWithContents.products[9]) === null || _41 === void 0 ? void 0 : _41.images[0]}"
              alt="${(_42 = productWithContents.products[9]) === null || _42 === void 0 ? void 0 : _42.name}"
              class="product-image"
            />
            <div class="product-details">
              <h3 class="product-name">${(_43 = productWithContents.products[9]) === null || _43 === void 0 ? void 0 : _43.name}</h3>
              <div class="product-price">
                Kes ${(_44 = productWithContents.products[9]) === null || _44 === void 0 ? void 0 : _44.offerPrice}
                <span class="original-price">Kes ${(_45 = productWithContents.products[9]) === null || _45 === void 0 ? void 0 : _45.price}</span>
              </div>
              <p class="product-description">${(_46 = productWithContents.products[9]) === null || _46 === void 0 ? void 0 : _46.description}</p>
            </div>
          </a>
        </div>

        <div class="cta">
          <a href="${(_47 = productWithContents.pageLinks) === null || _47 === void 0 ? void 0 : _47.allProducts}" class="cta-button"
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
