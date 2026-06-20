(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function getHlsConstructor() {
    return window.LocalHls || window.Hls || null;
  }

  function setupPlayer(container) {
    var video = container.querySelector('video[data-src]');
    var trigger = container.querySelector('[data-play-trigger]');
    var status = container.querySelector('[data-player-status]');
    var source = video ? video.dataset.src : '';
    var hlsInstance = null;
    var started = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      var HlsConstructor = getHlsConstructor();

      if (!video || !source) {
        setStatus('未找到播放源。');
        return false;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('已使用浏览器原生 HLS 播放能力。');
        return true;
      }

      if (HlsConstructor && HlsConstructor.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new HlsConstructor({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
            setStatus('播放源加载完成。');
          });
          hlsInstance.on(HlsConstructor.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus('播放器遇到网络或媒体错误，请刷新后重试。');
            }
          });
        }
        return true;
      }

      video.src = source;
      setStatus('当前浏览器未检测到 HLS 内核，已尝试直接加载播放源。');
      return true;
    }

    function startPlayback() {
      if (!video || !source) {
        return;
      }
      if (started) {
        video.play();
        return;
      }
      started = true;
      video.controls = true;
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      setStatus('正在加载播放源...');
      attachSource();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('播放已准备好，请再次点击播放器开始。');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          startPlayback();
        }
      });
    }

    window.addEventListener('local-hls-ready', function () {
      if (started && video && !video.src) {
        attachSource();
      }
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
