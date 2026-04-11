const heroSlider = document.querySelector("[data-hero-slider]");
const homeProducts = window.JFProducts || {};
const fallbackProducts = Object.entries(homeProducts).map(([key, product]) => ({ key, ...product }));
const homeProductGrid = document.getElementById("homeProductGrid");
let currentHomeProducts = [...fallbackProducts];
const supabaseClient = window.supabase && typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_ANON_KEY !== "undefined"
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function t(key, fallback) {
  return window.JFLang?.t ? window.JFLang.t(key, fallback) : (fallback || key);
}

if (heroSlider) {
  const track = heroSlider.querySelector("[data-hero-track]");
  const slides = Array.from(heroSlider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(heroSlider.querySelectorAll("[data-hero-dot]"));
  const prevButton = heroSlider.querySelector("[data-hero-prev]");
  const nextButton = heroSlider.querySelector("[data-hero-next]");
  let currentIndex = 0;
  let startX = 0;
  let endX = 0;

  function renderSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });
  }

  prevButton?.addEventListener("click", () => renderSlide(currentIndex - 1));
  nextButton?.addEventListener("click", () => renderSlide(currentIndex + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => renderSlide(index));
  });

  track.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", (event) => {
    endX = event.changedTouches[0].clientX;
    const distance = endX - startX;

    if (Math.abs(distance) < 50) {
      return;
    }

    renderSlide(distance < 0 ? currentIndex + 1 : currentIndex - 1);
  }, { passive: true });

  renderSlide(0);
}

function bindHomeCartButtons() {
  document.querySelectorAll("[data-home-add-cart]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const productKey = button.getAttribute("data-product-key");
      const product = currentHomeProducts.find((item) => item.key === productKey) || homeProducts[productKey] || fallbackProducts.find((item) => item.key === productKey);

      if (!product || !window.JFStore) {
        return;
      }

      const firstColor = product.colors?.[0]?.name || "Default";
      const firstImage = product.images?.[0] || "";

      window.JFStore.addToCart({
        id: `${productKey}-${firstColor.toLowerCase().replace(/\s+/g, "-")}`,
        productKey,
        title: product.title,
        color: firstColor,
        priceValue: product.priceValue,
        image: firstImage
      });
    });
  });
}

function renderHomeProducts(list) {
  if (!homeProductGrid || !Array.isArray(list) || list.length === 0) {
    bindHomeCartButtons();
    return;
  }

  currentHomeProducts = [...list];
  homeProductGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  list.slice(0, 8).forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <a class="product-card-link" href="product.html?product=${product.key}">
        <div class="product-image">
          <img src="${product.images[0]}" alt="${product.title}" loading="lazy" decoding="async">
        </div>
        <div class="product-body">
          <h3>${product.title}</h3>
          <p class="price">${product.price}</p>
        </div>
      </a>
      <button class="cart-button homepage-cart-button" type="button" data-home-add-cart data-product-key="${product.key}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 4h2l2.2 10.1a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20 7H7.1"></path>
          <circle cx="10" cy="19" r="1.3"></circle>
          <circle cx="17" cy="19" r="1.3"></circle>
        </svg>
        ${t("Add to cart", "Add to cart")}
      </button>
    `;
    fragment.appendChild(card);
  });

  homeProductGrid.appendChild(fragment);

  bindHomeCartButtons();
}

async function loadHomeProducts() {
  if (!supabaseClient) {
    bindHomeCartButtons();
    return;
  }

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && Array.isArray(data) && data.length > 0) {
    const mapped = data.map((item) => ({
      key: item.slug,
      title: item.name,
      price: `Rp ${Number(item.price || 0).toLocaleString("id-ID")}`,
      priceValue: Number(item.price || 0),
      colors: [{ name: "Default", hex: "#d9d9d9" }],
      images: [item.image_url || ""]
    }));
    renderHomeProducts(mapped);
    return;
  }

  bindHomeCartButtons();
}

loadHomeProducts();

window.addEventListener("jf:language-updated", () => {
  document.querySelectorAll(".homepage-cart-button").forEach((button) => {
    button.lastChild.textContent = ` ${t("Add to cart", "Add to cart")}`;
  });
});
