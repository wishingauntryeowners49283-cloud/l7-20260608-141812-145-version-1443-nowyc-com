import { searchItems } from './search-data.js';
import { H as Hls } from './video-vendor-dru42stk.js';

const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
}

const searchInputs = document.querySelectorAll('[data-search-input]');

function renderSearch(input) {
    const box = input.closest('.search-box');
    const panel = box ? box.querySelector('[data-search-panel]') : null;
    const results = box ? box.querySelector('[data-search-results]') : null;
    const query = input.value.trim().toLowerCase();

    if (!panel || !results) {
        return;
    }

    if (!query) {
        results.innerHTML = '';
        panel.classList.remove('open');
        return;
    }

    const matched = searchItems.filter((item) => {
        return item.title.toLowerCase().includes(query)
            || item.tags.toLowerCase().includes(query)
            || String(item.year).includes(query)
            || item.type.toLowerCase().includes(query)
            || item.region.toLowerCase().includes(query);
    }).slice(0, 12);

    if (!matched.length) {
        results.innerHTML = '<div class="search-result-item"><strong>未找到匹配影片</strong><span>可以尝试输入片名、类型、地区或年份</span></div>';
        panel.classList.add('open');
        return;
    }

    results.innerHTML = matched.map((item) => {
        return `<a class="search-result-item" href="./${item.url}"><strong>${escapeHtml(item.title)}</strong><span>${item.year} · ${escapeHtml(item.region)} · ${escapeHtml(item.type)} · ${escapeHtml(item.text)}</span></a>`;
    }).join('');
    panel.classList.add('open');
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        };
        return map[char];
    });
}

searchInputs.forEach((input) => {
    input.addEventListener('input', () => renderSearch(input));
    input.addEventListener('focus', () => renderSearch(input));
    input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        const query = input.value.trim().toLowerCase();
        if (!query) {
            return;
        }
        const first = searchItems.find((item) => {
            return item.title.toLowerCase().includes(query)
                || item.tags.toLowerCase().includes(query)
                || String(item.year).includes(query);
        });
        if (first) {
            window.location.href = `./${first.url}`;
        }
    });
});

document.addEventListener('click', (event) => {
    document.querySelectorAll('.search-box').forEach((box) => {
        if (!box.contains(event.target)) {
            const panel = box.querySelector('[data-search-panel]');
            if (panel) {
                panel.classList.remove('open');
            }
        }
    });
});

const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
    if (!heroSlides.length) {
        return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === heroIndex);
    });
    heroDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === heroIndex);
    });
}

function startHeroTimer() {
    if (!heroSlides.length) {
        return;
    }
    heroTimer = window.setInterval(() => {
        showHeroSlide(heroIndex + 1);
    }, 5200);
}

heroDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        showHeroSlide(index);
        startHeroTimer();
    });
});

showHeroSlide(0);
startHeroTimer();

const pageFilters = document.querySelectorAll('[data-page-filter]');

pageFilters.forEach((input) => {
    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const cards = document.querySelectorAll('[data-card]');
        cards.forEach((card) => {
            const text = `${card.dataset.title || ''} ${card.dataset.tags || ''} ${card.dataset.year || ''}`.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
    });
});

const player = document.querySelector('[data-player]');

if (player) {
    const video = player.querySelector('[data-player-video]');
    const button = player.querySelector('[data-play-button]');
    let hlsInstance = null;

    function startVideo() {
        const src = player.dataset.video || (button ? button.dataset.video : '');
        if (!video || !src) {
            return;
        }

        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
        } else {
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {});
            }, { once: true });
            video.load();
        }

        video.setAttribute('controls', 'controls');
        if (button) {
            button.classList.add('hidden');
        }
        video.play().catch(() => {});
    }

    if (button) {
        button.addEventListener('click', startVideo);
    }
    player.addEventListener('click', (event) => {
        if (event.target === player) {
            startVideo();
        }
    });
}
