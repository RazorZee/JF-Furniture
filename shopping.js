const productMap = window.JFProducts || {};
const fallbackProducts = Object.entries(productMap).map(([key, product]) => ({ key, ...product }));
let products = [...fallbackProducts];

const shoppingGrid = document.getElementById("shoppingGrid");
const shoppingEmpty = document.getElementById("shoppingEmpty");
const resultSummary = document.getElementById("resultSummary");
const productSearch = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
const materialFilter = document.getElementById("materialFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");
const resetFilters = document.getElementById("resetFilters");
const shoppingSkeletons = document.getElementById("shoppingSkeletons");
const activeFilters = document.getElementById("activeFilters");
const searchParams = new URLSearchParams(window.location.search);
const supabaseClient = window.supabase && typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_ANON_KEY !== "undefined"
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (searchParams.has("q")) {
  productSearch.value = searchParams.get("q") || "";
}

function matchesPrice(product, selectedPrice) {
  if (selectedPrice === "under-100") {
    return product.priceValue < 100000;
  }
  if (selectedPrice === "100-150") {
    return product.priceValue >= 100000 && product.priceValue <= 150000;
  }
  if (selectedPrice === "150-up") {
    return product.priceValue > 150000;
  }
  return true;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightText(text, query) {
  const safe = escapeHtml(text);
  if (!query) {
    return safe;
  }

  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return safe.replace(pattern, "<mark>$1</mark>");
}

function sortProducts(list, sortValue) {
  const sorted = [...list];
  if (sortValue === "price-asc") {
    return sorted.sort((a, b) => a.priceValue - b.priceValue);
  }
  if (sortValue === "price-desc") {
    return sorted.sort((a, b) => b.priceValue - a.priceValue);
  }
  if (sortValue === "name-asc") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
  return sorted;
}

function populateDynamicFilterOptions(selectElement, values) {
  if (!selectElement) {
    return;
  }

  const currentValue = selectElement.value || "all";
  const label = selectElement.id === "categoryFilter" ? "All" : "All";
  const uniqueValues = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  selectElement.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = label;
  selectElement.appendChild(defaultOption);

  uniqueValues.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });

  selectElement.value = uniqueValues.includes(currentValue) ? currentValue : "all";
}

function renderProducts(list, query) {
  shoppingGrid.innerHTML = "";

  if (list.length === 0) {
    shoppingEmpty.hidden = false;
    resultSummary.textContent = "Showing 0 products";
    return;
  }

  shoppingEmpty.hidden = true;
  resultSummary.textContent = `Showing ${list.length} product${list.length > 1 ? "s" : ""}`;

  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "shopping-card";

    card.innerHTML = `
      <a class="shopping-card-media" href="product.html?product=${product.key}">
        <img src="${product.images[0]}" alt="${product.title}">
      </a>
      <div class="shopping-card-body">
        <div class="shopping-card-top">
          <div>
            <p class="shopping-card-tag">${product.category} - ${product.material}</p>
            <h2><a href="product.html?product=${product.key}">${highlightText(product.title, query)}</a></h2>
          </div>
          <strong>${product.price}</strong>
        </div>
        <p class="shopping-card-copy">${highlightText(product.description, query)}</p>
        <div class="shopping-card-actions">
          <a class="shopping-detail-link" href="product.html?product=${product.key}">View detail</a>
          <button class="shopping-add-button" type="button">Add to cart</button>
        </div>
      </div>
    `;

    card.querySelector(".shopping-add-button").addEventListener("click", () => {
      window.JFStore?.addToCart({
        id: `${product.key}-${product.colors[0].name.toLowerCase().replace(/\s+/g, "-")}`,
        productKey: product.key,
        title: product.title,
        color: product.colors[0].name,
        priceValue: product.priceValue,
        image: product.images[0]
      });
    });

    shoppingGrid.appendChild(card);
  });
}

function renderActiveFilters() {
  const items = [];

  if (productSearch.value.trim()) {
    items.push({ label: `Search: ${productSearch.value.trim()}`, clear: () => { productSearch.value = ""; } });
  }
  if (categoryFilter.value !== "all") {
    items.push({ label: categoryFilter.value, clear: () => { categoryFilter.value = "all"; } });
  }
  if (materialFilter.value !== "all") {
    items.push({ label: materialFilter.value, clear: () => { materialFilter.value = "all"; } });
  }
  if (priceFilter.value !== "all") {
    items.push({ label: priceFilter.options[priceFilter.selectedIndex].text, clear: () => { priceFilter.value = "all"; } });
  }
  if (sortFilter.value !== "featured") {
    items.push({ label: `Sort: ${sortFilter.options[sortFilter.selectedIndex].text}`, clear: () => { sortFilter.value = "featured"; } });
  }

  activeFilters.innerHTML = "";
  activeFilters.hidden = items.length === 0;

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.innerHTML = `${item.label} <span>&times;</span>`;
    button.addEventListener("click", () => {
      item.clear();
      applyFilters();
    });
    activeFilters.appendChild(button);
  });
}

function applyFilters() {
  const query = productSearch.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedMaterial = materialFilter.value;
  const selectedPrice = priceFilter.value;
  const selectedSort = sortFilter.value;

  const filtered = products.filter((product) => {
    const matchesQuery = product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesMaterial = selectedMaterial === "all" || product.material === selectedMaterial;

    return matchesQuery && matchesCategory && matchesMaterial && matchesPrice(product, selectedPrice);
  });

  renderProducts(sortProducts(filtered, selectedSort), query);
  renderActiveFilters();
}

function syncFilterOptions() {
  populateDynamicFilterOptions(categoryFilter, products.map((product) => product.category));
  populateDynamicFilterOptions(materialFilter, products.map((product) => product.material));
}

async function loadProducts() {
  if (!supabaseClient) {
    if (shoppingSkeletons) {
      shoppingSkeletons.hidden = true;
    }
    syncFilterOptions();
    applyFilters();
    return;
  }

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && Array.isArray(data) && data.length > 0) {
    products = data.map((item) => ({
      key: item.slug,
      title: item.name,
      price: `Rp ${Number(item.price || 0).toLocaleString("id-ID")}`,
      priceValue: Number(item.price || 0),
      category: item.category || "General",
      material: item.material || "General",
      description: item.description || "",
      colors: [{ name: "Default", hex: "#d9d9d9" }],
      images: [item.image_url || ""]
    }));
    console.log("Supabase products loaded:", data);
  } else {
    console.warn("Using fallback products because Supabase data is empty or unavailable.", error);
  }

  if (shoppingSkeletons) {
    shoppingSkeletons.hidden = true;
  }
  syncFilterOptions();
  applyFilters();
}

productSearch.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
materialFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);

resetFilters.addEventListener("click", () => {
  productSearch.value = "";
  categoryFilter.value = "all";
  materialFilter.value = "all";
  priceFilter.value = "all";
  sortFilter.value = "featured";
  applyFilters();
});

loadProducts();
