import { db } from "./firebase.js";

// Mantiene inicializado el servicio para futuras funciones de base de datos.
void db;

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Carga asíncrona de los datos desde datos.json para evitar errores de importación estática
async function iniciarApp() {
  try {
    const respuesta = await fetch('./datos.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar datos.json');
    const { CONFIG, FLAVOR_LABELS, FLAVORS } = await respuesta.json();

    // Enlaces externos de Rappi.
    $$("[data-rappi]").forEach(link => {
      link.href = CONFIG.rappiUrl;
    });

    // Redes sociales opcionales.
    const socials = $("#socials");
    const iconIG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>';
    const iconFB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z"/></svg>';

    if (socials) {
      [
        [CONFIG.instagramUrl, "Instagram", iconIG],
        [CONFIG.facebookUrl, "Facebook", iconFB]
      ].forEach(([url, label, icon]) => {
        if (!url) return;
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", label);
        link.innerHTML = icon;
        socials.prepend(link);
      });
    }

    // Catálogo y filtros de sabores.
    const flavorGrid = $("#flavors");
    const flavorDetail = $("#flavorDetail");

    if (flavorGrid && flavorDetail) {
      FLAVORS.forEach(flavor => {
        const button = document.createElement("button");
        const dot = document.createElement("span");
        const content = document.createElement("div");
        const name = document.createElement("h3");
        const category = document.createElement("small");

        button.className = "flavor reveal";
        button.type = "button";
        button.dataset.type = flavor.t;

        dot.className = "dot";
        dot.style.setProperty("--flavor-color", flavor.c);

        name.textContent = flavor.n;
        category.textContent = FLAVOR_LABELS[flavor.t] || flavor.t;

        content.append(name, category);
        button.append(dot, content);

        button.addEventListener("click", () => {
          $$(".flavor", flavorGrid).forEach(item => {
            item.classList.remove("selected");
          });

          button.classList.add("selected");

          const detailTitle = document.createElement("h3");
          const detailText = document.createElement("p");

          detailTitle.textContent = flavor.n;
          detailText.textContent = flavor.d;
          flavorDetail.replaceChildren(detailTitle, detailText);
        });

        flavorGrid.append(button);
      });

      $$(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
          $$(".chip").forEach(item => {
            item.setAttribute("aria-pressed", String(item === chip));
          });

          const filter = chip.dataset.filter;

          $$(".flavor", flavorGrid).forEach(item => {
            const shouldHide = filter !== "todos" && item.dataset.type !== filter;
            item.classList.toggle("hide", shouldHide);
          });
        });
      });
    }

  } catch (error) {
    console.error("Error al inicializar los datos de la aplicación:", error);
  }
}

iniciarApp();

// Navbar: sombra al desplazarse.
const nav = $("#nav");
if (nav) {
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// Menú hamburguesa.
const burger = $("#burger");
const mobileMenu = $("#mobileMenu");

const setMenu = open => {
  if (!burger || !mobileMenu) return;
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  mobileMenu.classList.toggle("open", open);
};

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });

  $$("a", mobileMenu).forEach(link => {
    link.addEventListener("click", () => setMenu(false));
  });
}

// Imágenes de respaldo cuando un archivo no está disponible.
const cone = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 28a14 14 0 0 1 28 0"/><path d="M18 28h28L32 58z"/><path d="M25 36l7 14M39 36l-5 10"/></svg>';

const fallback = img => {
  const placeholder = document.createElement("div");
  const label = document.createElement("span");

  placeholder.className = `ph-fallback tone-${img.dataset.tone || "a"}`;
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", img.alt);
  placeholder.innerHTML = cone;
  label.textContent = img.dataset.label || "ORSO";
  placeholder.append(label);
  img.replaceWith(placeholder);
};

$$("img.ph").forEach(img => {
  img.addEventListener("error", () => fallback(img), { once: true });
  if (img.complete && img.naturalWidth === 0) {
    fallback(img);
  }
});

// Pestañas del menú con navegación por teclado.
const tabs = $$(".tab");

const activateTab = activeTab => {
  tabs.forEach(tab => {
    const isActive = tab === activeTab;
    const panelId = tab.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;

    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;

    if (panel) {
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    }
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));

  tab.addEventListener("keydown", event => {
    let nextTab = null;

    if (event.key === "ArrowRight") {
      nextTab = tabs[(index + 1) % tabs.length];
    }
    if (event.key === "ArrowLeft") {
      nextTab = tabs[(index - 1 + tabs.length) % tabs.length];
    }
    if (event.key === "Home") nextTab = tabs[0];
    if (event.key === "End") nextTab = tabs[tabs.length - 1];

    if (nextTab) {
      event.preventDefault();
      nextTab.focus();
      activateTab(nextTab);
    }
  });
});

// Galería y ventana de imagen ampliada.
const lightbox = $("#lightbox");
const lightboxInner = $("#lbInner");
const lightboxCaption = $("#lbCap");
const lightboxClose = $("#lbClose");
let lastFocusedElement = null;

function openLightbox(element) {
  if (!lightbox || !lightboxInner || !lightboxCaption || !lightboxClose) return;

  const originalMedia = $("img, .ph-fallback", element);
  if (!originalMedia) return;

  lastFocusedElement = element;

  const media = originalMedia.cloneNode(true);
  media.removeAttribute("loading");

  lightboxInner.replaceChildren(media);
  lightboxCaption.textContent = element.dataset.cap || "";
  lightbox.classList.add("open");
  lightboxClose.focus();
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox || !lightbox.classList.contains("open")) return;

  lightbox.classList.remove("open");
  document.body.style.overflow = "";

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

$$(".g").forEach(button => {
  button.addEventListener("click", () => openLightbox(button));
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
}

// Cierra menús y galería al pulsar Escape.
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setMenu(false);
    closeLightbox();
  }
});

// Estado de apertura calculado con la hora de Colombia.
function updateStatus() {
  const status = $("#status");
  if (!status) return;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  }).formatToParts(new Date());

  const getPart = type => parts.find(part => part.type === type)?.value;
  const weekday = getPart("weekday");
  const minutes = (Number(getPart("hour")) % 24) * 60 + Number(getPart("minute"));
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const openingTime = (isWeekend ? 11 : 12) * 60;
  const closingTime = 19 * 60 + 30;
  const isOpen = minutes >= openingTime && minutes < closingTime;

  status.classList.toggle("open", isOpen);
  status.classList.toggle("closed", !isOpen);

  const statusText = $("span", status);
  if (statusText) {
    statusText.textContent = isOpen
      ? "Abierto ahora · cierra a las 7:30 p.m."
      : "Cerrado ahora · revisa nuestros horarios";
  }
}

updateStatus();
window.setInterval(updateStatus, 60000);

// Animaciones al entrar en pantalla.
const revealElements = $$(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        currentObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("in"));
}

// Año vigente en el pie de página.
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());