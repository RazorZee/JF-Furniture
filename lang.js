(function () {
  const LANG_KEY = "jf-language";
  const DEFAULT_LANG = "id";
  const SUPPORTED_LANGS = ["id", "en"];

  const textMap = {
    id: {
      "Home": "Beranda",
      "Shop": "Belanja",
      "About": "Tentang",
      "Admin": "Admin",
      "Modern Living": "Hunian Modern",
      "Simple &": "Sederhana &",
      "Minimalist": "Minimalis",
      "Design": "Desain",
      "Simple & Minimalist Design": "Desain Sederhana & Minimalis",
      "A calm furniture collection built for clean interiors, soft tones, and warm natural details.": "Koleksi furniture tenang untuk interior rapi, tone lembut, dan detail natural yang hangat.",
      "Show More": "Lihat Lebih Banyak",
      "Dining Space": "Ruang Makan",
      "Warm Wood": "Kayu Hangat",
      "For Daily": "Untuk Harian",
      "Moments": "Momen",
      "Warm Wood For Daily Moments": "Kayu Hangat untuk Momen Sehari-hari",
      "Frame chairs with a light wood feeling that fit compact dining corners and contemporary homes.": "Kursi frame dengan nuansa kayu terang yang cocok untuk sudut makan compact dan rumah kontemporer.",
      "Explore Shop": "Jelajahi Belanja",
      "Relax Corner": "Sudut Santai",
      "Natural Form": "Bentuk Alami",
      "Relaxed": "Santai",
      "Comfort": "Nyaman",
      "Natural Form Relaxed Comfort": "Bentuk Alami Nyaman Santai",
      "Lounge seating with curved wood, woven texture, and a softer atmosphere for slower spaces.": "Kursi lounge dengan kayu melengkung, tekstur anyaman, dan suasana lebih lembut untuk ruang santai.",
      "See Products": "Lihat Produk",
      "New Product": "Produk Baru",
      "Add to cart": "Tambah ke Keranjang",
      "Remove": "Hapus",
      "Default": "Default",
      "Qty": "Jumlah",
      "Your Cart": "Keranjang Kamu",
      "Selected Items": "Item Terpilih",
      "Total": "Total",
      "Checkout": "Checkout",
      "Your cart is still empty.": "Keranjang kamu masih kosong.",
      "Search": "Cari",
      "Search furniture": "Cari furniture",
      "Open menu": "Buka menu",
      "View cart": "Lihat keranjang",
      "Close cart": "Tutup keranjang",
      "Back to top": "Kembali ke atas",
      "Shop": "Belanja",
      "All Products": "Semua Produk",
      "Dining Chairs": "Kursi Makan",
      "Lounge Chairs": "Kursi Santai",
      "New Arrivals": "Produk Terbaru",
      "About JF": "Tentang JF",
      "Featured Collection": "Koleksi Unggulan",
      "Brand Story": "Cerita Brand",
      "Admin Panel": "Panel Admin",
      "Browse Catalog": "Lihat Katalog",
      "Help": "Bantuan",
      "Delivery Information": "Info Pengiriman",
      "Care Guide": "Panduan Perawatan",
      "Room Styling Tips": "Tips Styling Ruangan",
      "Contact Support": "Hubungi Dukungan",
      "WhatsApp Order": "Pesan via WhatsApp",
      "Furniture Catalog": "Katalog Furniture",
      "Find the right chair for your space": "Temukan kursi yang tepat untuk ruangmu",
      "Search by name and refine by category, material, or price range to browse the collection faster.": "Cari berdasarkan nama dan saring berdasarkan kategori, material, atau rentang harga agar browsing lebih cepat.",
      "Back to home": "Kembali ke beranda",
      "Category": "Kategori",
      "Material": "Material",
      "Price": "Harga",
      "All": "Semua",
      "Sort": "Urutkan",
      "Search product name": "Cari nama produk",
      "Under Rp 100,000": "Di bawah Rp 100.000",
      "Rp 100,000 - Rp 150,000": "Rp 100.000 - Rp 150.000",
      "Above Rp 150,000": "Di atas Rp 150.000",
      "A-Z": "A-Z",
      "Featured": "Unggulan",
      "Lowest price": "Harga terendah",
      "Highest price": "Harga tertinggi",
      "Reset filters": "Reset filter",
      "No products match your search.": "Tidak ada produk yang cocok.",
      "Try another keyword, change the filters, or reset everything to browse the full catalog again.": "Coba kata kunci lain, ubah filter, atau reset semua untuk melihat katalog penuh.",
      "View detail": "Lihat detail",
      "Back to products": "Kembali ke produk",
      "reviews": "ulasan",
      "Color": "Warna",
      "Free delivery for orders over Rp 300,000": "Gratis ongkir untuk pesanan di atas Rp 300.000",
      "You May Also Like": "Kamu Mungkin Suka",
      "More pieces that fit the same warm minimalist mood.": "Pilihan lain dengan nuansa minimalis hangat yang sama.",
      "Checkout": "Checkout",
      "Complete your order": "Selesaikan pesananmu",
      "Review your cart, delivery details, and payment summary before placing the order.": "Tinjau keranjang, detail pengiriman, dan ringkasan pembayaran sebelum order.",
      "Continue shopping": "Lanjut belanja",
      "Delivery Details": "Detail Pengiriman",
      "Fill in your shipping information": "Isi informasi pengiriman kamu",
      "Full name": "Nama lengkap",
      "Your full name": "Nama lengkap kamu",
      "Email": "Email",
      "Phone": "Nomor HP",
      "Address": "Alamat",
      "Street, district, city, postal code": "Jalan, kecamatan, kota, kode pos",
      "Order Summary": "Ringkasan Pesanan",
      "Items currently in your cart": "Item yang ada di keranjang kamu",
      "Subtotal": "Subtotal",
      "Delivery": "Ongkir",
      "Order via WhatsApp": "Pesan via WhatsApp",
      "About JF Furniture": "Tentang JF Furniture",
      "Furniture built for quieter, warmer everyday spaces.": "Furniture yang dibuat untuk ruang harian yang lebih tenang dan hangat.",
      "Our Story": "Cerita Kami",
      "Simple furniture, thoughtful atmosphere.": "Furniture sederhana dengan suasana yang dipikirkan matang.",
      "Designed for daily living": "Dirancang untuk kebutuhan harian",
      "Warm materials first": "Material hangat jadi prioritas",
      "Modern but not cold": "Modern tapi tidak terasa dingin",
      "Why Choose Us": "Kenapa Pilih Kami",
      "What shapes the JF collection.": "Apa yang membentuk koleksi JF.",
      "Minimal silhouettes": "Siluet minimalis",
      "Comfortable proportions": "Proporsi yang nyaman",
      "Warm visual tone": "Nuansa visual hangat",
      "Explore The Collection": "Jelajahi Koleksi",
      "Find the piece that fits your room best.": "Temukan produk yang paling pas untuk ruanganmu.",
      "Shop Now": "Belanja Sekarang",
      "Back to Home": "Kembali ke Beranda",
      "Contact Support": "Hubungi Dukungan",
      "Need help with an order or product question?": "Butuh bantuan soal pesanan atau pertanyaan produk?",
      "Browse Products": "Lihat Produk",
      "Email Support": "Dukungan Email",
      "Send Email": "Kirim Email",
      "WhatsApp": "WhatsApp",
      "Chat on WhatsApp": "Chat di WhatsApp",
      "Support Hours": "Jam Dukungan",
      "Response as soon as possible during active business hours.": "Akan dibalas secepat mungkin saat jam operasional aktif.",
      "Loading products...": "Memuat produk...",
      "Showing 0 products": "Menampilkan 0 produk",
      "WhatsApp order opened": "Pesanan WhatsApp dibuka",
      "Similar category": "Kategori serupa",
      "Similar material": "Material serupa",
      "Closest price range": "Rentang harga terdekat",
      "Recommended for you": "Rekomendasi untuk kamu"
    }
  };

  function invertMap(map) {
    const inverted = {};
    Object.entries(map).forEach(([en, id]) => {
      inverted[id] = en;
    });
    return inverted;
  }

  textMap.en = invertMap(textMap.id);

  function getLanguage() {
    const stored = localStorage.getItem(LANG_KEY);
    return SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
  }

  function saveLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
  }

  function replaceTextNode(node, dictionary) {
    const original = node.nodeValue;
    if (!original || !original.trim()) {
      return;
    }

    const trimmed = original.trim();
    const translated = dictionary[trimmed];
    if (!translated) {
      return;
    }

    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  }

  function translateTextContent(lang) {
    const dictionary = textMap[lang] || {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      const parentTag = node.parentElement?.tagName?.toLowerCase();
      if (!["script", "style", "svg", "path", "noscript"].includes(parentTag)) {
        replaceTextNode(node, dictionary);
      }
      node = walker.nextNode();
    }
  }

  function translateAttributes(lang) {
    const dictionary = textMap[lang] || {};

    document.querySelectorAll("[placeholder]").forEach((el) => {
      const value = el.getAttribute("placeholder");
      if (dictionary[value]) {
        el.setAttribute("placeholder", dictionary[value]);
      }
    });

    document.querySelectorAll("[aria-label]").forEach((el) => {
      const value = el.getAttribute("aria-label");
      if (dictionary[value]) {
        el.setAttribute("aria-label", dictionary[value]);
      }
    });
  }

  function updateTitle(lang) {
    const baseTitles = {
      "JF Furniture": { id: "JF Furniture", en: "JF Furniture" },
      "Shop | JF Furniture": { id: "Belanja | JF Furniture", en: "Shop | JF Furniture" },
      "About | JF Furniture": { id: "Tentang | JF Furniture", en: "About | JF Furniture" },
      "Contact Support | JF Furniture": { id: "Hubungi Dukungan | JF Furniture", en: "Contact Support | JF Furniture" },
      "Checkout | JF Furniture": { id: "Checkout | JF Furniture", en: "Checkout | JF Furniture" },
      "Admin | JF Furniture": { id: "Admin | JF Furniture", en: "Admin | JF Furniture" },
      "JF Furniture Product": { id: "Produk | JF Furniture", en: "JF Furniture Product" }
    };

    const current = Object.keys(baseTitles).find((key) => document.title === key || document.title === baseTitles[key].id || document.title === baseTitles[key].en);
    if (current) {
      document.title = baseTitles[current][lang];
    }
  }

  function injectSwitcher(currentLang) {
    const header = document.querySelector(".site-header");
    if (!header || header.querySelector("[data-lang-switch]")) {
      return;
    }

    let target = header.querySelector(".header-actions");
    if (!target) {
      target = document.createElement("div");
      target.className = "header-actions";
      header.appendChild(target);
    }

    const wrap = document.createElement("div");
    wrap.className = "lang-switch";
    wrap.setAttribute("data-lang-switch", "true");

    const idButton = document.createElement("button");
    idButton.type = "button";
    idButton.className = "lang-button";
    idButton.setAttribute("data-lang", "id");
    idButton.textContent = "ID";

    const enButton = document.createElement("button");
    enButton.type = "button";
    enButton.className = "lang-button";
    enButton.setAttribute("data-lang", "en");
    enButton.textContent = "EN";

    wrap.append(idButton, enButton);
    target.prepend(wrap);

    function syncButtons(lang) {
      wrap.querySelectorAll(".lang-button").forEach((button) => {
        button.classList.toggle("is-active", button.getAttribute("data-lang") === lang);
      });
    }

    wrap.addEventListener("click", (event) => {
      const button = event.target.closest(".lang-button");
      if (!button) {
        return;
      }

      const nextLang = button.getAttribute("data-lang");
      applyLanguage(nextLang);
    });

    syncButtons(currentLang);
    window.addEventListener("jf:language-updated", (event) => syncButtons(event.detail.lang));
  }

  function applyLanguage(lang) {
    const nextLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
    saveLanguage(nextLang);
    document.documentElement.lang = nextLang;
    updateTitle(nextLang);
    translateTextContent(nextLang);
    translateAttributes(nextLang);
    window.dispatchEvent(new CustomEvent("jf:language-updated", { detail: { lang: nextLang } }));
  }

  function t(key, fallback) {
    const lang = getLanguage();
    return textMap[lang]?.[key] || fallback || key;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const current = getLanguage();
    injectSwitcher(current);
    applyLanguage(current);
  });

  window.JFLang = {
    apply: applyLanguage,
    get: getLanguage,
    t
  };
})();
