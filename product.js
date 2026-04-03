const productCatalog = window.JFProducts || {};

const params = new URLSearchParams(window.location.search);
const productKey = params.get("product") || "dining-chairs";
const product = productCatalog[productKey] || productCatalog["dining-chairs"];

const mainImage = document.getElementById("mainProductImage");
const thumbGallery = document.getElementById("thumbGallery");
const productTitle = document.getElementById("productTitle");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const colorOptions = document.getElementById("colorOptions");
const selectedColorLabel = document.getElementById("selectedColorLabel");
const addToCartButton = document.getElementById("addToCartButton");
const recommendationGrid = document.getElementById("recommendationGrid");
const detailHero = document.querySelector(".detail-main-image");
let selectedColor = product.colors[0].name;
let selectedImages = product.images;

function updatePresentation(color) {
  const variant = product.variants?.[color.name];
  selectedImages = variant?.images || product.images;
  selectedColorLabel.textContent = color.name;
  if (detailHero) {
    detailHero.style.setProperty("--detail-accent", variant?.accent || color.hex);
  }

  mainImage.src = selectedImages[0];
  mainImage.alt = `${product.title} ${color.name}`;
  renderThumbs(selectedImages);
}

function renderThumbs(images) {
  thumbGallery.innerHTML = "";

  images.forEach((image, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `thumb-button${index === 0 ? " is-active" : ""}`;
    button.setAttribute("aria-label", `Preview ${product.title} image ${index + 1}`);

    const img = document.createElement("img");
    img.src = image;
    img.alt = `${product.title} thumbnail ${index + 1}`;
    button.appendChild(img);

    button.addEventListener("click", () => {
      mainImage.src = image;
      mainImage.alt = `${product.title} image ${index + 1}`;
      thumbGallery.querySelectorAll(".thumb-button").forEach((thumb) => {
        thumb.classList.remove("is-active");
      });
      button.classList.add("is-active");
    });

    thumbGallery.appendChild(button);
  });
}

productTitle.textContent = product.title;
productPrice.textContent = product.price;
productDescription.textContent = product.description;
mainImage.src = product.images[0];
mainImage.alt = product.title;
document.title = `${product.title} | JF Furniture`;
updatePresentation(product.colors[0]);

product.colors.forEach((color, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `color-swatch${index === 0 ? " is-active" : ""}`;
  button.setAttribute("aria-label", color.name);
  button.style.setProperty("--swatch-color", color.hex);

  button.addEventListener("click", () => {
    colorOptions.querySelectorAll(".color-swatch").forEach((swatch) => {
      swatch.classList.remove("is-active");
    });
    button.classList.add("is-active");
    selectedColor = color.name;
    updatePresentation(color);
  });

  colorOptions.appendChild(button);
});

if (addToCartButton && window.JFStore) {
  addToCartButton.addEventListener("click", () => {
    window.JFStore.addToCart({
      id: `${productKey}-${selectedColor.toLowerCase().replace(/\s+/g, "-")}`,
      productKey,
      title: product.title,
      color: selectedColor,
      priceValue: product.priceValue || window.JFStore.parsePrice(product.price),
      image: selectedImages[0]
    });
  });
}

if (recommendationGrid) {
  Object.entries(productCatalog)
    .filter(([key]) => key !== productKey)
    .slice(0, 3)
    .forEach(([key, item]) => {
      const card = document.createElement("a");
      card.className = "recommendation-card";
      card.href = `product.html?product=${key}`;
      card.innerHTML = `
        <div class="recommendation-media">
          <img src="${item.images[0]}" alt="${item.title}">
        </div>
        <div class="recommendation-body">
          <p>${item.category}</p>
          <h3>${item.title}</h3>
          <strong>${item.price}</strong>
        </div>
      `;
      recommendationGrid.appendChild(card);
    });
}
