const heroSlider = document.querySelector("[data-hero-slider]");
const homeProducts = window.JFProducts || {};

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

document.querySelectorAll("[data-home-add-cart]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const productKey = button.getAttribute("data-product-key");
    const product = homeProducts[productKey];

    if (!product || !window.JFStore) {
      return;
    }

    window.JFStore.addToCart({
      id: `${productKey}-${product.colors[0].name.toLowerCase().replace(/\s+/g, "-")}`,
      productKey,
      title: product.title,
      color: product.colors[0].name,
      priceValue: product.priceValue,
      image: product.images[0]
    });
  });
});
