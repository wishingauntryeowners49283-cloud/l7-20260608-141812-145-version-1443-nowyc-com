(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previousButton = hero.querySelector('[data-hero-prev]');
        var nextButton = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        if (previousButton) {
            previousButton.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                restartTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();
    }

    var searchInput = document.querySelector('[data-movie-search]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var type = normalize(typeFilter ? typeFilter.value : '');

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (type && cardType !== type) {
                matched = false;
            }

            card.classList.toggle('is-hidden', !matched);
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            searchInput.value = q;
        }

        searchInput.addEventListener('input', applyFilters);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }

    if (cards.length) {
        applyFilters();
    }
})();

function initMoviePlayer(videoId, buttonId, playlistUrl, posterUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hasStarted = false;
    var hlsInstance = null;

    if (!video || !button) {
        return;
    }

    if (posterUrl) {
        video.setAttribute('poster', posterUrl);
    }

    function attachStream() {
        if (hasStarted) {
            return;
        }

        hasStarted = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playlistUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(playlistUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = playlistUrl;
        }
    }

    function startPlayback() {
        attachStream();
        button.classList.add('is-hidden');
        video.play().catch(function () {});
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
        if (!hasStarted) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
            hlsInstance.stopLoad();
        }
    });
}
