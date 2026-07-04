import { getGalleryItems } from '../services/dataService.js';
import { createGalleryCard } from '../components/gallery-card.js';
import { debounce, $ } from '../lib/utils.js';
import { lazyLoadImages } from '../lib/utils.js';

let currentPage = 1;
let loading = false;
let hasMore = true;
let filters = { category: 'all', search: '', sort: 'latest' };

export async function initGallery(options = {}) {
  const grid = $('#gallery-grid') || $('#gallery-showcase');
  if (!grid) return;

  const isShowcase = grid.id === 'gallery-showcase';
  const limit = isShowcase ? 8 : 12;

  if (options.reset) {
    currentPage = 1;
    hasMore = true;
    grid.innerHTML = '';
  }

  if (loading || !hasMore) return;
  loading = true;
  showLoading(grid, isShowcase);

  try {
    const result = await getGalleryItems(currentPage, limit, filters);
    removeLoading(grid);

    if (result.items.length === 0 && currentPage === 1) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🖼</div><h3 class="empty-state__title">No images found</h3><p class="empty-state__desc">Try adjusting your filters or search.</p></div>`;
      return;
    }

    result.items.forEach((item) => grid.appendChild(createGalleryCard(item)));
    hasMore = result.hasMore && !isShowcase;
    currentPage++;
    lazyLoadImages(grid);
  } finally {
    loading = false;
  }
}

export function initGalleryPage() {
  const searchInput = $('#gallery-search');
  const categoryFilters = document.querySelectorAll('[data-category]');
  const sortTabs = document.querySelectorAll('[data-sort]');

  searchInput?.addEventListener('input', debounce((e) => {
    filters.search = e.target.value;
    initGallery({ reset: true });
  }, 400));

  categoryFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filters.category = btn.dataset.category;
      initGallery({ reset: true });
    });
  });

  sortTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      sortTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      filters.sort = tab.dataset.sort;
      initGallery({ reset: true });
    });
  });

  if ($('#gallery-grid')) {
    initGallery({ reset: true });
    initInfiniteScroll();
  }

  if ($('#gallery-showcase')) {
    initGallery({ reset: true });
  }
}

function initInfiniteScroll() {
  const sentinel = document.getElementById('gallery-sentinel');
  if (!sentinel) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore && !loading) {
      initGallery();
    }
  }, { rootMargin: '200px' });

  observer.observe(sentinel);
}

function showLoading(grid, small) {
  const count = small ? 4 : 8;
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'gallery-card skeleton skeleton--img';
    sk.dataset.loading = 'true';
    grid.appendChild(sk);
  }
}

function removeLoading(grid) {
  grid.querySelectorAll('[data-loading]').forEach((el) => el.remove());
}
