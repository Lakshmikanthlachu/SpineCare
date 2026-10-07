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
    initBidi();
    initMobileMenu();
    initAccordion();
    initTestimonialCarousel();
    initReveal();
    initBackToTop();
    initForms();
    initBlogFilter();
    initPhoneGuard();
    initVideoSound();
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

  /* ---------------- Bidi safety for numbers / phones / e-mails ----------------
     In RTL mode a bare "15+", "$85" or "+1 (555) 210-7744" gets its symbols
     reordered ("+15"). Wrapping such values in <bdi> (auto-direction isolate,
     which resolves to LTR for digits and Latin text) keeps them intact. */
  function isStandalone(node) {
    var kids = node.parentNode.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k === node) continue;
      if (k.nodeType === 3 && k.nodeValue.trim()) return false;
      if (k.nodeType === 1 && k.textContent.trim()) return false;
    }
    return true;
  }

  function initBidi() {
    var NUMERIC = /^[\s\d$\u20AC\u00A3+\-\u2013\u2014.,:\/%()*#]*\d[\s\d$\u20AC\u00A3+\-\u2013\u2014.,:\/%()*#]*[a-zA-Z]{0,4}\+?$/;
    var EMAIL = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;
    // Pass 1 — compound values split across inline children, e.g. 4.9<span>/5</span>
    document.querySelectorAll("p,div,span,strong,b,dd,dt,li").forEach(function (el) {
      if (!el.children.length || el.children.length > 3 || el.closest("bdi")) return;
      var t = el.textContent.trim();
      if (t.length > 40 || !NUMERIC.test(t)) return;
      for (var i = 0; i < el.children.length; i++) {
        if (el.children[i].children.length || /^(I|A|SVG|IMG|BUTTON|INPUT)$/.test(el.children[i].nodeName)) return;
      }
      var bdi = document.createElement("bdi");
      while (el.firstChild) bdi.appendChild(el.firstChild);
      el.appendChild(bdi);
    });

    // Pass 2 — individual text nodes
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentNode;
        if (!parent || /^(SCRIPT|STYLE|TEXTAREA|OPTION|BDI|NOSCRIPT)$/.test(parent.nodeName) || parent.closest("bdi")) return NodeFilter.FILTER_REJECT;
        var t = node.nodeValue.trim();
        if (!t || t.length > 400) return NodeFilter.FILTER_REJECT;
        if (t.length <= 40 && (NUMERIC.test(t) || EMAIL.test(t))) return NodeFilter.FILTER_ACCEPT;
        if (!/[A-Za-z]{2}/.test(t)) return NodeFilter.FILTER_REJECT;
        // Only isolate text that stands alone in its element (optionally next to
        // icons). Text that is one piece of a longer inline sentence must keep
        // flowing with its neighbours or the phrases would swap sides.
        if (!isStandalone(node)) return NodeFilter.FILTER_REJECT;
        // English text that opens or closes with punctuation/digits/symbols
        // ("What should I bring?", "4.9/5 (612 reviews)", \u201CQuoted\u201D, "\u00A9 2026 ...")
        // — isolate it so the marks stay on the correct side in RTL.
        if (/^[^A-Za-z]/.test(t) || /[^A-Za-z0-9\s]$/.test(t)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    });
    var targets = [];
    while (walker.nextNode()) targets.push(walker.currentNode);
    targets.forEach(function (node) {
      // Keep surrounding whitespace outside the isolate so word spacing survives
      var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(node.nodeValue);
      var parent = node.parentNode;
      var bdi = document.createElement("bdi");
      node.nodeValue = m[2];
      parent.insertBefore(bdi, node);
      bdi.appendChild(node);
      if (m[1]) parent.insertBefore(document.createTextNode(m[1]), bdi);
      if (m[3]) parent.insertBefore(document.createTextNode(m[3]), bdi.nextSibling);
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
      // In RTL the first slide sits on the right, so the track must slide the
      // opposite way to reveal the next one.
      var dirSign = document.documentElement.getAttribute("dir") === "rtl" ? 1 : -1;
      track.style.transform = "translateX(" + (dirSign * index * 100) + "%)";
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
    // Re-position when the visitor flips LTR/RTL
    new MutationObserver(function () { go(index); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
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
  var NAME_RE = /^[\p{L}\p{M}]+(?:[ '’.\-][\p{L}\p{M}]+)*\.?$/u;
  var EMAIL_RE = /^[A-Za-z0-9._%+\-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

  var validators = {
    name: function (v) {
      if (/\d/.test(v)) return "Names cannot contain numbers.";
      if (v.replace(/[^\p{L}]/gu, "").length < 2) return "Please enter at least 2 letters.";
      if (v.length > 50) return "Please keep this under 50 characters.";
      if (!NAME_RE.test(v)) return "Use letters, spaces, hyphens or apostrophes only.";
      return "";
    },
    email: function (v) {
      if (v.length > 254 || v.indexOf("..") !== -1 || !EMAIL_RE.test(v) || /^\.|\.@/.test(v)) {
        return "Please enter a valid email address, e.g. name@example.com.";
      }
      return "";
    },
    phone: function (v) {
      if (!/^\+?[0-9\s().\-]+$/.test(v)) return "Phone numbers can only contain digits, spaces, + ( ) and -.";
      var opens = (v.match(/\(/g) || []).length;
      var closes = (v.match(/\)/g) || []).length;
      if (opens !== closes || opens > 1) return "Please check the brackets in the phone number.";
      var digits = v.replace(/\D/g, "");
      if (v.charAt(0) === "+") {
        if (digits.length < 8 || digits.length > 15 || digits.charAt(0) === "0") {
          return "Enter a valid international number, e.g. +1 555 210 7744.";
        }
        return /^(\d)\1+$/.test(digits) ? "Please enter a real phone number." : "";
      }
      if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
      if (digits.length !== 10) return "Phone number must be 10 digits, e.g. (555) 210-7744.";
      if (/^[01]/.test(digits) || /^[01]/.test(digits.slice(3))) return "That doesn't look like a valid phone number.";
      if (/^(\d)\1+$/.test(digits)) return "Please enter a real phone number.";
      return "";
    },
    password: function (v) {
      if (v.length < 8) return "Password must be at least 8 characters.";
      if (!/[a-z]/.test(v) || !/[A-Z]/.test(v)) return "Include both uppercase and lowercase letters.";
      if (!/\d/.test(v)) return "Include at least one number.";
      if (!/[^A-Za-z0-9\s]/.test(v)) return "Include at least one symbol, e.g. ! @ # $.";
      if (/\s/.test(v)) return "Password cannot contain spaces.";
      return "";
    }
  };

  function fieldType(field) {
    var t = field.getAttribute("data-v");
    if (t) return t;
    if (field.type === "email") return "email";
    if (field.type === "tel") return "phone";
    return "";
  }

  /* Returns "" when the field is fine, otherwise the message to show. */
  function fieldMessage(field, form) {
    if (field.type === "checkbox") {
      if (!field.required) return "";
      return field.checked ? "" : (field.getAttribute("data-msg-required") || "Please tick this box to continue.");
    }
    var raw = field.value;
    var value = field.type === "password" ? raw : raw.trim();
    var requiredMsg = field.getAttribute("data-msg-required") || field._defaultMsg || "This field is required.";
    if (!value) return field.required ? requiredMsg : "";

    var type = fieldType(field);
    if (type && validators[type]) {
      var msg = validators[type](value);
      if (msg) return msg;
    }
    var matchSel = field.getAttribute("data-match");
    if (matchSel) {
      var other = form.querySelector(matchSel);
      if (other && other.value !== raw) return "Passwords do not match.";
    }
    if (field.validity && field.validity.rangeUnderflow) return "Please choose today or a later date.";
    if (!type && !field.checkValidity()) return field._defaultMsg || requiredMsg;
    return "";
  }

  function errorElFor(field) {
    if (field._errorEl) return field._errorEl;
    var host = field.parentElement;
    var el = host.querySelector(".field-error");
    if (!el && field.type === "checkbox") {
      var next = host.nextElementSibling;
      if (next && next.classList.contains("field-error")) el = next;
    }
    if (!el) {
      el = document.createElement("p");
      el.className = "field-error hidden text-xs text-red-500 mt-1";
      var form = field.form;
      if (host === form) form.insertAdjacentElement("afterend", el);
      else host.appendChild(el);
    }
    if (!el.id) el.id = "err-" + (field.id || field.name || Math.random().toString(36).slice(2, 8));
    field._errorEl = el;
    field._defaultMsg = el.textContent.trim();
    field.setAttribute("aria-describedby", el.id);
    return el;
  }

  function showFieldState(field, message) {
    var el = errorElFor(field);
    var bad = !!message;
    if (bad) el.textContent = message;
    el.classList.toggle("hidden", !bad);
    field.setAttribute("aria-invalid", bad ? "true" : "false");
    if (field.type !== "checkbox") {
      field.classList.toggle("border-red-500", bad);
      field.classList.toggle("border-slate-300", !bad);
    }
  }

  function initForms() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      var successBox = form.parentElement.querySelector("[data-form-success]");
      var isCommentForm = form.hasAttribute("data-comment-form");
      var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea")).filter(function (f) {
        return f.type !== "hidden" && f.type !== "submit" && f.type !== "button";
      });

      fields.forEach(function (field) {
        errorElFor(field); // capture default message + wire aria
        if (field.type === "date") {
          var d = new Date();
          var pad = function (n) { return (n < 10 ? "0" : "") + n; };
          field.min = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
        }
        var check = function () { showFieldState(field, fieldMessage(field, form)); };
        // Validate when leaving a field, then keep it live while the user corrects it.
        field.addEventListener("blur", function () {
          if (field.type !== "password" && field.type !== "checkbox" && field.tagName !== "SELECT") {
            var tidy = field.value.replace(/\s+/g, " ").trim();
            if (tidy !== field.value && field.type !== "date") field.value = tidy;
          }
          field._touched = true;
          check();
        });
        var live = function () {
          if (field._touched || (field._errorEl && !field._errorEl.classList.contains("hidden"))) check();
          var mirror = form.querySelector('[data-match="#' + field.id + '"]');
          if (mirror && mirror.value) showFieldState(mirror, fieldMessage(mirror, form));
        };
        field.addEventListener("input", live);
        field.addEventListener("change", live);
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var firstBad = null;
        fields.forEach(function (field) {
          var msg = fieldMessage(field, form);
          field._touched = true;
          showFieldState(field, msg);
          if (msg && !firstBad) firstBad = field;
        });
        if (firstBad) {
          try { firstBad.focus(); } catch (err) { /* ignore */ }
          return;
        }

        if (isCommentForm) {
          addComment(form);
          return;
        }

        form.reset();
        fields.forEach(function (f) { f._touched = false; showFieldState(f, ""); f.removeAttribute("aria-invalid"); });
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

  /* ---------------- Input guards: stop invalid characters at the keyboard ---------------- */
  /* Phone fields accept digits, one leading "+", spaces, ( ) - and . only;
     name fields (data-v="name") reject digits and symbols. Typing or pasting
     a blocked character is dropped and a short inline hint explains why. */
  function initPhoneGuard() {
    var navKeys = ["Backspace", "Delete", "Tab", "Enter", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];

    function flash(field, message) {
      var el = errorElFor(field);
      el.textContent = message;
      el.classList.remove("hidden");
      field.classList.add("border-red-500");
      field.classList.remove("border-slate-300");
      window.clearTimeout(field._flashTimer);
      field._flashTimer = window.setTimeout(function () {
        var msg = fieldMessage(field, field.form);
        if (field._touched || msg) showFieldState(field, field._touched ? msg : "");
        else showFieldState(field, "");
      }, 1800);
    }

    function cleanPhone(text) {
      var out = text.replace(/[^0-9+()\-\s.]/g, "");
      // "+" is only valid as the first character
      return out.charAt(0) === "+" ? "+" + out.slice(1).replace(/\+/g, "") : out.replace(/\+/g, "");
    }
    function cleanName(text) {
      return text.replace(/[^\p{L}\p{M}\s'’.\-]/gu, "");
    }

    function attach(field, cleaner, keyRe, hint) {
      field.addEventListener("keydown", function (e) {
        if (navKeys.indexOf(e.key) !== -1 || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
        if (!keyRe.test(e.key)) { e.preventDefault(); flash(field, hint); }
      });
      field.addEventListener("input", function () {
        var cleaned = cleaner(field.value);
        if (cleaned !== field.value) { field.value = cleaned; flash(field, hint); }
      });
      field.addEventListener("paste", function (e) {
        var data = (e.clipboardData || window.clipboardData);
        if (!data) return;
        e.preventDefault();
        var text = cleaner(data.getData("text"));
        var start = field.selectionStart == null ? field.value.length : field.selectionStart;
        var end = field.selectionEnd == null ? field.value.length : field.selectionEnd;
        field.value = cleaner(field.value.slice(0, start) + text + field.value.slice(end)).slice(0, field.maxLength > 0 ? field.maxLength : undefined);
        field.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }

    document.querySelectorAll("[data-phone-guard]").forEach(function (field) {
      attach(field, cleanPhone, /^[0-9+()\-\s.]$/, "Only digits, + ( ) and - are allowed here.");
    });
    document.querySelectorAll('[data-v="name"]').forEach(function (field) {
      attach(field, cleanName, /^[\p{L}\p{M}\s'’.\-]$/u, "Numbers and symbols are not allowed in names.");
    });
  }

  /* ---------------- Autoplaying video testimonial + mute toggle ---------------- */
  function initVideoSound() {
    document.querySelectorAll("[data-video-wrap]").forEach(function (wrap) {
      var video = wrap.querySelector("[data-testimonial-video]");
      var muteBtn = wrap.querySelector("[data-video-mute]");
      if (!video) return;

      // Autoplay (muted) is attempted via the `autoplay` attribute; some
      // browsers still need an explicit play() call, and if autoplay is
      // blocked entirely we fall back to native controls so the visitor
      // can start playback themselves.
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          video.setAttribute("controls", "");
        });
      }

      if (!muteBtn) return;
      function updateIcon() {
        var mutedIcon = muteBtn.querySelector('[data-icon="muted"]');
        var unmutedIcon = muteBtn.querySelector('[data-icon="unmuted"]');
        if (mutedIcon) mutedIcon.classList.toggle("hidden", !video.muted);
        if (unmutedIcon) unmutedIcon.classList.toggle("hidden", video.muted);
        muteBtn.setAttribute("aria-pressed", String(!video.muted));
        muteBtn.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
      }
      muteBtn.addEventListener("click", function () {
        video.muted = !video.muted;
        if (!video.muted) {
          video.play().catch(function () {});
        }
        updateIcon();
      });
      updateIcon();
    });
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
