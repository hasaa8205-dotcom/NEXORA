(() => {
  const links = [
    ["index.html", "home", "Нүүр"],
    ["explore.html", "explore", "ХО хэрэгслүүд"],
    ["academy.html", "academy", "Академи"],
    ["prompt-studio.html", "prompt-studio", "Заавар бүтээгч"],
    ["showcase.html", "showcase", "Жишээ санаа"],
    ["favorites.html", "favorites", "Хадгалсан"],
    ["about.html", "about", "Бидний тухай"]
  ];
  const currentPage = document.body.dataset.page || "home";
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");

  if (header) {
    const nav = document.createElement("header");
    nav.className = "site-header";
    nav.innerHTML = `
      <nav class="nav-shell container" aria-label="Үндсэн навигаци">
        <a class="brand" href="index.html" aria-label="NEXORA AI нүүр хуудас">
          <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
          <span>NEXORA<span class="brand-accent">AI</span></span>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Цэс нээх">
          <span></span><span></span>
        </button>
        <div class="nav-links" id="primary-nav">
          ${links.map(([href, page, label]) => `<a href="${href}"${page === currentPage ? ' class="is-active" aria-current="page"' : ""}>${label}</a>`).join("")}
        </div>
      </nav>`;
    header.replaceWith(nav);
  }

  if (footer) {
    const footerElement = document.createElement("footer");
    footerElement.className = "site-footer";
    footerElement.innerHTML = `
      <div class="container footer-main">
        <div class="footer-brand">
          <a class="brand" href="index.html" aria-label="NEXORA AI нүүр хуудас">
            <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
            <span>NEXORA<span class="brand-accent">AI</span></span>
          </a>
          <p>Сониуч зангаар судал. Зорилготой бүтээ.</p>
        </div>
        <div class="footer-links">
          <div><span class="footer-label">СУДЛАХ</span><a href="explore.html">ХО хэрэгслүүд</a><a href="showcase.html">Жишээ санаа</a></div>
          <div><span class="footer-label">СУРАЛЦАХ БА БҮТЭЭХ</span><a href="academy.html">Академи</a><a href="prompt-studio.html">Заавар бүтээгч</a></div>
          <div><span class="footer-label">NEXORA</span><a href="favorites.html">Хадгалсан</a><a href="about.html">Бидний зорилго</a></div>
        </div>
      </div>
      <div class="container footer-bottom"><span>© <span data-current-year></span> NEXORA AI</span><span>Сониуч хүмүүст зориулав.</span><a href="#main">Дээш буцах ↑\uFE0E</a></div>`;
    footer.replaceWith(footerElement);
    footerElement.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const closeMenu = () => {
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Цэс нээх");
    navLinks.classList.remove("is-open");
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Цэс нээх" : "Цэс хаах");
      navLinks.classList.toggle("is-open", !isOpen);
    });
    navLinks.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.body.classList.add("page-transition-ready");
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target || link.hasAttribute("download") || link.origin !== window.location.origin || !/\.html$/i.test(link.pathname) || link.pathname === window.location.pathname) return;
    if (reducedMotion.matches) return;
    event.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 170);
  });

  window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
  if (!reducedMotion.matches) {
    document.body.classList.add("is-entering");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => document.body.classList.remove("is-entering"));
    });
  }
})();
