(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mainNav = document.querySelector("[data-main-nav]");
  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    start();
  });

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  var filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    var input = filterPanel.querySelector("[data-filter-input]");
    var yearSelect = filterPanel.querySelector("[data-filter-year]");
    var typeSelect = filterPanel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && input) {
      input.value = query;
    }

    function applyFilters() {
      var term = normalize(input && input.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" "));
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
        var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
        var shouldShow = matchesTerm && matchesYear && matchesType;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [input, yearSelect, typeSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
})();

function setupMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var button = document.querySelector("[data-player-button]");
  var hlsInstance = null;
  var started = false;

  if (!video || !streamUrl) {
    return;
  }

  function hideButton() {
    if (button) {
      button.classList.add("is-hidden");
    }
  }

  function playVideo() {
    hideButton();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function loadVideo() {
    if (started) {
      playVideo();
      return;
    }
    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      return;
    }

    video.src = streamUrl;
    playVideo();
  }

  if (button) {
    button.addEventListener("click", loadVideo);
  }

  video.addEventListener("click", function () {
    if (!started || video.paused) {
      loadVideo();
    }
  });

  video.addEventListener("play", hideButton);

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
