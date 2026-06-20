(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        const button = $(".menu-toggle");
        const panel = $(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            const willOpen = panel.hasAttribute("hidden");
            if (willOpen) {
                panel.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
                button.textContent = "×";
            } else {
                panel.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
                button.textContent = "☰";
            }
        });
    }

    function setupHero() {
        const hero = $(".hero");
        if (!hero) {
            return;
        }
        const slides = $all(".hero-slide", hero);
        const dots = $all(".hero-dot", hero);
        if (!slides.length) {
            return;
        }
        let active = 0;
        let timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });
        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupCardFilter() {
        const input = $("[data-card-filter]");
        const cards = $all(".movie-card[data-title]");
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener("input", function () {
            const value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const text = [card.dataset.title, card.dataset.year, card.dataset.genre].join(" ").toLowerCase();
                card.style.display = text.indexOf(value) === -1 ? "none" : "";
            });
        });
    }

    function setupSearchPage() {
        const mount = $("#searchResults");
        const input = $("#siteSearchInput");
        const yearSelect = $("#yearFilter");
        const categorySelect = $("#categoryFilter");
        if (!mount || !input || !window.SITE_MOVIES) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const initial = params.get("q") || "";
        input.value = initial;
        function card(movie) {
            return [
                '<a class="movie-card" href="' + movie.href + '" data-title="' + escapeHtml(movie.title) + '">',
                '<div class="movie-poster"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="category-badge">' + escapeHtml(movie.category) + '</span><span class="play-badge">▶</span></div>',
                '<div class="movie-card-body"><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.oneLine) + '</p><div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div></div>',
                '</a>'
            ].join("");
        }
        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char];
            });
        }
        function render() {
            const query = input.value.trim().toLowerCase();
            const year = yearSelect ? yearSelect.value : "";
            const category = categorySelect ? categorySelect.value : "";
            const results = window.SITE_MOVIES.filter(function (movie) {
                const text = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
                const matchQuery = !query || text.indexOf(query) !== -1;
                const matchYear = !year || movie.year === year;
                const matchCategory = !category || movie.category === category;
                return matchQuery && matchYear && matchCategory;
            }).slice(0, 120);
            mount.innerHTML = results.length ? results.map(card).join("") : '<div class="empty-state">没有找到匹配内容，请换一个关键词试试。</div>';
        }
        [input, yearSelect, categorySelect].forEach(function (el) {
            if (el) {
                el.addEventListener("input", render);
                el.addEventListener("change", render);
            }
        });
        render();
    }

    window.initMoviePlayer = function (videoUrl) {
        const video = document.getElementById("moviePlayer");
        const cover = document.getElementById("playTrigger");
        const playButton = document.getElementById("playToggle");
        const muteButton = document.getElementById("muteToggle");
        const fullButton = document.getElementById("fullToggle");
        const status = document.getElementById("playerStatus");
        const shell = document.querySelector(".player-card");
        if (!video || !videoUrl) {
            return;
        }
        let hlsInstance = null;
        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }
        function load() {
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("准备播放");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放加载失败，请稍后重试");
                    }
                });
            } else {
                video.src = videoUrl;
                setStatus("准备播放");
            }
        }
        function play() {
            if (cover) {
                cover.classList.add("hidden");
            }
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    setStatus("点击画面继续播放");
                    if (cover) {
                        cover.classList.remove("hidden");
                    }
                });
            }
        }
        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }
        load();
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
            if (shell) {
                shell.classList.add("is-playing");
            }
            if (playButton) {
                playButton.textContent = "暂停";
            }
            setStatus("正在播放");
        });
        video.addEventListener("pause", function () {
            if (playButton) {
                playButton.textContent = "播放";
            }
            setStatus("已暂停");
        });
        video.addEventListener("ended", function () {
            if (cover) {
                cover.classList.remove("hidden");
            }
            if (shell) {
                shell.classList.remove("is-playing");
            }
            setStatus("播放结束");
        });
        if (playButton) {
            playButton.addEventListener("click", togglePlay);
        }
        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "声音" : "静音";
            });
        }
        if (fullButton) {
            fullButton.addEventListener("click", function () {
                const target = shell || video;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (target.requestFullscreen) {
                    target.requestFullscreen();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupCardFilter();
        setupSearchPage();
    });
}());
