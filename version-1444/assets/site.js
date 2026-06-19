(function () {
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  const filterInputs = Array.from(document.querySelectorAll('.page-filter-input'));
  const searchableCards = Array.from(document.querySelectorAll('.searchable-grid [data-search]'));

  function filterCards(value) {
    const keyword = String(value || '').trim().toLowerCase();
    let visible = 0;

    searchableCards.forEach(function (card) {
      const text = card.getAttribute('data-search') || '';
      const matched = !keyword || text.includes(keyword);
      card.classList.toggle('is-filtered-out', !matched);
      if (matched) {
        visible += 1;
      }
    });

    const counter = document.getElementById('result-count');
    if (counter) {
      counter.textContent = keyword ? '找到 ' + visible + ' 部相关影片' : '共 ' + visible + ' 部影片';
    }
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input.value);
    });
  });

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('q') || '';
    const input = document.getElementById('search-input');
    if (input) {
      input.value = keyword;
      input.addEventListener('input', function () {
        filterCards(input.value);
      });
    }
    filterCards(keyword);
  } else if (filterInputs.length) {
    filterCards('');
  }
}());
