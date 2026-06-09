(function () {
    var header = document.getElementById("siteHeader");
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.getElementById("mobileMenu");

    function onScroll() {
        if (!header) {
            return;
        }
        if (window.scrollY > 12) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileMenu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", isOpen);
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var nextButton = hero.querySelector("[data-hero-next]");
        var prevButton = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    }

    function applyFilters(scope) {
        var input = scope.querySelector("[data-local-search]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-local-filter]"));
        var activeValue = "all";

        function filterCards() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var year = card.getAttribute("data-year") || "";
                var type = card.getAttribute("data-type") || "";
                var region = card.getAttribute("data-region") || "";
                var matchesText = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesFilter = activeValue === "all" || year === activeValue || type.indexOf(activeValue) !== -1 || region.indexOf(activeValue) !== -1 || haystack.indexOf(activeValue.toLowerCase()) !== -1;
                card.classList.toggle("is-hidden", !(matchesText && matchesFilter));
            });
        }

        if (input) {
            input.addEventListener("input", filterCards);
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                input.value = query;
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeValue = button.getAttribute("data-local-filter") || "all";
                filterCards();
            });
        });

        filterCards();
    }

    Array.prototype.slice.call(document.querySelectorAll(".filter-grid")).forEach(function (grid) {
        var scope = grid.closest("section") || document;
        applyFilters(scope);
    });

    var rankSearch = document.querySelector("[data-rank-search]");
    if (rankSearch) {
        var rows = Array.prototype.slice.call(document.querySelectorAll(".ranking-row"));
        rankSearch.addEventListener("input", function () {
            var keyword = rankSearch.value.trim().toLowerCase();
            rows.forEach(function (row) {
                var haystack = (row.getAttribute("data-search") || "").toLowerCase();
                row.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
            });
        });
    }
})();
