const CART_KEY = "jf-furniture-cart";
function t(key, fallback) {
  return window.JFLang?.t ? window.JFLang.t(key, fallback) : (fallback || key);
}

function safeRead(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function getCart() {
  return safeRead(CART_KEY, []);
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("jf:cart-updated"));
}

function formatRupiah(amount) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function parsePrice(priceText) {
  return Number(priceText.replace(/[^\d]/g, "")) || 0;
}

function showToast(message) {
  const stack = document.querySelector("[data-toast-stack]");
  if (!stack) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.textContent = message;
  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("is-visible");
  }, 20);

  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 2200);
}

function getAddedToCartMessage(title) {
  return window.JFLang?.get?.() === "id"
    ? `${title} ditambahkan ke keranjang`
    : `${title} added to cart`;
}

function syncStaticCartText() {
  document.querySelectorAll(".cart-kicker").forEach((node) => {
    node.textContent = t("Your Cart", "Your Cart");
  });
  document.querySelectorAll(".cart-drawer-header h2").forEach((node) => {
    node.textContent = t("Selected Items", "Selected Items");
  });
  document.querySelectorAll("[data-cart-empty]").forEach((node) => {
    node.textContent = t("Your cart is still empty.", "Your cart is still empty.");
  });
  document.querySelectorAll(".cart-total-row span").forEach((node) => {
    node.textContent = t("Total", "Total");
  });
  document.querySelectorAll(".cart-checkout").forEach((node) => {
    node.textContent = t("Checkout", "Checkout");
  });
}

function updateCartBadges(cart) {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = totalCount;
    badge.hidden = totalCount === 0;
  });
}

function changeQuantity(itemId, delta) {
  const cart = getCart();
  const updated = cart
    .map((item) => item.id === itemId ? { ...item, quantity: item.quantity + delta } : item)
    .filter((item) => item.quantity > 0);

  saveCart(updated);
  renderCartDrawer();
}

function renderCartDrawer() {
  const cart = getCart();
  const list = document.querySelector("[data-cart-items]");
  const empty = document.querySelector("[data-cart-empty]");
  const total = document.querySelector("[data-cart-total]");

  if (!list || !empty || !total) {
    return;
  }

  list.innerHTML = "";

  if (cart.length === 0) {
    empty.hidden = false;
    total.textContent = "Rp 0";
    updateCartBadges(cart);
    return;
  }

  empty.hidden = true;
  let grandTotal = 0;

  cart.forEach((item) => {
    grandTotal += item.priceValue * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";

    const thumb = document.createElement("img");
    thumb.className = "cart-item-image";
    thumb.src = item.image;
    thumb.alt = item.title;
    thumb.loading = "lazy";
    thumb.decoding = "async";

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const meta = document.createElement("p");
    meta.textContent = `${item.color || t("Default", "Default")} - ${formatRupiah(item.priceValue)}`;

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const quantityWrap = document.createElement("div");
    quantityWrap.className = "cart-quantity";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "quantity-button";
    minus.textContent = "-";
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "quantity-button";
    plus.textContent = "+";
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.textContent = t("Remove", "Remove");
    remove.addEventListener("click", () => {
      saveCart(getCart().filter((cartItem) => cartItem.id !== item.id));
      renderCartDrawer();
    });

    quantityWrap.append(minus, quantity, plus);
    actions.append(quantityWrap, remove);
    info.append(title, meta, actions);
    row.append(thumb, info);
    list.appendChild(row);
  });

  total.textContent = formatRupiah(grandTotal);
  updateCartBadges(cart);
  syncStaticCartText();
}

function openCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");

  if (!drawer || !overlay) {
    return;
  }

  renderCartDrawer();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  overlay.classList.add("is-visible");
  document.querySelectorAll(".cart-toggle").forEach((button) => {
    button.setAttribute("aria-expanded", "true");
  });
}

function closeCart() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");

  if (!drawer || !overlay) {
    return;
  }

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("is-visible");
  overlay.hidden = true;
  document.querySelectorAll(".cart-toggle").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
}

function openSearch() {
  const popover = document.querySelector("[data-search-popover]");
  const overlay = document.querySelector("[data-search-overlay]");

  if (!popover || !overlay) {
    return;
  }

  popover.classList.add("is-open");
  popover.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  overlay.classList.add("is-visible");
  document.querySelectorAll(".search-toggle").forEach((button) => {
    button.setAttribute("aria-expanded", "true");
  });

  const input = popover.querySelector("input[type='search']");
  if (input) {
    window.setTimeout(() => input.focus(), 50);
  }
}

function closeSearch() {
  const popover = document.querySelector("[data-search-popover]");
  const overlay = document.querySelector("[data-search-overlay]");

  if (!popover || !overlay) {
    return;
  }

  popover.classList.remove("is-open");
  popover.setAttribute("aria-hidden", "true");
  overlay.classList.remove("is-visible");
  overlay.hidden = true;
  document.querySelectorAll(".search-toggle").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
}

function syncBackToTopButton() {
  const button = document.querySelector("[data-back-to-top]");
  if (button) {
    button.classList.toggle("is-visible", window.scrollY > 280);
  }
}

function toggleMenu() {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");

  if (!header || !menuButton) {
    return;
  }

  const next = !header.classList.contains("menu-open");
  header.classList.toggle("menu-open", next);
  menuButton.setAttribute("aria-expanded", next ? "true" : "false");
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  renderCartDrawer();
  openCart();
  showToast(getAddedToCartMessage(product.title));
}

function initScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const revealTargets = document.querySelectorAll(
    ".hero, .products, .shopping-hero, .shop-controls, .shopping-results, .detail-layout, .recommendations, .checkout-hero, .checkout-layout, .about-hero, .about-story, .about-values, .about-cta, .contact-hero, .contact-grid, .contact-note, .admin-panel"
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal-element");
    element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  });

  revealTargets.forEach((element) => observer.observe(element));
}

function initAmbientMotion() {
  const heroMedia = document.querySelector(".hero-media");
  if (!heroMedia || window.innerWidth < 981 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const image = heroMedia.querySelector("img");
  if (!image) {
    return;
  }

  heroMedia.addEventListener("pointermove", (event) => {
    const bounds = heroMedia.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    image.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.015)`;
  });

  heroMedia.addEventListener("pointerleave", () => {
    image.style.transform = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  syncStaticCartText();
  renderCartDrawer();
  syncBackToTopButton();
  initScrollReveal();
  initAmbientMotion();

  document.querySelectorAll(".cart-toggle").forEach((button) => {
    button.addEventListener("click", openCart);
  });

  document.querySelectorAll("[data-cart-close]").forEach((button) => {
    button.addEventListener("click", closeCart);
  });

  document.querySelectorAll("[data-cart-overlay]").forEach((overlay) => {
    overlay.addEventListener("click", closeCart);
  });

  document.querySelectorAll(".search-toggle").forEach((button) => {
    button.addEventListener("click", openSearch);
  });

  document.querySelectorAll("[data-search-overlay]").forEach((overlay) => {
    overlay.addEventListener("click", closeSearch);
  });

  const menuButton = document.querySelector(".menu-toggle");
  if (menuButton) {
    menuButton.addEventListener("click", toggleMenu);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeSearch();
    }
  });

  const backToTopButton = document.querySelector("[data-back-to-top]");
  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", syncBackToTopButton, { passive: true });
});

window.addEventListener("jf:language-updated", () => {
  syncStaticCartText();
  renderCartDrawer();
});

window.JFStore = {
  addToCart,
  closeCart,
  formatRupiah,
  getCart,
  openCart,
  parsePrice,
  renderCartDrawer,
  showToast
};
