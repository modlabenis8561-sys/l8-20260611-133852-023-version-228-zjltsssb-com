(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const navLinks = document.querySelector('[data-nav-links]');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', () => {
            navLinks.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const next = carousel.querySelector('[data-hero-next]');
        const prev = carousel.querySelector('[data-hero-prev]');
        let active = 0;
        let timer = null;

        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(active + 1), 5200);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                show(index);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', () => {
                show(active + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', () => {
                show(active - 1);
                start();
            });
        }

        show(0);
        start();
    }

    const searchInput = document.querySelector('[data-search-input]');
    const searchForm = document.querySelector('[data-search-form]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
    const emptyState = document.querySelector('[data-empty-state]');
    let activeFilter = 'all';

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilter = () => {
        if (!cards.length) {
            return;
        }

        const term = normalize(searchInput ? searchInput.value : '');
        let visible = 0;

        cards.forEach((card) => {
            const keywords = normalize(card.dataset.keywords || card.textContent);
            const year = normalize(card.dataset.year);
            const type = normalize(card.dataset.type);
            let filterMatched = true;

            if (activeFilter.startsWith('type:')) {
                filterMatched = type.includes(normalize(activeFilter.slice(5)));
            }

            if (activeFilter.startsWith('year:')) {
                filterMatched = year.includes(normalize(activeFilter.slice(5)));
            }

            const matched = keywords.includes(term) && filterMatched;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    };

    if (searchInput && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q');

        if (initial) {
            searchInput.value = initial;
        }

        searchInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    if (searchForm && cards.length) {
        searchForm.addEventListener('submit', (event) => {
            const hasAction = searchForm.getAttribute('action');
            if (!hasAction) {
                event.preventDefault();
                applyFilter();
            }
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter || 'all';
            filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
            applyFilter();
        });
    });
})();
