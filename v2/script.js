/* ============================================================
   RealityVizual v2 — interakce
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var czk = new Intl.NumberFormat("cs-CZ");

  /* ---------- rok v patičce ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- světlý / tmavý režim ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");

    function systemPrefersDark() { return mq.matches; }

    function currentTheme() {
      var forced = document.documentElement.getAttribute("data-theme");
      return forced || (systemPrefersDark() ? "dark" : "light");
    }

    function updateLabel() {
      var isDark = currentTheme() === "dark";
      themeBtn.setAttribute("aria-label", isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim");
    }
    updateLabel();

    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      // Pokud uživatel ručně zvolí to, co stejně preferuje systém, netřeba
      // hodnotu vnucovat — necháme na mediálním dotazu, ať i budoucí změna
      // systémového nastavení hned platí.
      if (next === (systemPrefersDark() ? "dark" : "light")) {
        document.documentElement.removeAttribute("data-theme");
        try { localStorage.removeItem("rv-theme"); } catch (e) {}
      } else {
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("rv-theme", next); } catch (e) {}
      }
      updateLabel();
    });
  }

  /* ---------- reveal při scrollu ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- nekonečná smyčka log platforem ---------- */
  var marquee = document.querySelector(".marquee");
  if (marquee && !reduceMotion) {
    var track = marquee.querySelector(".marquee-track");
    var baseSet = track.querySelector(".logos");
    var SPEED = 55; // px za sekundu — stejné tempo na mobilu i na širokém monitoru

    var syncMarquee = function () {
      var setWidth = baseSet.getBoundingClientRect().width;
      if (!setWidth) return;

      // Sad musí být tolik, aby pás pokryl dvojnásobek viditelné šířky —
      // jinak by na širokém displeji vznikla mezera, než se smyčka vrátí.
      var need = Math.max(2, Math.ceil((marquee.clientWidth * 2) / setWidth));
      var have = track.querySelectorAll(".logos").length;
      for (var i = have; i < need; i++) {
        var copy = baseSet.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.appendChild(copy);
      }

      track.style.setProperty("--sets", track.querySelectorAll(".logos").length);
      track.style.animationDuration = setWidth / SPEED + "s";
    };

    syncMarquee();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncMarquee);

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(syncMarquee, 200);
    });
  }

  /* ---------- horizontální reel s ukázkami ---------- */
  var reel = document.getElementById("reel");
  if (reel) {
    var step = function () {
      var card = reel.querySelector(".demo");
      var gap = parseFloat(getComputedStyle(reel).columnGap) || 20;
      return card ? card.getBoundingClientRect().width + gap : reel.clientWidth * 0.8;
    };
    document.querySelectorAll("[data-reel]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = btn.getAttribute("data-reel") === "next" ? 1 : -1;
        reel.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- kalkulačka úspory ---------- */
  // cena za video u nás klesá s objemem, podle balíčků v ceníku
  function rvPricePerVideo(kusu) {
    if (kusu >= 25) return 1586; // balíček 25
    if (kusu >= 10) return 1970; // balíček 10
    if (kusu >= 3) return 2200;  // balíček 3
    return 2470;                 // bez balíčku
  }

  // kameraman si účtuje víc při nízkém objemu, míň má prostor slevit ve velkém
  function kamMinPrice(kusu) {
    return kusu >= 10 ? 2000 : 2500;
  }

  var cena = document.getElementById("cena-kameraman");
  var pocet = document.getElementById("pocet");
  var outCena = document.getElementById("out-cena");
  var outPocet = document.getElementById("out-pocet");
  var outUspora = document.getElementById("out-uspora");
  var barKam = document.getElementById("bar-kam");
  var barRv = document.getElementById("bar-rv");
  var barKamVal = document.getElementById("bar-kam-val");
  var barRvVal = document.getElementById("bar-rv-val");
  var barRvRate = document.getElementById("bar-rv-rate");

  function paintRange(input) {
    var min = +input.min, max = +input.max;
    var pct = ((+input.value - min) / (max - min)) * 100;
    input.style.background =
      "linear-gradient(90deg, var(--lime) " + pct + "%, var(--secondary) " + pct + "%)";
  }

  function updateKalk() {
    if (!cena || !pocet) return;
    var kusu = +pocet.value;
    var rvRate = rvPricePerVideo(kusu);
    var minKam = kamMinPrice(kusu);

    cena.min = minKam;
    if (+cena.value < minKam) cena.value = minKam;

    var kameraman = +cena.value * kusu;
    var realityvizual = rvRate * kusu;
    var monthly = Math.max(0, kameraman - realityvizual);
    var max = Math.max(kameraman, realityvizual) || 1;

    if (outCena) outCena.textContent = czk.format(+cena.value) + " Kč";
    if (outPocet) outPocet.textContent = czk.format(kusu);
    if (outUspora) outUspora.textContent = czk.format(monthly);

    if (barKamVal) barKamVal.textContent = czk.format(kameraman) + " Kč";
    if (barRvVal) barRvVal.textContent = czk.format(realityvizual) + " Kč";
    if (barRvRate) barRvRate.textContent = czk.format(rvRate) + " Kč za video";
    if (barKam) barKam.style.width = (kameraman / max) * 100 + "%";
    if (barRv) barRv.style.width = (realityvizual / max) * 100 + "%";

    paintRange(cena);
    paintRange(pocet);
  }

  if (cena && pocet) {
    cena.addEventListener("input", updateKalk);
    pocet.addEventListener("input", updateKalk);
    updateKalk();
  }

  /* ---------- prodejní kvíz / objednávka ---------- */

  var quiz = document.getElementById("quiz");
  if (!quiz) return;

  var TOTAL = 5;                 // počet otázek (6. krok = potvrzení)
  var OBJEDNAVKY_EMAIL = "ahoj@realityvizual.cz";

  var panel = quiz.querySelector(".quiz-panel");
  var steps = quiz.querySelectorAll(".quiz-step");
  var fill = document.getElementById("quiz-fill");
  var curLabel = document.getElementById("quiz-cur");
  var backBtn = document.getElementById("quiz-back");
  var form = document.getElementById("quiz-form");
  var errBox = document.getElementById("quiz-error");
  var stepLabel = quiz.querySelector(".quiz-step-label");
  var footNote = quiz.querySelector(".quiz-foot-note");

  var answers = {};
  var current = 1;
  var lastTrigger = null;

  // doporučení balíčku podle objemu — vychází z reálného ceníku
  var TIPY = {
    "1–2 měsíčně": "Při 1–2 nemovitostech měsíčně vychází nejlépe balíček 3 videí, 2 200 Kč za video.",
    "3–5 měsíčně": "Při 3–5 nemovitostech měsíčně vychází nejlépe balíček 10 videí, 1 970 Kč za video.",
    "6–10 měsíčně": "Při 6–10 nemovitostech měsíčně vychází nejlépe balíček 25 videí, 1 586 Kč za video.",
    "Víc než 10 měsíčně": "Při vašem objemu dává smysl roční předplatné. Platíte 10 měsíců z dvanácti."
  };

  function showStep(n) {
    current = n;
    steps.forEach(function (s) {
      s.classList.toggle("is-active", +s.getAttribute("data-step") === n);
    });

    var done = n > TOTAL;
    if (fill) fill.style.width = (done ? 100 : (n / TOTAL) * 100) + "%";
    if (stepLabel) {
      if (done) {
        stepLabel.textContent = "Objednávka odeslána";
      } else {
        stepLabel.innerHTML = 'Krok <span id="quiz-cur">' + n + "</span> z " + TOTAL;
        curLabel = document.getElementById("quiz-cur");
      }
    }
    if (backBtn) backBtn.hidden = n === 1 || done;
    if (footNote) footNote.hidden = done;
    var foot = quiz.querySelector(".quiz-foot");
    if (foot) foot.hidden = done; // na potvrzení nemá patička co říct

    if (n === TOTAL) renderRecap();

    // Fokus na nadpis kroku: odečítač ho přečte, Tab pak pokračuje na volby.
    var active = quiz.querySelector('.quiz-step[data-step="' + n + '"]');
    if (active) {
      var heading = active.querySelector(".quiz-q");
      var target = heading || active.querySelector(".quiz-opt, input");
      if (heading) heading.setAttribute("tabindex", "-1");
      // Počkat na frame: při otevírání se overlay teprve zobrazuje a skrytý prvek nejde zaostřit.
      if (target) window.requestAnimationFrame(function () { target.focus({ preventScroll: true }); });
      active.scrollTop = 0;
    }
    var body = quiz.querySelector(".quiz-body");
    if (body) body.scrollTop = 0;
  }

  function renderRecap() {
    var map = { typ: "recap-typ", format: "recap-format", fotky: "recap-fotky", objem: "recap-objem" };
    Object.keys(map).forEach(function (k) {
      var el = document.getElementById(map[k]);
      if (el) el.textContent = answers[k] || "-";
    });
    var tip = document.getElementById("quiz-tip");
    if (tip) {
      var t = TIPY[answers.objem];
      tip.innerHTML = t ? "<b>Tip:</b> " + t + " Teď ale platíte jen první video za 497 Kč." : "";
      tip.hidden = !t;
    }
  }

  function setHidden(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val || "";
  }

  // Záložní cesta, když se POST nepovede — objednávka se nikdy neztratí.
  function mailtoObjednavka() {
    var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var telo =
      "Objednávka prvního videa (497 Kč)\n\n" +
      "Nemovitost: " + (answers.typ || "-") + "\n" +
      "Formát: " + (answers.format || "-") + "\n" +
      "Fotky: " + (answers.fotky || "-") + "\n" +
      "Objem: " + (answers.objem || "-") + "\n\n" +
      "Jméno: " + v("q-jmeno") + "\n" +
      "E-mail: " + v("q-email") + "\n" +
      "Telefon: " + (v("q-tel") || "neuvedeno") + "\n";
    return "mailto:" + OBJEDNAVKY_EMAIL +
      "?subject=" + encodeURIComponent("Objednávka prvního videa, " + v("q-jmeno")) +
      "&body=" + encodeURIComponent(telo);
  }

  function openQuiz(trigger) {
    lastTrigger = trigger || null;
    quiz.hidden = false;
    document.body.classList.add("quiz-open");
    showStep(1);
  }

  function closeQuiz() {
    quiz.hidden = true;
    document.body.classList.remove("quiz-open");
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  // otevření z objednávacích tlačítek (href zůstává jako fallback bez JS)
  document.querySelectorAll("[data-quiz-open]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openQuiz(btn);
    });
  });

  quiz.querySelectorAll("[data-quiz-close]").forEach(function (b) {
    b.addEventListener("click", closeQuiz);
  });

  // klik mimo panel zavírá
  quiz.addEventListener("mousedown", function (e) {
    if (e.target === quiz) closeQuiz();
  });

  // výběr odpovědi -> uložit a posunout dál
  quiz.querySelectorAll(".quiz-opt").forEach(function (opt) {
    opt.addEventListener("click", function () {
      var q = opt.getAttribute("data-q");
      answers[q] = opt.getAttribute("data-value");

      var group = opt.closest(".quiz-options");
      if (group) {
        group.querySelectorAll(".quiz-opt").forEach(function (o) { o.classList.remove("is-selected"); });
      }
      opt.classList.add("is-selected");

      window.setTimeout(function () { showStep(current + 1); }, reduceMotion ? 0 : 260);
    });
  });

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (current > 1) showStep(current - 1);
    });
  }

  // odeslání
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var jmeno = document.getElementById("q-jmeno");
      var email = document.getElementById("q-email");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      var problem = "";
      if (!jmeno.value.trim()) problem = "Doplňte prosím jméno.";
      else if (!emailOk) problem = "Zkontrolujte prosím e-mail.";

      jmeno.setAttribute("aria-invalid", !jmeno.value.trim());
      email.setAttribute("aria-invalid", !emailOk);

      if (problem) {
        errBox.textContent = problem;
        errBox.hidden = false;
        (!jmeno.value.trim() ? jmeno : email).focus();
        return;
      }
      errBox.hidden = true;

      // odpovědi z kvízu -> skrytá pole, aby je Netlify zaznamenal
      setHidden("q-typ", answers.typ);
      setHidden("q-format", answers.format);
      setHidden("q-fotky", answers.fotky);
      setHidden("q-objem", answers.objem);

      var submitBtn = form.querySelector('button[type="submit"]');
      var puvodniText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Odesílám…";

      // Netlify Forms: POST na vlastní doménu, formulář pozná podle pole form-name.
      // Lokálně (python http.server) tohle selže — proto fallback na e-mail níž.
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          showStep(TOTAL + 1);
        })
        .catch(function () {
          errBox.innerHTML =
            'Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám objednávku ' +
            '<a href="' + mailtoObjednavka() + '">pošlete e-mailem</a>.';
          errBox.hidden = false;
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = puvodniText;
        });
    });
  }

  // klávesnice: Escape zavírá, Tab drží fokus uvnitř panelu
  document.addEventListener("keydown", function (e) {
    if (quiz.hidden) return;
    if (e.key === "Escape") { closeQuiz(); return; }
    if (e.key !== "Tab") return;

    var focusables = panel.querySelectorAll(
      'button:not([hidden]), input, a[href], [tabindex]:not([tabindex="-1"])'
    );
    var list = Array.prototype.filter.call(focusables, function (el) {
      return el.offsetParent !== null;
    });
    if (!list.length) return;

    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
