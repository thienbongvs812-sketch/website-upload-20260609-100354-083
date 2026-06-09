(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMobileNav() {
        var button = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            nav.hidden = expanded;
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter(targetId) {
        var grid = document.getElementById(targetId);
        if (!grid) {
            return;
        }
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target="' + targetId + '"]'));
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
            var visible = true;
            inputs.forEach(function (input) {
                var value = normalize(input.value);
                if (!value) {
                    return;
                }
                var field = input.getAttribute('data-filter-field');
                var haystack = field ? normalize(card.getAttribute('data-' + field)) : normalize(card.getAttribute('data-search'));
                if (haystack.indexOf(value) === -1) {
                    visible = false;
                }
            });
            card.classList.toggle('is-hidden', !visible);
        });
    }

    function initFilters() {
        var controls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target]'));
        controls.forEach(function (control) {
            var targetId = control.getAttribute('data-filter-target');
            control.addEventListener('input', function () {
                applyFilter(targetId);
            });
            control.addEventListener('change', function () {
                applyFilter(targetId);
            });
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var searchInput = document.getElementById('search-page-input');
        if (q && searchInput) {
            searchInput.value = q;
            applyFilter(searchInput.getAttribute('data-filter-target'));
        }
    }

    function initSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search-form'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-src');
            var loaded = false;
            var hls = null;

            function attachSource() {
                if (loaded || !source) {
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    if (window.Hls.Events && window.Hls.Events.ERROR) {
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (!data || !data.fatal) {
                                return;
                            }
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            }
                        });
                    }
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                attachSource();
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime < 0.2 || video.ended) {
                    player.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                player.classList.remove('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initSearchForms();
        initPlayers();
    });
}());
