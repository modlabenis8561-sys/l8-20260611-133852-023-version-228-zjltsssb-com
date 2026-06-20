(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
    document.querySelectorAll('.site-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initHero() {
    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer;

      if (!slides.length) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          schedule();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          schedule();
        });
      });

      slider.addEventListener('mouseenter', function () {
        window.clearInterval(timer);
      });

      slider.addEventListener('mouseleave', schedule);
      show(0);
      schedule();
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-zone]').forEach(function (zone) {
      var input = zone.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(zone.querySelectorAll('[data-filter-key]'));
      var items = Array.prototype.slice.call(zone.querySelectorAll('[data-filter-item]'));
      var state = {};

      buttons.forEach(function (button) {
        var key = button.getAttribute('data-filter-key');
        if (!(key in state)) {
          state[key] = 'all';
        }
        button.addEventListener('click', function () {
          state[key] = button.getAttribute('data-filter-value') || 'all';
          buttons.filter(function (item) {
            return item.getAttribute('data-filter-key') === key;
          }).forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener('input', apply);
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        items.forEach(function (item) {
          var matched = true;
          Object.keys(state).forEach(function (key) {
            var value = state[key];
            if (value !== 'all') {
              var attr = item.getAttribute('data-' + key) || '';
              if (String(attr) !== String(value)) {
                matched = false;
              }
            }
          });
          if (term) {
            var haystack = [
              item.getAttribute('data-title'),
              item.getAttribute('data-region'),
              item.getAttribute('data-type'),
              item.getAttribute('data-year'),
              item.getAttribute('data-genre'),
              item.textContent
            ].join(' ').toLowerCase();
            if (haystack.indexOf(term) === -1) {
              matched = false;
            }
          }
          item.classList.toggle('is-hidden', !matched);
        });
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var stream = player.getAttribute('data-stream');
      var cover = player.getAttribute('data-cover');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !stream) {
        return;
      }

      if (cover) {
        video.setAttribute('poster', cover);
      }

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        load();
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
            video.setAttribute('controls', 'controls');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (!loaded) {
          play();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }
})();
