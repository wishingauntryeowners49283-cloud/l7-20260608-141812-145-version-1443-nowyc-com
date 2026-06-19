(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var slideIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === slideIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === slideIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(slideIndex + 1);
      }, 5200);
    }

    document.querySelectorAll(".filter-input").forEach(function (input) {
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        var scope = input.closest("main") || document;
        var cards = scope.querySelectorAll(".movie-card, .rank-item");
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          card.classList.toggle("hidden-card", value && text.indexOf(value) === -1);
        });
      });
    });

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("img-soft-hide");
      }, { once: true });
    });

    document.querySelectorAll(".player-card").forEach(function (card) {
      var video = card.querySelector("video[data-hls]");
      var button = card.querySelector(".player-play");
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute("data-hls");
      var hls = null;
      var loaded = false;

      function attachVideo() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = url;
        }
      }

      function playVideo() {
        attachVideo();
        card.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (!loaded) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        card.classList.add("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
