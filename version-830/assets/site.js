(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
    var root = scope.parentElement || document;
    var keyword = scope.querySelector("[data-filter-keyword]");
    var year = scope.querySelector("[data-filter-year]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
    var empty = root.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keywordValue = normalize(keyword && keyword.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchesKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
        var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
        var shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesType;

        card.classList.toggle("is-hidden", !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keyword, year, region, type].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
})();
