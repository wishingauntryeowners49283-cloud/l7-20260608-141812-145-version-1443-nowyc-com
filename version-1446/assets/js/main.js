(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      play();
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    play();
  }

  var cardList = document.querySelector('[data-card-list]');
  var localSearch = document.querySelector('[data-local-search]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));

  if (cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
    var activeCategory = 'all';

    function applyFilters() {
      var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var matchCategory = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
        var text = card.getAttribute('data-search') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-card', !(matchCategory && matchKeyword));
      });
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice();
      if (value === 'year') {
        sorted.sort(function (a, b) {
          return (Number(b.getAttribute('data-year')) || 0) - (Number(a.getAttribute('data-year')) || 0);
        });
      }
      if (value === 'rating') {
        sorted.sort(function (a, b) {
          var aRating = Number((a.querySelector('.card-meta span') || {}).textContent.replace(/[^0-9.]/g, '')) || 0;
          var bRating = Number((b.querySelector('.card-meta span') || {}).textContent.replace(/[^0-9.]/g, '')) || 0;
          return bRating - aRating;
        });
      }
      if (value === 'default') {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });
    }

    if (localSearch) {
      localSearch.addEventListener('input', applyFilters);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        sortCards();
        applyFilters();
      });
    }

    categoryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-category-filter') || 'all';
        categoryButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });
  }
})();
