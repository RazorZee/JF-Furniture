const adminAuthPanel = document.getElementById("adminAuthPanel");
const adminApp = document.getElementById("adminApp");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminAuthStatus = document.getElementById("adminAuthStatus");
const adminLogoutButton = document.getElementById("adminLogoutButton");
const adminSessionInfo = document.getElementById("adminSessionInfo");
const adminForm = document.getElementById("adminProductForm");
const adminName = document.getElementById("adminName");
const adminSlug = document.getElementById("adminSlug");
const adminImageUrl = document.getElementById("adminImageUrl");
const adminImageFile = document.getElementById("adminImageFile");
const adminUploadButton = document.getElementById("adminUploadButton");
const adminCancelEditButton = document.getElementById("adminCancelEditButton");
const adminStatus = document.getElementById("adminStatus");
const adminProductList = document.getElementById("adminProductList");
const adminListSummary = document.getElementById("adminListSummary");

const adminSupabase = window.supabase && typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_ANON_KEY !== "undefined"
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
let editingProductId = null;
let adminProducts = [];

function setAuthStatus(message, isError = false) {
  if (!adminAuthStatus) {
    return;
  }

  adminAuthStatus.textContent = message;
  adminAuthStatus.classList.toggle("is-error", isError);
  adminAuthStatus.classList.toggle("is-success", !isError);
}

function setAdminStatus(message, isError = false) {
  if (!adminStatus) {
    return;
  }

  adminStatus.textContent = message;
  adminStatus.classList.toggle("is-error", isError);
  adminStatus.classList.toggle("is-success", !isError);
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatPrice(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function resetAdminForm() {
  if (!adminForm) {
    return;
  }

  adminForm.reset();
  editingProductId = null;
  if (adminSlug) {
    adminSlug.dataset.editedManually = "";
  }
  if (adminCancelEditButton) {
    adminCancelEditButton.hidden = true;
  }
}

function syncAdminVisibility(session) {
  if (adminAuthPanel) {
    adminAuthPanel.hidden = Boolean(session);
  }

  if (adminApp) {
    adminApp.hidden = !session;
  }

  if (adminSessionInfo) {
    adminSessionInfo.textContent = session?.user?.email ? `Logged in as ${session.user.email}` : "Logged in";
  }
}

function fillFormForEdit(product) {
  editingProductId = product.id;
  adminName.value = product.name || "";
  adminSlug.value = product.slug || "";
  adminSlug.dataset.editedManually = "true";
  document.getElementById("adminPrice").value = product.price ?? "";
  document.getElementById("adminStock").value = product.stock ?? 0;
  document.getElementById("adminCategory").value = product.category || "";
  document.getElementById("adminMaterial").value = product.material || "";
  document.getElementById("adminDescription").value = product.description || "";
  adminImageUrl.value = product.image_url || "";
  document.getElementById("adminFeatured").checked = Boolean(product.is_featured);
  if (adminCancelEditButton) {
    adminCancelEditButton.hidden = false;
  }
  setAdminStatus(`Editing ${product.name}. Klik Save Product untuk menyimpan perubahan.`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderAdminProducts() {
  if (!adminProductList || !adminListSummary) {
    return;
  }

  adminProductList.innerHTML = "";
  adminListSummary.textContent = `${adminProducts.length} product${adminProducts.length === 1 ? "" : "s"} found`;

  if (adminProducts.length === 0) {
    adminProductList.innerHTML = '<p class="admin-empty-list">Belum ada produk di database.</p>';
    return;
  }

  adminProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "admin-product-card";
    card.innerHTML = `
      <div class="admin-product-media">
        <img src="${product.image_url || ""}" alt="${product.name}">
      </div>
      <div class="admin-product-info">
        <div class="admin-product-top">
          <div>
            <p>${product.category || "General"} - ${product.material || "General"}</p>
            <h3>${product.name}</h3>
          </div>
          <strong>${formatPrice(product.price)}</strong>
        </div>
        <p class="admin-product-slug">Slug: ${product.slug}</p>
        <p class="admin-product-desc">${product.description || ""}</p>
        <div class="admin-product-meta">
          <span>Stock: ${product.stock ?? 0}</span>
          <span>${product.is_featured ? "Featured" : "Regular"}</span>
        </div>
        <div class="admin-product-actions">
          <button class="admin-card-button is-edit" type="button">Edit</button>
          <button class="admin-card-button is-delete" type="button">Delete</button>
        </div>
      </div>
    `;

    card.querySelector(".is-edit").addEventListener("click", () => {
      fillFormForEdit(product);
    });

    card.querySelector(".is-delete").addEventListener("click", async () => {
      const confirmed = window.confirm(`Delete ${product.name}?`);
      if (!confirmed) {
        return;
      }

      setAdminStatus(`Deleting ${product.name}...`);
      const { error } = await adminSupabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) {
        setAdminStatus(`Gagal menghapus: ${error.message}`, true);
        return;
      }

      if (editingProductId === product.id) {
        resetAdminForm();
      }

      setAdminStatus(`${product.name} berhasil dihapus.`);
      await loadAdminProducts();
    });

    adminProductList.appendChild(card);
  });
}

async function loadAdminProducts() {
  if (!adminSupabase) {
    setAdminStatus("Supabase belum terhubung.", true);
    return;
  }

  const { data, error } = await adminSupabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setAdminStatus(`Gagal mengambil produk: ${error.message}`, true);
    return;
  }

  adminProducts = Array.isArray(data) ? data : [];
  renderAdminProducts();
}

async function checkAdminSession() {
  if (!adminSupabase) {
    setAuthStatus("Supabase belum terhubung.", true);
    return;
  }

  const { data, error } = await adminSupabase.auth.getSession();
  if (error) {
    setAuthStatus(`Gagal cek session: ${error.message}`, true);
    return;
  }

  const session = data.session;
  syncAdminVisibility(session);
  if (session) {
    await loadAdminProducts();
  }
}

function createFileName(file) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const productSlug = adminSlug?.value?.trim() || slugify(adminName?.value || "product");
  return `${productSlug}-${Date.now()}.${extension}`;
}

async function uploadImageToSupabase() {
  if (!adminSupabase) {
    setAdminStatus("Supabase belum terhubung.", true);
    return null;
  }

  const file = adminImageFile?.files?.[0];
  if (!file) {
    setAdminStatus("Pilih gambar dulu sebelum upload.", true);
    return null;
  }

  const fileName = createFileName(file);
  setAdminStatus("Uploading image...");

  const { error: uploadError } = await adminSupabase.storage
    .from("product-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    setAdminStatus(`Upload gagal: ${uploadError.message}`, true);
    return null;
  }

  const { data } = adminSupabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  if (adminImageUrl) {
    adminImageUrl.value = data.publicUrl;
  }

  setAdminStatus("Gambar berhasil diupload.");
  return data.publicUrl;
}

if (adminName && adminSlug) {
  adminName.addEventListener("input", () => {
    if (!adminSlug.dataset.editedManually) {
      adminSlug.value = slugify(adminName.value);
    }
  });

  adminSlug.addEventListener("input", () => {
    adminSlug.dataset.editedManually = "true";
  });
}

if (adminForm) {
  adminForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!adminSupabase) {
      setAdminStatus("Supabase belum terhubung.", true);
      return;
    }

    const formData = new FormData(adminForm);
    let imageUrl = formData.get("image_url")?.toString().trim();

    if (!imageUrl && adminImageFile?.files?.length) {
      imageUrl = await uploadImageToSupabase();
      if (!imageUrl) {
        return;
      }
    }

    const payload = {
      name: formData.get("name")?.toString().trim(),
      slug: formData.get("slug")?.toString().trim(),
      price: Number(formData.get("price") || 0),
      stock: Number(formData.get("stock") || 0),
      category: formData.get("category")?.toString().trim(),
      material: formData.get("material")?.toString().trim(),
      description: formData.get("description")?.toString().trim(),
      image_url: imageUrl,
      is_featured: formData.get("is_featured") === "on"
    };

    setAdminStatus(editingProductId ? "Updating product..." : "Saving product...");

    let error = null;
    if (editingProductId) {
      const response = await adminSupabase
        .from("products")
        .update(payload)
        .eq("id", editingProductId);
      error = response.error;
    } else {
      const response = await adminSupabase
        .from("products")
        .insert(payload);
      error = response.error;
    }

    if (error) {
      setAdminStatus(`Gagal menyimpan: ${error.message}`, true);
      return;
    }

    const successMessage = editingProductId ? "Produk berhasil diupdate." : "Produk berhasil disimpan.";
    resetAdminForm();
    setAdminStatus(successMessage);
    await loadAdminProducts();
  });
}

if (adminUploadButton) {
  adminUploadButton.addEventListener("click", async () => {
    await uploadImageToSupabase();
  });
}

if (adminCancelEditButton) {
  adminCancelEditButton.addEventListener("click", () => {
    resetAdminForm();
    setAdminStatus("Edit dibatalkan.");
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!adminSupabase) {
      setAuthStatus("Supabase belum terhubung.", true);
      return;
    }

    setAuthStatus("Logging in...");
    const { data, error } = await adminSupabase.auth.signInWithPassword({
      email: adminEmail.value.trim(),
      password: adminPassword.value
    });

    if (error) {
      setAuthStatus(`Login gagal: ${error.message}`, true);
      return;
    }

    adminLoginForm.reset();
    setAuthStatus("Login berhasil.");
    syncAdminVisibility(data.session);
    await loadAdminProducts();
  });
}

if (adminLogoutButton) {
  adminLogoutButton.addEventListener("click", async () => {
    if (!adminSupabase) {
      return;
    }

    await adminSupabase.auth.signOut();
    syncAdminVisibility(null);
    setAuthStatus("Kamu sudah logout.");
    setAdminStatus("Session admin ditutup.");
  });
}

if (adminSupabase) {
  adminSupabase.auth.onAuthStateChange((_event, session) => {
    syncAdminVisibility(session);
  });
}

checkAdminSession();
