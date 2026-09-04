(function () {
    // --- yearly billing toggle ---
    var yearly = false;
    var switchEl = document.getElementById("billingSwitch");
    var lblM = document.getElementById("lblMonthly");
    var lblY = document.getElementById("lblYearly");

    function applyBilling() {
      document.querySelectorAll(".plan").forEach(function (plan) {
        var monthly = parseFloat(plan.getAttribute("data-monthly"));
        var y = parseFloat(plan.getAttribute("data-yearly"));
        var val = plan.querySelector(".price-val");
        val.textContent = "$" + Math.round(yearly ? y : monthly);
        plan.classList.toggle("yearly", yearly);
        var cta = plan.querySelector(".plan-cta");
        if (cta) {
          var url = yearly ? plan.getAttribute("data-cta-yearly") : plan.getAttribute("data-cta-monthly");
          if (url) cta.setAttribute("href", url);
        }
      });
      lblM.className = "toggle-label " + (yearly ? "off" : "on");
      lblY.className = "toggle-label " + (yearly ? "on" : "off");
      switchEl.classList.toggle("on", yearly);
      switchEl.setAttribute("aria-checked", String(yearly));
    }
    switchEl.addEventListener("click", function () {
      yearly = !yearly;
      applyBilling();
    });

    // --- before/after slider ---
    var wrap = document.getElementById("sliderWrap");
    var clip = document.getElementById("sliderClip");
    var handle = document.getElementById("handleLine");
    var range = document.getElementById("sliderRange");

    function setPos(p) {
      clip.style.clipPath = "inset(0 " + (100 - p) + "% 0 0)";
      handle.style.left = p + "%";
      range.setAttribute("aria-valuetext", "Before image revealed to " + Math.round(p) + " percent");
    }
    range.addEventListener("input", function () { setPos(parseFloat(range.value)); });
    setPos(50);

    // --- industry tabs ---
    var data = {
      contractor: { industry: "Contractor",    kw: "water damage repair", time: "1 month" },
      spa:        { industry: "Spa",           kw: "hot stone massage",   time: "4 months" },
      solar:      { industry: "Solar",         kw: "solar panel sales",   time: "1 month" },
      restaurant: { industry: "Restaurant",    kw: "french restaurant",   time: "3 months" },
      salon:      { industry: "Salon",         kw: "hair extensions",     time: "1 month" },
      agency:     { industry: "Agency",        kw: "local seo",           time: "3 months" },
      golf:       { industry: "Golf",          kw: "golf simulator",      time: "2 months" },
      laundry:    { industry: "Laundry",       kw: "wash and fold",       time: "1 month" },
      puppy:      { industry: "Puppy Trainer", kw: "puppy classes",       time: "6 months" }
    };
    var industry = document.getElementById("result-industry");
    var kw = document.getElementById("cmp-kw");
    var time = document.getElementById("cmp-time");
    var methodologyTime = document.getElementById("methodology-time");
    var resultPanel = document.getElementById("result-panel");
    var afterImg = wrap.querySelector(".slider-after");
    var beforeImg = clip.querySelector(".slider-before");

    function selectResult(btn) {
        var id = btn.getAttribute("data-id");
        document.querySelectorAll(".tabbtn").forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
          b.setAttribute("tabindex", "-1");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        btn.setAttribute("tabindex", "0");
        var d = data[id];
        industry.textContent = d.industry;
        kw.textContent = d.kw;
        time.textContent = d.time;
        methodologyTime.textContent = d.time + " apart";
        resultPanel.setAttribute("aria-labelledby", "tab-" + id);
        afterImg.src = "assets/results/" + id + "-after.webp";
        afterImg.alt = d.industry + " Google Maps geographic ranking grid for " + d.kw + " after " + d.time;
        beforeImg.src = "assets/results/" + id + "-before.webp";
        beforeImg.alt = d.industry + " Google Maps geographic ranking grid for " + d.kw + " before Nova optimization";
        range.setAttribute("aria-label", "Compare " + d.industry + " Google Maps rankings for " + d.kw + " before and after " + d.time);
        range.value = 50;
        setPos(50);
    }

    document.querySelectorAll(".tabbtn").forEach(function (btn) {
      btn.addEventListener("click", function () { selectResult(btn); });
      btn.addEventListener("keydown", function (event) {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        var buttons = Array.from(document.querySelectorAll(".tabbtn"));
        var current = buttons.indexOf(btn);
        var next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowRight" ? (current + 1) % buttons.length : (current - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
        selectResult(buttons[next]);
      });
    });

    // --- FAQ accordion ---
    document.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.parentElement;
        var wasOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach(function (el) { el.classList.remove("open"); });
        if (!wasOpen) item.classList.add("open");
      });
    });

    // --- year ---
    document.getElementById("year").textContent = new Date().getFullYear();

    // --- Command entry tracking ---
    document.querySelectorAll("[data-command-entry]").forEach(function (link) {
      link.addEventListener("click", function () {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "command_entry_click",
          placement: link.getAttribute("data-command-entry") || "unknown",
          destination: "/command/"
        });
        if (window.fbq) {
          window.fbq("trackCustom", "command_entry_click", {
            placement: link.getAttribute("data-command-entry") || "unknown"
          });
        }
      });
    });

    // --- Privacy-safe unified funnel events ---
    function analyticsValue(value) {
      return String(value || "none").replace(/[^a-zA-Z0-9._~-]/g, "_").slice(0, 80) || "none";
    }
    function analyticsContext() {
      var params = new URLSearchParams(window.location.search);
      var referrerHost = "direct";
      try { referrerHost = document.referrer ? new URL(document.referrer).hostname : "direct"; } catch (_) {}
      return {
        page_path: window.location.pathname,
        page_group: "home",
        offer_path: "nova",
        viewport: window.innerWidth < 768 ? "mobile" : "desktop",
        utm_source: analyticsValue(params.get("utm_source") || "direct"),
        utm_medium: analyticsValue(params.get("utm_medium") || "none"),
        utm_campaign: analyticsValue(params.get("utm_campaign") || "none"),
        utm_content: analyticsValue(params.get("utm_content") || "none"),
        referrer_host: analyticsValue(referrerHost)
      };
    }
    function pushUnifiedEvent(name, details) {
      var payload = Object.assign({ event: name }, analyticsContext(), details || {});
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      try { window.posthog && window.posthog.capture(name, payload); } catch (_) {}
    }
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link) return;
      var rawHref = link.getAttribute("href") || "";
      var target;
      try { target = new URL(rawHref, window.location.href); } catch (_) { return; }
      var placement = analyticsValue(link.getAttribute("data-command-entry") || link.id || link.className || link.textContent.trim());
      var destinationType = target.hostname === "link.getnoticedai.com" ? "payment" : (target.hostname === "audit.app.getnoticedai.com" || /^\/audit(\.html)?\/?$/.test(target.pathname)) ? "audit" : target.origin === window.location.origin ? "internal" : "external";
      if (link.classList.contains("plan-cta")) {
        var plan = link.closest(".plan");
        var planName = plan && plan.querySelector("h3") ? plan.querySelector("h3").textContent.trim().toLowerCase() : "unknown";
        var billing = document.getElementById("billingSwitch") && document.getElementById("billingSwitch").getAttribute("aria-checked") === "true" ? "yearly" : "monthly";
        var pricingDetails = { plan: analyticsValue(planName), billing: billing, placement: "homepage_pricing", destination_type: destinationType };
        pushUnifiedEvent("pricing_click", pricingDetails);
        pushUnifiedEvent("nova_click", pricingDetails);
        if (destinationType === "payment") pushUnifiedEvent("checkout_start", pricingDetails);
        return;
      }
      if (target.hostname === "audit.app.getnoticedai.com" || /^\/audit(\.html)?\/?$/.test(target.pathname)) {
        pushUnifiedEvent("audit_click", { placement: placement, destination_type: destinationType });
      } else if (target.pathname.indexOf("/command/") === 0) {
        if (!link.hasAttribute("data-command-entry")) pushUnifiedEvent("command_entry_click", { placement: placement, destination_type: destinationType });
      } else if (target.hash === "#pricing") {
        pushUnifiedEvent("pricing_click", { plan: "unspecified", billing: "unspecified", placement: placement, destination_type: destinationType });
        pushUnifiedEvent("nova_click", { plan: "unspecified", billing: "unspecified", placement: placement, destination_type: destinationType });
      } else if (/^\/(resources|compare|guides|industries|blog|local-seo-for-)/.test(target.pathname)) {
        pushUnifiedEvent("resource_click", { content_id: analyticsValue(target.pathname), placement: placement, destination_type: destinationType });
      }
    });
  })();