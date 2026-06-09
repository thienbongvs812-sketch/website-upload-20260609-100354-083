(() => {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', () => {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });
        if (slides.length > 1) {
            window.setInterval(() => showSlide(current + 1), 5000);
        }
    }

    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get('q') || '';
    const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
    const yearFilter = document.querySelector('[data-filter-year]');
    const typeFilter = document.querySelector('[data-filter-type]');
    const categoryFilter = document.querySelector('[data-filter-category]');
    const clearButton = document.querySelector('[data-clear-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilter = () => {
        if (!cards.length) {
            return;
        }
        const text = normalize(searchInputs[0] ? searchInputs[0].value : '');
        const year = normalize(yearFilter ? yearFilter.value : '');
        const type = normalize(typeFilter ? typeFilter.value : '');
        const category = normalize(categoryFilter ? categoryFilter.value : '');
        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.type,
                card.dataset.region,
                card.dataset.category,
                card.dataset.keywords,
                card.textContent
            ].join(' '));
            const matchesText = !text || haystack.includes(text);
            const matchesYear = !year || normalize(card.dataset.year) === year;
            const matchesType = !type || normalize(card.dataset.type).includes(type);
            const matchesCategory = !category || normalize(card.dataset.category) === category;
            card.classList.toggle('is-hidden', !(matchesText && matchesYear && matchesType && matchesCategory));
        });
    };

    if (searchInputs.length) {
        searchInputs.forEach((input) => {
            if (queryValue) {
                input.value = queryValue;
            }
            input.addEventListener('input', applyFilter);
        });
        [yearFilter, typeFilter, categoryFilter].forEach((control) => {
            if (control) {
                control.addEventListener('change', applyFilter);
            }
        });
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInputs.forEach((input) => { input.value = ''; });
                [yearFilter, typeFilter, categoryFilter].forEach((control) => {
                    if (control) {
                        control.value = '';
                    }
                });
                applyFilter();
            });
        }
        applyFilter();
    }

    const players = Array.from(document.querySelectorAll('[data-player]'));
    players.forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const state = player.querySelector('[data-player-state]');
        const url = player.dataset.hls;
        let ready = false;

        const setState = (message) => {
            if (state) {
                state.textContent = message || '';
            }
        };

        const start = () => {
            if (!video || !url) {
                setState('播放暂不可用');
                return;
            }
            const playNow = () => {
                const attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(() => setState('请再次点击播放'));
                }
                player.classList.add('is-playing');
            };
            if (ready) {
                playNow();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    ready = true;
                    playNow();
                });
                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        setState('播放暂不可用');
                    }
                });
            } else {
                video.src = url;
                ready = true;
                playNow();
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', () => player.classList.add('is-playing'));
        }
    });
})();
