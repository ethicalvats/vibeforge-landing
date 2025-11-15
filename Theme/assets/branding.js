(async function applyBranding() {
  try {
    const response = await fetch('/assets/branding.json', { cache: 'no-store' });
    if (!response.ok) {
      return;
    }
    const branding = await response.json();

    const titleNode = document.querySelector('[data-brand-title]');
    if (titleNode && branding.displayName) {
      titleNode.textContent = branding.displayName;
    }

    const logoNode = document.querySelector('[data-brand-logo]');
    if (logoNode) {
      if (branding.logoPath) {
        logoNode.src = branding.logoPath;
        logoNode.alt = branding.displayName ? `${branding.displayName} logo` : 'Site logo';
        logoNode.removeAttribute('hidden');
      } else {
        logoNode.setAttribute('hidden', 'true');
      }
    }
  } catch (error) {
    console.warn('[branding]', error);
  }
})();
