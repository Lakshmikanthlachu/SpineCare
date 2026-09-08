/* ==========================================================================
   Vertebra & Vitality — main.js
   Shared behavior across all pages: theme toggle, RTL toggle, mobile nav,
   accordion, testimonial carousel, scroll reveal, forms, back-to-top.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initYear();
    initTheme();
    initDirection();
    initMobileMenu();
    initAccordion();
    initTestimonialCarousel();
    initReveal();
    initBackToTop();
    initForms();
    initBlogFilter();
  });

  /* ---------------- Footer year ---------------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------- Dark / Light mode ---------------- */
  function initTheme() {
    var root = document.documentElement;
    var stored = localStorage.getItem("vv-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && prefersDark)) {
      root.classList.add("dark");
    }
    updateThemeIcons();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        root.classList.toggle("dark");
        localStorage.setItem("vv-theme", root.classList.contains("dark") ? "dark" : "light");
        updateThemeIcons();
      });
    });
  }

  function updateThemeIcons() {
    var isDark = document.documentElement.classList.contains("dark");
    document.querySelectorAll("[data-icon='sun']").forEach(function (el) {
      el.classList.toggle("hidden", !isDark);
    });
    document.querySelectorAll("[data-icon='moon']").forEach(function (el) {
      el.classList.toggle("hidden", isDark);
    });
  }

  /* ---------------- RTL / LTR ---------------- */
  function initDirection() {
    var root = document.documentElement;
    var stored = localStorage.getItem("vv-dir");
    if (stored === "rtl") {
      root.setAttribute("dir", "rtl");
    }
    document.querySelectorAll("[data-dir-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isRtl = root.getAttribute("dir") === "rtl";
        root.setAttribute("dir", isRtl ? "ltr" : "rtl");
        localStorage.setItem("vv-dir", isRtl ? "ltr" : "rtl");
      });
    });
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileMenu() {
    var toggle = document.getElementById("nav-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", menu.classList.contains("open"));
      var iconOpen = toggle.querySelector("[data-icon='menu-open']");
      var iconClose = toggle.querySelector("[data-icon='menu-close']");
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle("hidden");
        iconClose.classList.toggle("hidden");
      }
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  function initAccordion() {
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      var trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        var wasOpen = item.classList.contains("open");
        item.parentElement.querySelectorAll(".accordion-item").forEach(function (i) {
          i.classList.remove("open");
        });
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  /* ---------------- Testimonial carousel ---------------- */
  function initTestimonialCarousel() {
    var track = document.getElementById("testimonial-track");
    if (!track) return;
    var slides = track.children.length;
    var index = 0;
    var prev = document.getElementById("testimonial-prev");
    var next = document.getElementById("testimonial-next");
    var dotsWrap = document.getElementById("testimonial-dots");

    function go(i) {
      index = (i + slides) % slides;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (dot, di) {
          dot.classList.toggle("bg-teal-600", di === index);
          dot.classList.toggle("bg-slate-300", di !== index);
        });
      }
    }

    if (dotsWrap) {
      for (var i = 0; i < slides; i++) {
        var dot = document.createElement("button");
        dot.className = "h-2.5 w-2.5 rounded-full bg-slate-300 transition-colors";
        dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
        (function (idx) {
          dot.addEventListener("click", function () { go(idx); });
        })(i);
        dotsWrap.appendChild(dot);
      }
    }

    if (next) next.addEventListener("click", function () { go(index + 1); });
    if (prev) prev.addEventListener("click", function () { go(index - 1); });

    go(0);
    setInterval(function () { go(index + 1); }, 6000);
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Back to top ---------------- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 480);
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Forms (booking / contact / login / register / newsletter) ---------------- */
  function initForms() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      var successBox = form.parentElement.querySelector("[data-form-success]");
      var isCommentForm = form.hasAttribute("data-comment-form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var valid = true;
        form.querySelectorAll("[required]").forEach(function (field) {
          var errorEl = field.parentElement.querySelector(".field-error");
          var fieldValid = field.checkValidity();
          if (!fieldValid) valid = false;
          field.classList.toggle("border-red-500", !fieldValid);
          field.classList.toggle("border-slate-300", fieldValid);
          if (errorEl) errorEl.classList.toggle("hidden", fieldValid);
        });
        if (!valid) return;

        if (isCommentForm) {
          addComment(form);
          return;
        }

        form.reset();
        form.classList.add("hidden");
        if (successBox) successBox.classList.remove("hidden");
      });
    });
  }

  /* Append a newly-submitted comment to the list instead of hiding the form */
  function addComment(form) {
    // The comment list and the "Leave a Comment" form live in separate
    // containers (the form is centered full-width, the list sits in the
    // article column), so look them up document-wide rather than scoping
    // to a shared ancestor.
    var list = document.querySelector("[data-comment-list]");
    var countEl = document.querySelector("[data-comment-count]");
    var successNote = form.querySelector("[data-comment-success]");
    var nameField = form.querySelector("#comment-name");
    var messageField = form.querySelector("#comment-message");
    var name = (nameField && nameField.value.trim()) || "Guest";
    var message = (messageField && messageField.value.trim()) || "";

    if (list) {
      var initials = name.split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join("");
      var row = document.createElement("div");
      row.className = "flex gap-4";
      row.innerHTML =
        '<span class="h-11 w-11 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 grid place-items-center font-display font-semibold shrink-0"></span>' +
        '<div><div class="flex items-center gap-3"><p class="font-semibold text-sm text-slate-900 dark:text-white"></p><p class="text-xs text-slate-500">Just now</p></div>' +
        '<p class="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"></p></div>';
      row.querySelector("span").textContent = initials;
      row.querySelectorAll("p")[0].textContent = name;
      row.querySelectorAll("p")[2].textContent = message;
      list.prepend(row);
    }
    if (countEl) countEl.textContent = String((parseInt(countEl.textContent, 10) || 0) + 1);

    form.reset();
    if (successNote) {
      successNote.classList.remove("hidden");
      window.clearTimeout(successNote._hideTimer);
      successNote._hideTimer = window.setTimeout(function () {
        successNote.classList.add("hidden");
      }, 5000);
    }
  }

  /* ---------------- Blog filter / search / pagination ---------------- */
  function initBlogFilter() {
    var search = document.getElementById("blog-search");
    var filterButtons = document.querySelectorAll("[data-blog-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-blog-card]"));
    var paginationEl = document.getElementById("blog-pagination");
    var noResultsEl = document.getElementById("blog-no-results");
    if (!cards.length) return;

    var pageSize = (paginationEl && parseInt(paginationEl.getAttribute("data-page-size"), 10)) || cards.length;
    var currentPage = 1;

    function getMatching() {
      var term = search ? search.value.trim().toLowerCase() : "";
      var activeCategory = document.querySelector("[data-blog-filter].is-active");
      var category = activeCategory ? activeCategory.getAttribute("data-blog-filter") : "all";

      return cards.filter(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardCategory = card.getAttribute("data-category");
        var matchesSearch = !term || title.indexOf(term) !== -1;
        var matchesCategory = category === "all" || category === cardCategory;
        return matchesSearch && matchesCategory;
      });
    }

    function pageButton(label, targetPage, opts) {
      opts = opts || {};
      var el = document.createElement("button");
      el.type = "button";
      el.innerHTML = label;
      var base = "h-10 min-w-[2.5rem] px-3 grid place-items-center rounded-full text-sm font-medium transition-colors ";
      if (opts.active) {
        el.className = base + "bg-teal-700 text-white";
        el.setAttribute("aria-current", "page");
      } else if (opts.disabled) {
        el.className = base + "border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed";
        el.disabled = true;
      } else {
        el.className = base + "border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-teal-700 hover:text-teal-700";
        el.addEventListener("click", function () {
          currentPage = targetPage;
          render();
          var firstCard = document.querySelector("[data-blog-card]");
          if (firstCard) firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      el.setAttribute("aria-label", opts.ariaLabel || ("Go to page " + targetPage));
      return el;
    }

    function renderPagination(totalPages) {
      if (!paginationEl) return;
      paginationEl.innerHTML = "";
      if (totalPages <= 1) return;

      paginationEl.appendChild(pageButton(
        '<i class="fa-solid fa-chevron-left rtl:rotate-180"></i>', currentPage - 1,
        { disabled: currentPage <= 1, ariaLabel: "Previous page" }
      ));
      for (var i = 1; i <= totalPages; i++) {
        paginationEl.appendChild(pageButton(String(i), i, { active: i === currentPage }));
      }
      paginationEl.appendChild(pageButton(
        '<i class="fa-solid fa-chevron-right rtl:rotate-180"></i>', currentPage + 1,
        { disabled: currentPage >= totalPages, ariaLabel: "Next page" }
      ));
    }

    function render() {
      var matching = getMatching();
      var totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      var start = (currentPage - 1) * pageSize;
      var visible = matching.slice(start, start + pageSize);

      cards.forEach(function (card) {
        card.classList.toggle("hidden", visible.indexOf(card) === -1);
      });

      if (noResultsEl) noResultsEl.classList.toggle("hidden", matching.length > 0);
      renderPagination(totalPages);
    }

    if (search) {
      search.addEventListener("input", function () {
        currentPage = 1;
        render();
      });
    }
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) {
          b.classList.remove("is-active", "bg-teal-700", "bg-teal-600", "text-white", "shadow-md", "shadow-teal-700/30");
          b.classList.add("bg-slate-100", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300");
        });
        btn.classList.add("is-active", "bg-teal-700", "text-white", "shadow-md", "shadow-teal-700/30");
        btn.classList.remove("bg-slate-100", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300");
        currentPage = 1;
        render();
      });
    });

    render();
  }
})();
