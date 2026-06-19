(function () {
  var page = document.querySelector('[data-search-page]');

  if (!page || !window.SEARCH_ITEMS) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = page.querySelector('input[name="q"]');
  var resultBox = page.querySelector('[data-search-results]');
  var title = page.querySelector('[data-search-title]');

  if (input) {
    input.value = query;
  }

  function card(item) {
    return [
      '<a class="movie-card" href="' + item.url + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="duration-badge">' + item.duration + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </span>',
      '  <span class="card-title">' + item.title + '</span>',
      '  <span class="card-meta"><span>★ ' + item.rating + '</span><span>' + item.category + '</span></span>',
      '  <span class="card-desc">' + item.summary + '</span>',
      '</a>'
    ].join('');
  }

  function normalize(text) {
    return String(text || '').toLowerCase();
  }

  var items = window.SEARCH_ITEMS.slice();

  if (query) {
    var key = normalize(query);
    items = items.filter(function (item) {
      return normalize(item.title + ' ' + item.category + ' ' + item.year + ' ' + item.genre + ' ' + item.region + ' ' + item.tags + ' ' + item.summary).indexOf(key) !== -1;
    });
    if (title) {
      title.textContent = '搜索结果';
    }
  } else {
    items = items.slice(0, 24);
  }

  if (!items.length) {
    resultBox.innerHTML = '<div class="empty-state">未找到匹配影片</div>';
    return;
  }

  resultBox.innerHTML = items.slice(0, 120).map(card).join('');
})();
