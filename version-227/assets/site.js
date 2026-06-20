const navToggle = document.querySelector("[data-nav-toggle]");
const mainNav = document.querySelector("[data-main-nav]");

if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
        mainNav.classList.toggle("is-open");
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === current;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", active ? "false" : "true");
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    const start = () => {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            stop();
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function initFilters() {
    const list = document.querySelector("[data-filter-list]");
    if (!list) {
        return;
    }

    const input = document.querySelector("[data-filter-input]");
    const year = document.querySelector("[data-year-filter]");
    const empty = document.querySelector("[data-empty-result]");
    const cards = Array.from(list.querySelectorAll(".movie-card, .rank-item"));

    const apply = () => {
        const query = normalize(input ? input.value : "");
        const selectedYear = year ? year.value : "";
        let visible = 0;

        cards.forEach((card) => {
            const text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(" "));
            const yearOk = !selectedYear || card.dataset.year === selectedYear;
            const queryOk = !query || text.includes(query);
            const show = yearOk && queryOk;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    };

    if (input) {
        input.addEventListener("input", apply);
    }
    if (year) {
        year.addEventListener("change", apply);
    }

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get("q");
    const yearParam = params.get("year");

    if (queryParam && input) {
        input.value = queryParam;
    }
    if (yearParam && year) {
        year.value = yearParam;
    }

    apply();
}

initHero();
initFilters();
