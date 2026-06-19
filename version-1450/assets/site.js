(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function renderResult(item) {
    return '' +
      '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<div>' +
          '<h3>' + item.title + '</h3>' +
          '<p>' + item.year + ' · ' + item.region + ' · ' + item.type + '</p>' +
          '<p>' + item.genre + '</p>' +
        '</div>' +
      '</a>';
  }

  function searchMovies(query, limit) {
    var q = normalize(query);
    if (!q || !window.siteMovies) {
      return [];
    }
    var list = [];
    for (var i = 0; i < window.siteMovies.length; i += 1) {
      var item = window.siteMovies[i];
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.tags
      ].join(' '));
      if (haystack.indexOf(q) !== -1) {
        list.push(item);
      }
      if (list.length >= limit) {
        break;
      }
    }
    return list;
  }

  function mountSearch(input, panel, limit) {
    if (!input || !panel) {
      return;
    }

    function update() {
      var results = searchMovies(input.value, limit || 8);
      if (!results.length) {
        panel.classList.remove('visible');
        panel.innerHTML = '';
        return;
      }
      panel.innerHTML = results.map(renderResult).join('');
      panel.classList.add('visible');
    }

    input.addEventListener('input', update);
    input.addEventListener('focus', update);

    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove('visible');
      }
    });
  }

  function initMobileMenu() {
    var button = qs('#menuToggle');
    var nav = qs('#mainNav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function initWideSearch() {
    mountSearch(qs('#siteSearch'), qs('#searchResults'), 10);
    mountSearch(qs('#wideSearchInput'), qs('#wideSearchResults'), 16);

    var wideButton = qs('#wideSearchButton');
    var wideInput = qs('#wideSearchInput');
    var widePanel = qs('#wideSearchResults');
    if (wideButton && wideInput && widePanel) {
      wideButton.addEventListener('click', function () {
        var results = searchMovies(wideInput.value, 24);
        widePanel.innerHTML = results.map(renderResult).join('');
        widePanel.classList.toggle('visible', results.length > 0);
      });
    }

    var pageInput = qs('#searchPageInput');
    var pageButton = qs('#searchPageButton');
    var pageResults = qs('#searchPageResults');
    if (pageInput && pageResults) {
      function runPageSearch() {
        var results = searchMovies(pageInput.value, 80);
        pageResults.innerHTML = results.map(renderResult).join('');
      }
      pageInput.addEventListener('input', runPageSearch);
      if (pageButton) {
        pageButton.addEventListener('click', runPageSearch);
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        pageInput.value = q;
        runPageSearch();
      }
    }

    qsa('form[role="search"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[type="search"]', form);
        var q = input ? input.value.trim() : '';
        if (q) {
          window.location.href = 'search.html?q=' + encodeURIComponent(q);
        }
      });
    });
  }

  function initLocalFilters() {
    var grid = qs('#catalogGrid');
    if (!grid) {
      return;
    }
    var cards = qsa('.movie-card', grid);
    var search = qs('#localSearch');
    var year = qs('#yearFilter');
    var type = qs('#typeFilter');

    function apply() {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          matched = false;
        }
        if (t && normalize(card.getAttribute('data-type')) !== t) {
          matched = false;
        }
        card.classList.toggle('hidden-by-filter', !matched);
      });
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  window.initMoviePlayer = function (config) {
    var video = qs('#movieVideo');
    var overlay = qs('#playerOverlay');
    if (!video || !config || !config.source) {
      return;
    }

    var loaded = false;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    attach();
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initWideSearch();
    initLocalFilters();
  });
}());
