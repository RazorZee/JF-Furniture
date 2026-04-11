const checkoutItems = document.getElementById("checkoutItems");
const checkoutEmpty = document.getElementById("checkoutEmpty");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutShipping = document.getElementById("checkoutShipping");
const checkoutTotal = document.getElementById("checkoutTotal");
const placeOrderButton = document.getElementById("placeOrderButton");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutName = document.getElementById("checkoutName");
const checkoutEmail = document.getElementById("checkoutEmail");
const checkoutPhone = document.getElementById("checkoutPhone");
const checkoutAddress = document.getElementById("checkoutAddress");
const WHATSAPP_ORDER_URL = "https://wa.me/6281227256442";

function t(key, fallback) {
  return window.JFLang?.t ? window.JFLang.t(key, fallback) : (fallback || key);
}

function getOrderSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  const shipping = subtotal >= 300000 ? 0 : 30000;
  return {
    subtotal,
    shipping,
    total: subtotal + shipping
  };
}

function renderCheckout() {
  if (!window.JFStore || !checkoutItems) {
    return;
  }

  const cart = window.JFStore.getCart();
  checkoutItems.innerHTML = "";

  if (cart.length === 0) {
    checkoutEmpty.hidden = false;
    checkoutSubtotal.textContent = "Rp 0";
    checkoutShipping.textContent = "Rp 0";
    checkoutTotal.textContent = "Rp 0";
    placeOrderButton.disabled = true;
    return;
  }

  checkoutEmpty.hidden = true;
  placeOrderButton.disabled = false;

  const { subtotal, shipping, total } = getOrderSummary(cart);

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "checkout-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
      <div>
        <h3>${item.title}</h3>
        <p>${item.color || t("Default", "Default")} - ${t("Qty", "Qty")} ${item.quantity}</p>
      </div>
      <strong>${window.JFStore.formatRupiah(item.priceValue * item.quantity)}</strong>
    `;
    checkoutItems.appendChild(row);
  });

  checkoutSubtotal.textContent = window.JFStore.formatRupiah(subtotal);
  checkoutShipping.textContent = window.JFStore.formatRupiah(shipping);
  checkoutTotal.textContent = window.JFStore.formatRupiah(total);
}

function buildWhatsAppMessage(cart) {
  const customerName = checkoutName?.value.trim() || "-";
  const customerEmail = checkoutEmail?.value.trim() || "-";
  const customerPhone = checkoutPhone?.value.trim() || "-";
  const customerAddress = checkoutAddress?.value.trim() || "-";
  const { subtotal, shipping, total } = getOrderSummary(cart);

  const itemsText = cart.map((item, index) => (
    `${index + 1}. ${item.title}\n` +
    `   Color: ${item.color || "Default"}\n` +
    `   Qty: ${item.quantity}\n` +
    `   Total: ${window.JFStore.formatRupiah(item.priceValue * item.quantity)}`
  )).join("\n\n");

  if (window.JFLang?.get?.() === "id") {
    return [
      "Halo JF Furniture, saya ingin order produk berikut:",
      "",
      itemsText,
      "",
      "Data Pembeli:",
      `Nama: ${customerName}`,
      `Email: ${customerEmail}`,
      `No. HP: ${customerPhone}`,
      `Alamat: ${customerAddress}`,
      "",
      `Subtotal: ${window.JFStore.formatRupiah(subtotal)}`,
      `Ongkir: ${window.JFStore.formatRupiah(shipping)}`,
      `Total: ${window.JFStore.formatRupiah(total)}`
    ].join("\n");
  }

  return [
    "Hello JF Furniture, I would like to order the following products:",
    "",
    itemsText,
    "",
    "Customer Details:",
    `Name: ${customerName}`,
    `Email: ${customerEmail}`,
    `Phone: ${customerPhone}`,
    `Address: ${customerAddress}`,
    "",
    `Subtotal: ${window.JFStore.formatRupiah(subtotal)}`,
    `Shipping: ${window.JFStore.formatRupiah(shipping)}`,
    `Total: ${window.JFStore.formatRupiah(total)}`
  ].join("\n");
}

if (placeOrderButton) {
  placeOrderButton.addEventListener("click", () => {
    if (!window.JFStore) {
      return;
    }

    const cart = window.JFStore.getCart();
    if (cart.length === 0) {
      window.JFStore.showToast(t("Your cart is still empty.", "Your cart is still empty."));
      return;
    }

    if (!checkoutForm?.reportValidity()) {
      return;
    }

    const message = buildWhatsAppMessage(cart);
    const whatsappUrl = `${WHATSAPP_ORDER_URL}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    window.JFStore.showToast(t("WhatsApp order opened", "WhatsApp order opened"));
  });
}

renderCheckout();
window.addEventListener("jf:cart-updated", renderCheckout);
window.addEventListener("jf:language-updated", renderCheckout);
