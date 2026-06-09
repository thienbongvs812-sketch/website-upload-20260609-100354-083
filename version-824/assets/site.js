(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (button && menu) {
      button.addEventListener("click", function () {
        var opened = menu.classList.toggle("is-open");
        button.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var search = scope.querySelector("[data-filter-search]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));

      function applyFilter() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-genre") || ""
          ].join(" ").toLowerCase();
          var cardYear = Number(card.getAttribute("data-year") || "0");
          var typeOk = !selectedType || card.getAttribute("data-type") === selectedType;
          var yearOk = true;
          if (selectedYear === "new") {
            yearOk = cardYear >= 2024;
          }
          if (selectedYear === "recent") {
            yearOk = cardYear >= 2020 && cardYear <= 2023;
          }
          if (selectedYear === "classic") {
            yearOk = cardYear < 2020;
          }
          var queryOk = !q || text.indexOf(q) !== -1;
          card.hidden = !(queryOk && typeOk && yearOk);
        });
      }

      [search, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", applyFilter);
          el.addEventListener("change", applyFilter);
        }
      });
    });

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      if (!slides.length) {
        return;
      }
      var current = 0;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
          slide.setAttribute("aria-hidden", i === current ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      show(0);
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    });
  });
})();

function initMoviePlayer(url) {
  function run() {
    var video = document.querySelector("[data-movie-video]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !cover || !url) {
      return;
    }
    var started = false;
    var hlsInstance = null;

    function attachAndPlay() {
      if (!started) {
        started = true;
        cover.classList.add("is-hidden");
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    cover.addEventListener("click", attachAndPlay);
    video.addEventListener("click", function () {
      if (!started) {
        attachAndPlay();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}
