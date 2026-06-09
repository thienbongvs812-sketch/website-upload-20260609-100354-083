(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero-carousel]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupLocalFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var keywordInput = qs('[data-filter-keyword]', scope);
      var yearSelect = qs('[data-filter-year]', scope);
      var typeSelect = qs('[data-filter-type]', scope);
      var resultCount = qs('[data-result-count]', scope);
      var cards = qsa('[data-card]', scope);

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var keywordOk = !keyword || text.indexOf(keyword) !== -1;
          var yearOk = !year || cardYear === year;
          var typeOk = !type || cardType === type;
          var show = keywordOk && yearOk && typeOk;
          card.classList.toggle('hidden-card', !show);
          if (show) {
            visible += 1;
          }
        });
        if (resultCount) {
          resultCount.textContent = '当前显示 ' + visible + ' 部';
        }
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('[data-play-button]', player);
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src');
      var started = false;

      function attachSource() {
        if (!source || started) {
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            video.controls = true;
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }
      video.addEventListener('click', function () {
        attachSource();
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    });
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="rating-badge">' + movie.rating + '</span>',
      '    <span class="play-mark">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-meta">' + movie.year + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category) + '</p>',
      '    <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function setupSearchPage() {
    var root = qs('[data-search-page]');
    if (!root || !window.SITE_MOVIES) {
      return;
    }
    var input = qs('[data-search-input]', root);
    var form = qs('[data-search-main-form]', root);
    var results = qs('[data-search-results]', root);
    var count = qs('[data-search-count]', root);
    var sort = qs('[data-search-sort]', root);
    var buttons = qsa('[data-search-term]', root);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function run(push) {
      var query = normalize(input && input.value);
      var items = window.SITE_MOVIES.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.summary].join(' '));
        return !query || text.indexOf(query) !== -1;
      });
      var sortBy = sort ? sort.value : 'relevance';
      if (sortBy === 'rating') {
        items.sort(function (a, b) { return b.rating - a.rating; });
      } else if (sortBy === 'year') {
        items.sort(function (a, b) { return b.year - a.year; });
      } else if (sortBy === 'heat') {
        items.sort(function (a, b) { return b.heat - a.heat; });
      }
      if (count) {
        count.textContent = query ? '找到 ' + items.length + ' 部相关影片' : '请输入关键词或选择热门搜索';
      }
      if (results) {
        results.innerHTML = items.slice(0, 240).map(renderSearchCard).join('') || '<div class="empty-state">未找到相关影片</div>';
      }
      if (push) {
        var nextUrl = query ? ('search.html?q=' + encodeURIComponent(input.value.trim())) : 'search.html';
        window.history.replaceState(null, '', nextUrl);
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        run(true);
      });
    }
    if (sort) {
      sort.addEventListener('change', function () {
        run(false);
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) {
          input.value = button.getAttribute('data-search-term') || '';
        }
        run(true);
      });
    });
    run(false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilters();
    setupPlayer();
    setupSearchPage();
  });
}());
