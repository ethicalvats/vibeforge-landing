(function () {
  const NAV_PATH = "/navigation.json";

  fetch(NAV_PATH, { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((manifest) => {
      if (!manifest) {
        return;
      }
      renderHeader(manifest.header || {});
      renderFooter(manifest.footer || {});
    })
    .catch(() => {
      /* silent */
    });

  function renderHeader(header) {
    const container = document.querySelector("[data-nav-header]");
    if (container) {
      const items = sortedItems(header.items);
      if (items.length > 0) {
        container.innerHTML = "";
        const fragment = document.createDocumentFragment();
        items.forEach((item) => {
          const link = document.createElement("a");
          link.textContent = item.label || "Link";
          link.href = resolveURL(item);
          if (item.external && !item.pageSlug) {
            link.target = "_blank";
            link.rel = "noreferrer";
          }
          fragment.appendChild(link);
        });
        container.appendChild(fragment);
      }
    }
    updateCTA(header.primaryCTA, 'a[data-nav-cta="primary"]', "vk-button--solid");
    updateCTA(header.secondaryCTA, 'a[data-nav-cta="secondary"]', "vk-button--ghost");
  }

  function renderFooter(footer) {
    const sections = document.querySelectorAll("[data-nav-footer-section]");
    if (sections.length === 0) return;
    const configured = Array.isArray(footer.sections)
      ? footer.sections.slice().sort(byOrder)
      : [];
    sections.forEach((section, index) => {
      const data = configured[index];
      if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        return;
      }
      const title = section.querySelector("[data-nav-footer-title]");
      if (title && data.title) {
        title.textContent = data.title;
      }
      const linksContainer = section.querySelector("[data-nav-footer-links]");
      if (!linksContainer) return;
      linksContainer.innerHTML = "";
      const fragment = document.createDocumentFragment();
      sortedItems(data.items).forEach((item) => {
        const link = document.createElement("a");
        link.textContent = item.label || "Link";
        link.href = resolveURL(item);
        if (item.external && !item.pageSlug) {
          link.target = "_blank";
          link.rel = "noreferrer";
        }
        fragment.appendChild(link);
      });
      linksContainer.appendChild(fragment);
    });
  }

  function updateCTA(cta, selector, fallbackClass) {
    const button = document.querySelector(selector);
    if (!button) return;
    if (!cta || !cta.enabled || !cta.label) {
      button.hidden = true;
      return;
    }
    button.hidden = false;
    button.textContent = cta.label;
    button.href = formatPath(cta.url);
    button.classList.remove("vk-button--solid", "vk-button--ghost");
    if (fallbackClass) {
      button.classList.add(fallbackClass);
    }
    if (cta.style === "primary") {
      button.classList.add("vk-button--solid");
    } else {
      button.classList.add("vk-button--ghost");
    }
  }

  function sortedItems(items) {
    if (!Array.isArray(items)) return [];
    return items
      .slice()
      .filter((item) => !!item)
      .sort(byOrder);
  }

  function byOrder(a, b) {
    const left = typeof a.order === "number" ? a.order : 0;
    const right = typeof b.order === "number" ? b.order : 0;
    return left - right;
  }

  function resolveURL(item) {
    if (item.pageSlug) {
      return formatPath(item.pageSlug);
    }
    return formatPath(item.url || "/");
  }

  function formatPath(value) {
    if (typeof value !== "string" || value.length === 0) {
      return "/";
    }
    return value.startsWith("/") ? value : "/" + value;
  }
})();
