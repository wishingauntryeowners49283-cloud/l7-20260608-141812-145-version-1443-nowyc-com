(function () {
  function startPlayer(box) {
    var video = box.querySelector('video');
    var source = video ? video.getAttribute('data-stream') : '';

    if (!video || !source) {
      return;
    }

    box.classList.add('is-playing');

    if (video.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    video.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var button = box.querySelector('.video-start');
    var video = box.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(box);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    }
  });
})();
