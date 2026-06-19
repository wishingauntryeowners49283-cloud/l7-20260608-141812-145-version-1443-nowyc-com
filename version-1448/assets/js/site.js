(function () {
    'use strict';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var search = panel.querySelector('[data-filter-search]');
            var region = panel.querySelector('[data-filter-region]');
            var type = panel.querySelector('[data-filter-type]');
            var category = panel.querySelector('[data-filter-category]');
            var count = panel.querySelector('[data-filter-count]');

            function update() {
                var query = normalize(search && search.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var categoryValue = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    if (categoryValue && cardCategory !== categoryValue) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '匹配 ' + visible + ' 部';
                }
            }

            [search, region, type, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', update);
                    control.addEventListener('change', update);
                }
            });
            update();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (wrap) {
            var video = wrap.querySelector('video[data-video-src]');
            var button = wrap.querySelector('[data-play-button]');
            var status = wrap.querySelector('[data-player-status]');
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }

            function start() {
                if (!video) {
                    return;
                }
                var source = video.getAttribute('data-video-src');
                if (!source) {
                    setStatus('未找到播放源');
                    return;
                }

                if (!initialized) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                        initialized = true;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        initialized = true;
                    } else {
                        video.src = source;
                        initialized = true;
                        setStatus('当前浏览器可能需要更完整的视频播放支持');
                    }
                }

                if (button) {
                    button.classList.add('hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setStatus('浏览器拦截了自动播放，请再次点击播放按钮');
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('hidden');
                    }
                    setStatus('');
                });
                video.addEventListener('pause', function () {
                    if (video.currentTime === 0 && button) {
                        button.classList.remove('hidden');
                    }
                });
                video.addEventListener('error', function () {
                    setStatus('播放源加载失败，请检查网络或稍后重试');
                    if (button) {
                        button.classList.remove('hidden');
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initPlayers();
    });
})();
