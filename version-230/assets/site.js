(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var status = panel.querySelector('[data-filter-status]');
            var clearButton = panel.querySelector('[data-clear-search]');
            var container = panel.parentElement;
            var cards = container ? Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]')) : [];

            function applyFilter(value) {
                var query = normalize(value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var visible = !query || haystack.indexOf(query) !== -1;

                    card.classList.toggle('is-hidden', !visible);

                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (status) {
                    status.textContent = query ? '已筛选出 ' + visibleCount + ' 部影片' : '当前显示 ' + cards.length + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', function () {
                    applyFilter(input.value);
                });
            }

            if (clearButton) {
                clearButton.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    applyFilter('');
                });
            }

            panel.querySelectorAll('[data-filter-value]').forEach(function (button) {
                button.addEventListener('click', function () {
                    var value = button.getAttribute('data-filter-value') || '';
                    if (input) {
                        input.value = value;
                    }
                    applyFilter(value);
                });
            });

            applyFilter('');
        });
    }

    window.handlePosterError = function (image) {
        var wrap = image.closest('.poster-wrap') || image.parentElement;

        if (wrap) {
            wrap.classList.add('is-missing');
        }

        image.remove();
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
    });
})();
