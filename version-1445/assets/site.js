function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.opacity = "0";
    });
  });

  setupHero();
  setupCardFilters();
  setupSearchPage();
});

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }

  var index = 0;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
    });
  });

  show(0);
  window.setInterval(function () {
    show(index + 1);
  }, 5200);
}

function setupCardFilters() {
  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var grid = document.querySelector(panel.getAttribute("data-filter-panel"));
    if (!grid) {
      return;
    }
    var input = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var empty = document.querySelector(panel.getAttribute("data-empty-target"));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;
      grid.querySelectorAll("[data-movie-card]").forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre].join(" ").toLowerCase();
        var cardYear = Number(card.dataset.year || 0);
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = true;
        if (yearValue === "2025") {
          matchYear = cardYear >= 2025;
        } else if (yearValue === "2020") {
          matchYear = cardYear >= 2020 && cardYear <= 2024;
        } else if (yearValue === "2010") {
          matchYear = cardYear >= 2010 && cardYear <= 2019;
        } else if (yearValue === "2000") {
          matchYear = cardYear < 2010;
        }
        var matchType = !typeValue || card.dataset.type === typeValue;
        var ok = matchKeyword && matchYear && matchType;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [input, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  });
}

function setupSearchPage() {
  var mount = document.querySelector("[data-search-results]");
  var input = document.querySelector("[data-search-input]");
  if (!mount || !input || !window.SEARCH_MOVIES) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";

  function card(movie) {
    return [
      '<article class="movie-card compact-card" data-movie-card>',
      '<a class="poster-link" href="./' + movie.file + '">',
      '<img class="poster-image" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-badge">播放</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p class="card-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>',
      '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function run() {
    var keyword = input.value.trim().toLowerCase();
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      if (!keyword) {
        return movie.hot;
      }
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);
    mount.innerHTML = matches.map(card).join('');
    if (!matches.length) {
      mount.innerHTML = '<div class="empty-state" style="display:block">没有找到匹配的影片</div>';
    }
  }

  input.addEventListener("input", run);
  run();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initPlayer(source) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var button = document.querySelector("[data-player-button]");
  if (!video || !source) {
    return;
  }

  function start() {
    if (overlay) {
      overlay.classList.add("hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  } else if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else {
    video.src = source;
  }

  if (button) {
    button.addEventListener("click", start);
  }
  if (overlay) {
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        start();
      }
    });
  }
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  });
}
