(function () {
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const reveals = document.querySelectorAll(".reveal");

  /* Header scroll */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  if (header) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      menuToggle.setAttribute(
        "aria-expanded",
        nav.classList.contains("open")
      );
    });

    nav.querySelectorAll(".nav__link").forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("open"));
    });
  }

  /* Scroll reveal */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));

  /* Smooth counter animation for stats */
  function animateValue(el, end, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      el.textContent = current + (el.dataset.suffix || "");
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statValues = document.querySelectorAll("[data-count]");
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.animated) return;
        el.dataset.animated = "true";
        const target = parseInt(el.dataset.count, 10);
        animateValue(el, target, 1800);
        statsObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  statValues.forEach((el) => statsObserver.observe(el));

  /* Carrossel de destaques */
  const carouselEl = document.querySelector("[data-carousel]");
  if (carouselEl) {
    const track = carouselEl.querySelector(".carousel__track");
    const viewport = carouselEl.querySelector(".carousel__viewport");
    const prevBtn = carouselEl.querySelector(".carousel__btn--prev");
    const nextBtn = carouselEl.querySelector(".carousel__btn--next");
    const dotsWrap = carouselEl.querySelector(".carousel__dots");
    let slides = Array.from(carouselEl.querySelectorAll(".carousel__slide"));
    let index = 0;
    let autoplayTimer;
    const AUTOPLAY_MS = 5000;

    function shuffleSlides() {
      for (let i = slides.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slides[i], slides[j]] = [slides[j], slides[i]];
      }
      slides.forEach((slide) => track.appendChild(slide));
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot" + (i === index ? " is-active" : "");
        dot.setAttribute("aria-label", `Anúncio ${i + 1}`);
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    function updateUI() {
      const slide = slides[index];
      const slideW = slide.offsetWidth;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      const viewportW = viewport.offsetWidth;
      const offset = slide.offsetLeft - (viewportW - slideW) / 2;

      track.style.transform = `translateX(${-offset}px)`;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".carousel__dot").forEach((d, i) => {
          d.classList.toggle("is-active", i === index);
          d.setAttribute("aria-selected", i === index ? "true" : "false");
        });
      }
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      updateUI();
      resetAutoplay();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(next, AUTOPLAY_MS);
    }

    shuffleSlides();
    index = 0;
    buildDots();
    requestAnimationFrame(() => {
      updateUI();
      resetAutoplay();
    });

    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    carouselEl.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
    carouselEl.addEventListener("mouseleave", resetAutoplay);

    let touchStartX = 0;
    viewport.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchend",
      (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      () => requestAnimationFrame(updateUI),
      { passive: true }
    );
  }

  /* Product card tilt (subtle) — apenas no grid de produtos */
  document.querySelectorAll(".products .product-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();
