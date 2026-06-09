(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        }, { once: true });
    });

    function setupHeroSlider() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot') || '0', 10);
                showSlide(index);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilterRoot() {
        var root = document.querySelector('[data-filter-root]');
        if (!root) {
            return;
        }

        var keywordInput = root.querySelector('[data-filter-keyword]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var regionSelect = root.querySelector('[data-filter-region]');
        var countNode = root.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));

        function applyFilter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matchType = !type || normalize(card.getAttribute('data-type')) === type;
                var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
                var shouldShow = matchKeyword && matchYear && matchType && matchRegion;

                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    function setupSearchPage() {
        var root = document.querySelector('[data-search-page]');
        if (!root || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var form = root.querySelector('[data-search-form]');
        var input = root.querySelector('[data-search-input]');
        var typeSelect = root.querySelector('[data-search-type]');
        var yearSelect = root.querySelector('[data-search-year]');
        var summary = root.querySelector('[data-search-summary]');
        var results = root.querySelector('[data-search-results]');
        var index = window.MOVIE_SEARCH_INDEX || [];
        var params = new URLSearchParams(window.location.search);

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(typeSelect, Array.from(new Set(index.map(function (item) { return item.type; }).filter(Boolean))).sort());
        fillSelect(yearSelect, Array.from(new Set(index.map(function (item) { return item.year; }).filter(Boolean))).sort().reverse());

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function cardTemplate(item) {
            return '' +
                '<a class="movie-card" href="' + item.url + '" data-movie-card>' +
                    '<span class="movie-poster-frame">' +
                        '<img class="movie-poster" src="' + item.poster + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                        '<span class="poster-shade"></span>' +
                        '<span class="poster-play">▶</span>' +
                        '<span class="poster-year">' + escapeHtml(item.year) + '</span>' +
                    '</span>' +
                    '<span class="movie-card-body">' +
                        '<strong>' + escapeHtml(item.title) + '</strong>' +
                        '<span class="movie-one-line">' + escapeHtml(item.oneLine) + '</span>' +
                        '<span class="movie-meta-line"><em>' + escapeHtml(item.region) + '</em><em>' + escapeHtml(item.type) + '</em></span>' +
                    '</span>' +
                '</a>';
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function runSearch(event) {
            if (event) {
                event.preventDefault();
            }

            var keyword = normalize(input && input.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var matched = index.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.tags,
                    item.oneLine
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !type || normalize(item.type) === type;
                var matchYear = !year || normalize(item.year) === year;
                return matchKeyword && matchType && matchYear;
            });

            var limited = matched.slice(0, 240);
            results.innerHTML = limited.map(cardTemplate).join('');
            results.querySelectorAll('img').forEach(function (image) {
                image.addEventListener('error', function () {
                    image.classList.add('is-missing');
                }, { once: true });
            });

            summary.textContent = '共找到 ' + matched.length + ' 部影片，当前显示前 ' + limited.length + ' 部。';
        }

        if (form) {
            form.addEventListener('submit', runSearch);
        }
        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runSearch);
                control.addEventListener('change', runSearch);
            }
        });

        runSearch();
    }

    function setupPlayer() {
        var root = document.querySelector('[data-player]');
        var video = document.querySelector('[data-movie-player]');
        if (!root || !video) {
            return;
        }

        var button = root.querySelector('[data-player-start]');
        var status = root.querySelector('[data-player-status]');
        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var loaded = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function loadSource() {
            if (loaded || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('视频已加载，点击视频可播放');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setStatus('视频加载异常，可刷新后重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('浏览器原生播放');
            } else {
                video.src = source;
                setStatus('已连接视频');
            }

            loaded = true;
        }

        function playVideo() {
            loadSource();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    setStatus('请再次点击播放器开始播放');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
            setStatus('正在播放');
        });

        video.addEventListener('pause', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
            setStatus('已暂停');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    setupHeroSlider();
    setupFilterRoot();
    setupSearchPage();
    setupPlayer();
}());
