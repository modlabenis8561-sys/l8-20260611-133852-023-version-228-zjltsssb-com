(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var yearFilter = scope.querySelector('[data-year-filter]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

        if (scope.hasAttribute('data-search-page') && input) {
            var query = new URLSearchParams(window.location.search).get('q');
            if (query) {
                input.value = query;
            }
        }

        function normal(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normal(input ? input.value : '');
            var year = yearFilter ? yearFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';

            cards.forEach(function (card) {
                var haystack = normal([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchType = !type || card.getAttribute('data-type') === type;
                card.hidden = !(matchKeyword && matchYear && matchType);
            });
        }

        [input, yearFilter, typeFilter].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    document.querySelectorAll('[data-ranking-tabs]').forEach(function (wrap) {
        var buttons = Array.prototype.slice.call(wrap.querySelectorAll('[data-ranking-button]'));
        var panels = Array.prototype.slice.call(wrap.querySelectorAll('[data-ranking-panel]'));

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var target = button.getAttribute('data-ranking-button');
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                panels.forEach(function (panel) {
                    panel.classList.toggle('active', panel.getAttribute('data-ranking-panel') === target);
                });
            });
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var trigger = player.querySelector('.player-trigger');
        var hlsInstance = null;

        if (!video || !trigger) {
            return;
        }

        function attachVideo() {
            var source = video.getAttribute('data-video');
            if (!source || video.getAttribute('data-ready') === '1') {
                return;
            }
            video.setAttribute('data-ready', '1');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function playVideo() {
            attachVideo();
            player.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        trigger.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                player.classList.add('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
