(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initFilters() {
    var input = document.querySelector('.filter-input');
    var sort = document.querySelector('.filter-sort');
    var area = document.querySelector('.list-filter-area');
    var empty = document.querySelector('[data-empty-state]');

    if (!area) {
      return;
    }

    var originalCards = Array.prototype.slice.call(area.children);

    function haystack(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function apply() {
      var q = input ? normalize(input.value) : '';
      var cards = originalCards.slice();

      if (sort) {
        var mode = sort.value;
        if (mode === 'year-desc' || mode === 'year-asc') {
          cards.sort(function (a, b) {
            var ay = Number(a.getAttribute('data-year')) || 0;
            var by = Number(b.getAttribute('data-year')) || 0;
            return mode === 'year-desc' ? by - ay : ay - by;
          });
        }
        if (mode === 'title') {
          cards.sort(function (a, b) {
            return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
          });
        }
      }

      var visible = 0;
      cards.forEach(function (card) {
        var matched = !q || haystack(card).indexOf(q) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
        area.appendChild(card);
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (sort) {
      sort.addEventListener('change', apply);
    }
    apply();
  }

  function initSearchPage() {
    var input = document.getElementById('searchInput');
    var button = document.getElementById('searchButton');
    var results = document.getElementById('searchResults');
    var empty = document.getElementById('searchEmpty');

    if (!input || !results || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="card-cover" href="./' + movie.file + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="card-badge">' + escapeHtml(movie.year) + '</span>',
        '<span class="card-play">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
        '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-list">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        })[char];
      });
    }

    function render() {
      var q = normalize(input.value);
      var matched = window.SITE_MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 96);

      results.innerHTML = matched.map(card).join('');
      if (empty) {
        empty.classList.toggle('show', matched.length === 0);
      }
    }

    input.addEventListener('input', render);
    if (button) {
      button.addEventListener('click', render);
    }
    render();
  }

  initFilters();
  initSearchPage();
}());
