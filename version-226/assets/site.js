document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            const isOpen = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        let active = 0;
        let timer = null;

        const showSlide = function (next) {
            if (!slides.length) {
                return;
            }

            active = (next + slides.length) % slides.length;

            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === active);
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === active);
                dot.setAttribute('aria-pressed', String(index === active));
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        start();
    }

    const forms = Array.from(document.querySelectorAll('[data-filter-form]'));

    forms.forEach(function (form) {
        const gridSelector = form.getAttribute('data-grid');
        const grid = document.querySelector(gridSelector);
        const empty = document.querySelector(gridSelector + '-empty');

        if (!grid) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll('.searchable-card'));
        const controls = Array.from(form.querySelectorAll('input, select'));

        const inYearGroup = function (year, group) {
            if (!group) {
                return true;
            }

            const value = Number(year || 0);

            if (group === '2020') {
                return value >= 2020;
            }
            if (group === '2010') {
                return value >= 2010 && value < 2020;
            }
            if (group === '2000') {
                return value >= 2000 && value < 2010;
            }
            if (group === '1990') {
                return value < 2000;
            }
            return true;
        };

        const apply = function () {
            const formData = new FormData(form);
            const keyword = String(formData.get('keyword') || '').trim().toLowerCase();
            const category = String(formData.get('category') || '').trim();
            const type = String(formData.get('type') || '').trim();
            const year = String(formData.get('year') || '').trim();
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.textContent
                ].join(' ').toLowerCase();

                const okKeyword = !keyword || haystack.includes(keyword);
                const okCategory = !category || card.dataset.category === category;
                const okType = !type || card.dataset.type === type;
                const okYear = inYearGroup(card.dataset.year, year);
                const matched = okKeyword && okCategory && okType && okYear;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        };

        controls.forEach(function (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
    });
});
