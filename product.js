const fallbackCatalog = window.JFProducts || {};
const params = new URLSearchParams(window.location.search);
const requestedProductKey = params.get("product") || "dining-chairs";
const supabaseClient = window.supabase && typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_ANON_KEY !== "undefined"
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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

let currentProductKey = requestedProductKey;
let currentProduct = null;
let selectedColor = "Default";
let selectedImages = [];
let productCollection = Object.entries(fallbackCatalog).map(([key, product]) => ({ key, ...product }));

function formatPrice(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function mapSupabaseProduct(item) {
  return {
    key: item.slug,
    title: item.name,
    price: formatPrice(item.price),
    priceValue: Number(item.price || 0),
    category: item.category || "General",
    material: item.material || "General",
    description: item.description || "Crafted for modern interiors with clean silhouettes and everyday comfort.",
    colors: [{ name: "Default", hex: "#d9d9d9" }],
    images: [item.image_url || ""]
  };
}

function updatePresentation(color) {
  const variant = currentProduct.variants?.[color.name];
  selectedImages = variant?.images || currentProduct.images;
  selectedColorLabel.textContent = color.name;

  if (detailHero) {
    detailHero.style.setProperty("--detail-accent", variant?.accent || color.hex || "#d9d9d9");
  }

  mainImage.src = selectedImages[0];
  mainImage.alt = `${currentProduct.title} ${color.name}`;
  renderThumbs(selectedImages);
}

function renderThumbs(images) {
  thumbGallery.innerHTML = "";

  images.forEach((image, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `thumb-button${index === 0 ? " is-active" : ""}`;
    button.setAttribute("aria-label", `Preview ${currentProduct.title} image ${index + 1}`);

    const img = document.createElement("img");
    img.src = image;
    img.alt = `${currentProduct.title} thumbnail ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";
    button.appendChild(img);

    button.addEventListener("click", () => {
      mainImage.src = image;
      mainImage.alt = `${currentProduct.title} image ${index + 1}`;
      thumbGallery.querySelectorAll(".thumb-button").forEach((thumb) => {
        thumb.classList.remove("is-active");
      });
      button.classList.add("is-active");
    });

    thumbGallery.appendChild(button);
  });
}

function renderRecommendations() {
  if (!recommendationGrid) {
    return;
  }

  recommendationGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  productCollection
    .filter((item) => item.key !== currentProductKey)
    .slice(0, 3)
    .forEach((item) => {
      const card = document.createElement("a");
      card.className = "recommendation-card";
      card.href = `product.html?product=${item.key}`;
      card.innerHTML = `
        <div class="recommendation-media">
          <img src="${item.images[0]}" alt="${item.title}" loading="lazy" decoding="async">
        </div>
        <div class="recommendation-body">
          <p>${item.category}</p>
          <h3>${item.title}</h3>
          <strong>${item.price}</strong>
        </div>
      `;
      fragment.appendChild(card);
    });

  recommendationGrid.appendChild(fragment);
}

function bindAddToCart() {
  if (!addToCartButton || !window.JFStore || !currentProduct) {
    return;
  }

  const freshButton = addToCartButton.cloneNode(true);
  addToCartButton.replaceWith(freshButton);

  freshButton.addEventListener("click", () => {
    window.JFStore.addToCart({
      id: `${currentProductKey}-${selectedColor.toLowerCase().replace(/\s+/g, "-")}`,
      productKey: currentProductKey,
      title: currentProduct.title,
      color: selectedColor,
      priceValue: currentProduct.priceValue || window.JFStore.parsePrice(currentProduct.price),
      image: selectedImages[0]
    });
  });
}

function renderColorOptions() {
  colorOptions.innerHTML = "";

  currentProduct.colors.forEach((color, index) => {
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
}

function renderProduct(product, key) {
  currentProduct = product;
  currentProductKey = key;
  selectedColor = currentProduct.colors?.[0]?.name || "Default";
  selectedImages = currentProduct.images || [];

  productTitle.textContent = currentProduct.title;
  productPrice.textContent = currentProduct.price;
  productDescription.textContent = currentProduct.description;
  mainImage.src = currentProduct.images[0];
  mainImage.alt = currentProduct.title;
  document.title = `${currentProduct.title} | JF Furniture`;

  renderColorOptions();
  updatePresentation(currentProduct.colors[0] || { name: "Default", hex: "#d9d9d9" });
  bindAddToCart();
  renderRecommendations();
}

async function loadSupabaseProducts() {
  if (!supabaseClient) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data.map(mapSupabaseProduct);
}

async function initProductPage() {
  const supabaseProducts = await loadSupabaseProducts();
  if (supabaseProducts) {
    productCollection = supabaseProducts;
  }

  const supabaseMatch = productCollection.find((item) => item.key === requestedProductKey);
  const fallbackProduct = fallbackCatalog[requestedProductKey] || fallbackCatalog["dining-chairs"];
  const productToRender = supabaseMatch || fallbackProduct;
  const keyToRender = productToRender?.key || requestedProductKey || "dining-chairs";

  renderProduct(productToRender, keyToRender);
}

initProductPage();
