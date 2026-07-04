import { CONFIG, ROUTES } from '../constants/config.js';

export function renderFooter(container) {
  if (!container) return;
  const year = new Date().getFullYear();

  container.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a href="${ROUTES.home}" class="navbar__logo">
              <span class="navbar__logo-icon">✦</span>
              ${CONFIG.appName}
            </a>
            <p>Premium AI image generation for creators, brands, and visionaries. Create stunning art in seconds.</p>
            <div class="footer__social">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Discord">D</a>
              <a href="#" aria-label="Instagram">◎</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>
          <div>
            <h4 class="footer__title">Product</h4>
            <nav class="footer__links">
              <a href="${ROUTES.features}">Features</a>
              <a href="${ROUTES.gallery}">Gallery</a>
              <a href="${ROUTES.pricing}">Pricing</a>
              <a href="${ROUTES.generate}">Generate</a>
            </nav>
          </div>
          <div>
            <h4 class="footer__title">Company</h4>
            <nav class="footer__links">
              <a href="${ROUTES.about}">About</a>
              <a href="${ROUTES.contact}">Contact</a>
              <a href="${ROUTES.faq}">FAQ</a>
            </nav>
          </div>
          <div>
            <h4 class="footer__title">Legal</h4>
            <nav class="footer__links">
              <a href="${ROUTES.terms}">Terms</a>
              <a href="${ROUTES.privacy}">Privacy</a>
            </nav>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${year} ${CONFIG.appName}. All rights reserved.</span>
          <span>Made with AI ✦</span>
        </div>
      </div>
    </footer>
  `;
}
