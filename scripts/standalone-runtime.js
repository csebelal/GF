/*
 * Runtime for the single-file offline preview (dist/afrin-portfolio-preview.html).
 * Plain JavaScript, no dependencies. It replaces Next.js routing and the React
 * interactions with small equivalents:
 * hash routing, the mobile menu, click-to-load YouTube, portfolio filters,
 * table-of-contents tracking, reading progress, copy buttons, reveals and image previews.
 */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var routes = {};
  document.querySelectorAll("template[data-route]").forEach(function (t) {
    routes[t.getAttribute("data-route")] = t;
  });

  // ---------------------------------------------------------------- assets
  // Every image, the CV and attachments are stored once as base64 and turned
  // into blob URLs, so repeated references across pages cost nothing extra.
  var assetData = JSON.parse(document.getElementById("asset-data").textContent);
  var assetUrls = {};
  Object.keys(assetData).forEach(function (path) {
    var entry = assetData[path];
    var bin = atob(entry.data);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    assetUrls[path] = URL.createObjectURL(new Blob([bytes], { type: entry.type }));
  });
  function resolveAsset(value) {
    return value.replace(/asset:(\/[^\s",]+)/g, function (_, path) {
      return assetUrls[path] || path;
    });
  }
  function hydrateAssets(root) {
    root.querySelectorAll("[src^='asset:'],[href^='asset:'],[srcset*='asset:']").forEach(function (el) {
      ["src", "href", "srcset"].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v && v.indexOf("asset:") !== -1) el.setAttribute(attr, resolveAsset(v));
      });
    });
  }

  var projects = JSON.parse(document.getElementById("project-data").textContent);
  var projectBySlug = {};
  projects.forEach(function (p) { projectBySlug[p.slug] = p; });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) document.documentElement.classList.add("reveal-on");

  // ---------------------------------------------------------------- routing
  function parseHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (h.charAt(0) !== "/") return null;
    var frag = "";
    var at = h.indexOf("@");
    if (at !== -1) { frag = h.slice(at + 1); h = h.slice(0, at); }
    var query = "";
    var q = h.indexOf("?");
    if (q !== -1) { query = h.slice(q + 1); h = h.slice(0, q); }
    var path = h.length > 1 ? h.replace(/\/$/, "") : "/";
    return { path: path, query: query, frag: frag };
  }

  var cleanups = [];
  var currentPath = null;

  function render(route, isNavigation) {
    cleanups.forEach(function (fn) { fn(); });
    cleanups = [];
    var tpl = routes[route.path] || routes["404"];
    app.replaceChildren(tpl.content.cloneNode(true));
    hydrateAssets(app);
    document.title = tpl.getAttribute("data-title");
    currentPath = route.path;

    initHeader();
    initReveal();
    initVideos();
    initImages();
    if (route.path === "/portfolio") initFilters(route.query);
    initToc();
    initProgress();

    if (route.frag) {
      var target = document.getElementById(route.frag);
      if (target) { target.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
    if (isNavigation) {
      var h1 = app.querySelector("main h1");
      if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    }
  }

  window.addEventListener("hashchange", function () {
    var route = parseHash();
    if (!route) return;
    if (route.path === currentPath && route.frag && !route.query) {
      var el = document.getElementById(route.frag);
      if (el) { el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); return; }
    }
    render(route, true);
  });

  // In-page anchors (#section) scroll within the current page instead of routing.
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href^='#']");
    if (!link) return;
    var href = link.getAttribute("href");
    if (href.charAt(1) === "/") return;
    var id = decodeURIComponent(href.slice(1));
    var target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    if (id === "main") { target.focus({ preventScroll: true }); return; }
    history.replaceState(null, "", "#" + currentPath + "@" + id);
    var details = link.closest("details");
    if (details) details.open = false;
  });

  // ---------------------------------------------------------------- header
  var MENU_ICON = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-[1.4rem]"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';
  var CLOSE_ICON = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-[1.4rem]"><path d="M6 6l12 12M18 6 6 18"></path></svg>';

  function initHeader() {
    var bar = app.querySelector("header > div");
    var button = app.querySelector("[aria-controls='mobile-menu']");
    var panel = app.querySelector("#mobile-menu");
    function onScroll() {
      if (!bar) return;
      var scrolled = window.scrollY > 8 || (panel && !panel.hidden);
      bar.classList.toggle("border-line", scrolled);
      bar.classList.toggle("shadow-float", scrolled);
      bar.classList.toggle("border-line/70", !scrolled);
      bar.classList.toggle("shadow-none", !scrolled);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(function () { window.removeEventListener("scroll", onScroll); });
    onScroll();
    if (!button || !panel) return;

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      button.innerHTML = open ? CLOSE_ICON : MENU_ICON;
      onScroll();
      if (open) { var first = panel.querySelector("a, button"); if (first) first.focus(); }
      else if (returnFocus) button.focus();
    }
    button.addEventListener("click", function () { setOpen(panel.hidden, false); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a[href^='#/']")) setOpen(false, false); });
    function onKey(e) {
      if (panel.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); setOpen(false, true); return; }
      if (e.key !== "Tab") return;
      var items = [button].concat(Array.prototype.slice.call(panel.querySelectorAll("a, button")));
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    cleanups.push(function () { document.removeEventListener("keydown", onKey); });
  }

  // ---------------------------------------------------------------- reveal
  function initReveal() {
    if (!document.documentElement.classList.contains("reveal-on")) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    app.querySelectorAll("[data-reveal]").forEach(function (el) { observer.observe(el); });
    cleanups.push(function () { observer.disconnect(); });
  }

  // ---------------------------------------------------------------- video
  function generatedPoster(title) {
    var span = document.createElement("span");
    span.className = "absolute inset-0 flex flex-col justify-between bg-[linear-gradient(135deg,#0e5f5b_0%,#0a4744_55%,#191c20_100%)] p-6 text-white";
    span.innerHTML = '<span class="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Video walkthrough</span><span class="max-w-md text-2xl font-semibold leading-tight tracking-tight"></span>';
    span.lastChild.textContent = title;
    return span;
  }

  function videoInfo(button) {
    var wrapper = button.parentElement.parentElement;
    var watch = wrapper.querySelector("a[href*='youtube.com/watch']");
    if (!watch) return null;
    var url = new URL(watch.href);
    var id = url.searchParams.get("v");
    if (!/^[A-Za-z0-9_-]{11}$/.test(id || "")) return null;
    return {
      id: id,
      start: parseInt((url.searchParams.get("t") || "0").replace("s", ""), 10) || 0,
      captions: /Captions on by default/.test(wrapper.textContent),
      wrapper: wrapper,
    };
  }

  function initVideos() {
    app.querySelectorAll("button[aria-label^='Play video:']").forEach(function (button) {
      var info = videoInfo(button);
      var img = button.querySelector("img");
      var title = button.getAttribute("aria-label").replace(/^Play video:\s*/, "");
      if (img && info) {
        var thumb = "https://i.ytimg.com/vi/" + info.id + "/hqdefault.jpg";
        var fail = function () {
          if (img.src.indexOf("i.ytimg.com") === -1) { img.src = thumb; return; }
          img.replaceWith(generatedPoster(title));
        };
        img.addEventListener("error", fail);
        img.addEventListener("load", function () {
          if (img.src.indexOf("i.ytimg.com") !== -1 && img.naturalWidth <= 120) img.replaceWith(generatedPoster(title));
        });
      }
      button.addEventListener("click", function () {
        if (!info) return;
        var params = new URLSearchParams({ rel: "0", playsinline: "1", autoplay: "1" });
        if (info.start) params.set("start", String(info.start));
        if (info.captions) params.set("cc_load_policy", "1");
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + info.id + "?" + params.toString();
        iframe.title = title + " (YouTube video player)";
        iframe.className = "absolute inset-0 size-full";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        button.replaceWith(iframe);
        iframe.focus();
        info.wrapper.querySelectorAll("span").forEach(function (s) {
          if (/Privacy-enhanced embed/.test(s.textContent)) s.remove();
        });
      });
    });
  }

  // ---------------------------------------------------------------- images
  var lightbox;
  function openLightbox(src, alt, opener) {
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("aria-label", "Image preview");
      lightbox.className = "standalone-lightbox";
      lightbox.innerHTML = '<button type="button" class="btn btn-secondary btn-sm">Close</button><img alt="">';
      document.body.appendChild(lightbox);
      lightbox.addEventListener("click", function (e) { if (e.target === lightbox || e.target.tagName === "BUTTON") closeLightbox(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox(); });
    }
    lightbox._opener = opener;
    var img = lightbox.querySelector("img");
    img.src = src;
    img.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.querySelector("button").focus();
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    if (lightbox._opener) lightbox._opener.focus();
  }

  function initImages() {
    // Full-size image links open an in-page preview (browsers block opening blob/data URLs in new tabs).
    app.querySelectorAll("a[href^='blob:']").forEach(function (link) {
      var img = link.querySelector("img");
      if (!img) return;
      link.removeAttribute("target");
      link.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(link.href, img.alt, link);
      });
    });
    // Remote card thumbnails: hide gracefully when offline.
    app.querySelectorAll("article img[src*='i.ytimg.com']").forEach(function (img) {
      img.addEventListener("error", function () { img.remove(); });
    });
  }

  // ---------------------------------------------------------------- filters
  var CONTENT_TYPES = ["video+documentation", "video", "documentation"];
  var ACTIVE_BTN = "border-ink bg-ink text-white";
  var IDLE_BTN = "border-line bg-surface text-body hover:border-line-strong hover:text-ink";

  function initFilters(query) {
    var input = app.querySelector("input[type='search']");
    var status = app.querySelector("p[role='status']");
    if (!input || !status) return;
    var params = new URLSearchParams(query);
    var state = {
      q: params.get("q") || "",
      category: params.get("category") || "",
      type: params.get("type") || "",
    };
    var typeGroup = app.querySelector("[role='group'][aria-label='Content type']");
    var categoryGroup = app.querySelector("[role='group'][aria-label='Category']");
    var cards = Array.prototype.slice.call(app.querySelectorAll("section[aria-labelledby] article")).map(function (article) {
      var link = article.querySelector("a[href^='#/portfolio/']");
      var slug = link ? link.getAttribute("href").replace("#/portfolio/", "") : "";
      return { el: article.closest("li") || article, project: projectBySlug[slug] };
    }).filter(function (c) { return c.project; });
    var total = cards.length;
    var statusRow = status.parentElement;
    var reset, empty, clear;

    function matches(p, s) {
      var terms = s.q.toLowerCase().split(/\s+/).filter(Boolean);
      var hay = [p.title, p.summary, p.category].concat(p.tools).join(" ").toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; }) &&
        (!s.category || p.category === s.category) &&
        (!s.type || p.contentType === s.type);
    }
    function count(patch) {
      var s = Object.assign({}, state, patch);
      return cards.filter(function (c) { return matches(c.project, s); }).length;
    }
    function buttonValue(button, group) {
      var label = button.firstChild ? button.firstChild.textContent.trim() : button.textContent.trim();
      if (group === "type") {
        if (label === "Any format") return "";
        return { "Video + Documentation": "video+documentation", "Video": "video", "Documentation": "documentation" }[label] || "";
      }
      return label === "All categories" ? "" : label;
    }
    function styleButton(button, active) {
      button.setAttribute("aria-pressed", String(active));
      (active ? IDLE_BTN : ACTIVE_BTN).split(" ").forEach(function (c) { button.classList.remove(c); });
      (active ? ACTIVE_BTN : IDLE_BTN).split(" ").forEach(function (c) { button.classList.add(c); });
      var n = button.querySelector(".tabular-nums");
      if (n) { n.classList.toggle("text-white/75", active); n.classList.toggle("text-muted", !active); }
    }

    function update(patch) {
      Object.assign(state, patch || {});
      var filtered = Boolean(state.q || state.category || state.type);
      var visible = 0;
      cards.forEach(function (c) {
        var show = matches(c.project, state);
        c.el.hidden = !show;
        if (show) visible++;
      });
      app.querySelectorAll("section[aria-labelledby='featured-heading'], section[aria-labelledby='all-heading']").forEach(function (section) {
        section.hidden = !Array.prototype.some.call(section.querySelectorAll("article"), function (a) {
          return !(a.closest("li") || a).hidden;
        });
      });
      [[typeGroup, "type"], [categoryGroup, "category"]].forEach(function (pair) {
        if (!pair[0]) return;
        pair[0].querySelectorAll("button[aria-pressed]").forEach(function (b) {
          var value = buttonValue(b, pair[1]);
          styleButton(b, state[pair[1]] === value);
          var n = b.querySelector(".tabular-nums");
          if (n) { var patchCount = {}; patchCount[pair[1]] = value; n.textContent = String(count(patchCount)); }
        });
      });
      status.innerHTML = '<span class="font-semibold text-ink">' + visible + "</span> of " + total + " projects" + (filtered ? " match your filters" : "");

      if (filtered && !reset) {
        reset = document.createElement("button");
        reset.type = "button";
        reset.className = "link-arrow min-h-10 text-sm";
        reset.textContent = "Reset filters";
        reset.addEventListener("click", function () { input.value = ""; update({ q: "", category: "", type: "" }); });
        statusRow.appendChild(reset);
      } else if (!filtered && reset) { reset.remove(); reset = null; }

      if (visible === 0 && !empty) {
        empty = document.createElement("div");
        empty.className = "mt-6 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-6 py-16 text-center";
        empty.innerHTML = '<h2 class="text-lg font-semibold">No projects match those filters</h2><p class="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-body">Try a broader search term, such as a tool name like “Flow” or “HubSpot”, or clear the filters to see every project.</p><button type="button" class="btn btn-primary mt-6">Show all projects</button>';
        empty.querySelector("button").addEventListener("click", function () { input.value = ""; update({ q: "", category: "", type: "" }); });
        statusRow.after(empty);
      } else if (visible > 0 && empty) { empty.remove(); empty = null; }

      if (state.q && !clear) {
        clear = document.createElement("button");
        clear.type = "button";
        clear.setAttribute("aria-label", "Clear search");
        clear.className = "absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-tint hover:text-ink";
        clear.innerHTML = CLOSE_ICON.replace('class="text-[1.4rem]"', "");
        clear.addEventListener("click", function () { input.value = ""; update({ q: "" }); input.focus(); });
        input.parentElement.appendChild(clear);
      } else if (!state.q && clear) { clear.remove(); clear = null; }

      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.category) p.set("category", state.category);
      if (state.type) p.set("type", state.type);
      var qs = p.toString();
      history.replaceState(null, "", "#/portfolio" + (qs ? "?" + qs : ""));
    }

    input.value = state.q;
    input.addEventListener("input", function () { update({ q: input.value }); });
    if (typeGroup) typeGroup.addEventListener("click", function (e) {
      var b = e.target.closest("button[aria-pressed]");
      if (!b) return;
      var v = buttonValue(b, "type");
      update({ type: state.type === v ? "" : v });
    });
    if (categoryGroup) categoryGroup.addEventListener("click", function (e) {
      var b = e.target.closest("button[aria-pressed]");
      if (!b) return;
      var v = buttonValue(b, "category");
      update({ category: state.category === v ? "" : v });
    });
    if (state.q || state.category || state.type) update();
  }

  // ---------------------------------------------------------------- docs
  function initToc() {
    var navs = app.querySelectorAll("nav[aria-label='On this page']");
    if (!navs.length) return;
    var links = Array.prototype.slice.call(navs[navs.length - 1].querySelectorAll("a[href^='#']"));
    var ids = links.map(function (a) { return decodeURIComponent(a.getAttribute("href").slice(1)); });
    var frame = 0;
    function update() {
      frame = 0;
      var current = ids[0];
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (!el) continue;
        if (el.getBoundingClientRect().top - 150 <= 0) current = ids[i]; else break;
      }
      navs.forEach(function (nav) {
        nav.querySelectorAll("a[href^='#']").forEach(function (a) {
          var active = decodeURIComponent(a.getAttribute("href").slice(1)) === current;
          if (active) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
          a.classList.toggle("border-accent", active);
          a.classList.toggle("text-ink", active);
          a.classList.toggle("border-transparent", !active);
          a.classList.toggle("text-muted", !active);
        });
      });
    }
    function onScroll() { if (!frame) frame = requestAnimationFrame(update); }
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(function () { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); });
    update();
  }

  function initProgress() {
    var bar = app.querySelector(".fixed.inset-x-0.top-0 > div");
    var body = document.getElementById("project-body");
    if (!bar || !body) return;
    var frame = 0;
    function update() {
      frame = 0;
      var rect = body.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.6;
      var read = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), Math.max(total, 1));
      bar.style.transform = "scaleX(" + (total > 0 ? read / total : 0) + ")";
    }
    function onScroll() { if (!frame) frame = requestAnimationFrame(update); }
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(function () { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); });
    update();
  }

  // ---------------------------------------------------------------- copy
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = document.execCommand("copy");
    ta.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
  }
  document.addEventListener("click", function (e) {
    var button = e.target.closest && e.target.closest("button");
    if (!button) return;
    var label = button.textContent.trim();
    var text = null, done = "Copied";
    if (/^Copy code$/.test(label)) {
      var pre = button.closest("div.overflow-hidden").querySelector("pre");
      text = pre ? pre.textContent : null;
    } else if (/^Copy address$/.test(label)) {
      var card = button.closest(".card");
      var email = card && card.querySelector("p.break-all");
      text = email ? email.textContent.trim() : null;
    }
    if (text === null) return;
    var labelNode = Array.prototype.slice.call(button.childNodes).filter(function (n) { return n.nodeType === 3 && n.textContent.trim(); })[0];
    copyText(text).then(function () {
      if (labelNode) { var before = labelNode.textContent; labelNode.textContent = done; setTimeout(function () { labelNode.textContent = before; }, 2000); }
    }, function () {
      if (labelNode) { var before = labelNode.textContent; labelNode.textContent = "Copy failed"; setTimeout(function () { labelNode.textContent = before; }, 2000); }
    });
  });

  // ---------------------------------------------------------------- start
  var initial = parseHash();
  if (!initial) {
    initial = { path: "/", query: "", frag: "" };
    history.replaceState(null, "", "#/");
  }
  render(initial, false);
})();
