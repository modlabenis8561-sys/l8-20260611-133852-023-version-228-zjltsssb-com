(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  function hideBrokenImageIcons() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-load-failed');
        image.style.opacity = '0';
      });
    });
  }

  function setupNavigation() {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    var searchToggle = document.querySelector('[data-search-toggle]');
    var headerSearch = document.querySelector('[data-header-search]');

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    if (searchToggle && headerSearch) {
      searchToggle.addEventListener('click', function () {
        headerSearch.classList.toggle('is-open');
        var input = headerSearch.querySelector('input');
        if (input && headerSearch.classList.contains('is-open')) {
          input.focus();
        }
      });
    }
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function applyFilters(form, grid, counter) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var keywordInput = form.querySelector('[data-filter-keyword], [data-local-filter-input]');
    var regionInput = form.querySelector('[data-filter-region]');
    var typeInput = form.querySelector('[data-filter-type]');
    var yearInput = form.querySelector('[data-filter-year]');
    var sortInput = form.querySelector('[data-filter-sort]');

    function matches(card) {
      var keyword = normalise(keywordInput ? keywordInput.value : '');
      var region = normalise(regionInput ? regionInput.value : '');
      var type = normalise(typeInput ? typeInput.value : '');
      var year = normalise(yearInput ? yearInput.value : '');
      var haystack = normalise([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (region && normalise(card.dataset.region) !== region) {
        return false;
      }
      if (type && normalise(card.dataset.type) !== type) {
        return false;
      }
      if (year && normalise(card.dataset.year) !== year) {
        return false;
      }
      return true;
    }

    function sortCards() {
      var sort = sortInput ? sortInput.value : '';
      if (!sort || sort === 'id') {
        return;
      }
      var sorted = cards.slice().sort(function (a, b) {
        if (sort === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return Number(b.dataset[sort] || 0) - Number(a.dataset[sort] || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function run() {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var isVisible = matches(card);
        card.classList.toggle('is-hidden-by-filter', !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });
      sortCards();
      if (counter) {
        counter.textContent = String(visibleCount);
      }
    }

    form.addEventListener('input', run);
    form.addEventListener('change', run);
    form.addEventListener('reset', function () {
      window.setTimeout(run, 0);
    });
    run();
  }

  function setupMovieFilters() {
    document.querySelectorAll('[data-movie-filter-form]').forEach(function (form) {
      var section = form.closest('section') || document;
      var grid = section.querySelector('[data-filter-grid]');
      var counter = section.querySelector('[data-filter-count]');
      if (grid) {
        applyFilters(form, grid, counter);
      }
    });

    document.querySelectorAll('[data-local-filter-input]').forEach(function (input) {
      var section = input.closest('section') || document;
      var grid = section.querySelector('[data-filter-grid]');
      var counter = section.querySelector('[data-filter-count]');
      if (!grid) {
        return;
      }
      var form = document.createElement('form');
      form.appendChild(input.cloneNode(true));
      input.addEventListener('input', function () {
        var keyword = normalise(input.value);
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var visibleCount = 0;
        cards.forEach(function (card) {
          var haystack = normalise([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var visible = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden-by-filter', !visible);
          if (visible) {
            visibleCount += 1;
          }
        });
        if (counter) {
          counter.textContent = String(visibleCount) + ' 部影片';
        }
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    if (!form) {
      return;
    }
    var grid = document.querySelector('[data-filter-grid]');
    var counter = document.querySelector('[data-filter-count]');
    var input = form.querySelector('[data-filter-keyword]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    if (grid) {
      applyFilters(form, grid, counter);
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  }

  function setupRankingTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-rank-tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-rank-panel]'));
    if (!tabs.length) {
      return;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.dataset.rankTab;
        tabs.forEach(function (item) {
          item.classList.toggle('is-active', item === tab);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.dataset.rankPanel === key);
        });
      });
    });
  }

  ready(function () {
    hideBrokenImageIcons();
    setupNavigation();
    setupHeroSlider();
    setupMovieFilters();
    setupSearchPage();
    setupRankingTabs();
  });
})();
