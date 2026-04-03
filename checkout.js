const checkoutItems = document.getElementById("checkoutItems");
const checkoutEmpty = document.getElementById("checkoutEmpty");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutShipping = document.getElementById("checkoutShipping");
const checkoutTotal = document.getElementById("checkoutTotal");
const placeOrderButton = document.getElementById("placeOrderButton");

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

  const subtotal = cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  const shipping = subtotal >= 300000 ? 0 : 30000;

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "checkout-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div>
        <h3>${item.title}</h3>
        <p>${item.color || "Default"} - Qty ${item.quantity}</p>
      </div>
      <strong>${window.JFStore.formatRupiah(item.priceValue * item.quantity)}</strong>
    `;
    checkoutItems.appendChild(row);
  });

  checkoutSubtotal.textContent = window.JFStore.formatRupiah(subtotal);
  checkoutShipping.textContent = window.JFStore.formatRupiah(shipping);
  checkoutTotal.textContent = window.JFStore.formatRupiah(subtotal + shipping);
}

if (placeOrderButton) {
  placeOrderButton.addEventListener("click", () => {
    if (!window.JFStore) {
      return;
    }

    window.JFStore.showToast("Order placed successfully");
    localStorage.removeItem("jf-furniture-cart");
    renderCheckout();
    if (window.JFStore.renderCartDrawer) {
      window.JFStore.renderCartDrawer();
    }
  });
}

renderCheckout();
window.addEventListener("jf:cart-updated", renderCheckout);
