/* ===== 밤도리 PSAT 이용안내 — 공유 · 즐겨찾기 ===== */
(function () {
  "use strict";

  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove("show"), 2800);
  }

  function shareUrl() {
    return location.origin + location.pathname;
  }

  function legacyCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  async function copyLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(url); return true; } catch (e) {/* 폴백 */}
    }
    return legacyCopy(url);
  }

  function openSharePopup(url) {
    const old = document.getElementById("share-pop");
    if (old) old.remove();
    const ov = document.createElement("div");
    ov.id = "share-pop";
    ov.className = "share-pop";
    ov.innerHTML =
      '<div class="share-box" role="dialog" aria-modal="true" aria-label="링크 공유">' +
      "<h3>링크 공유</h3>" +
      "<p>아래 주소를 복사해 공유하세요.</p>" +
      '<input id="share-url" type="text" readonly>' +
      '<div class="share-actions">' +
      '<button id="share-copy" type="button" class="sp-primary">복사</button>' +
      '<button id="share-close" type="button" class="sp-ghost">닫기</button>' +
      "</div></div>";
    document.body.appendChild(ov);
    const input = ov.querySelector("#share-url");
    input.value = url;
    input.focus();
    input.select();
    const close = () => ov.remove();
    ov.querySelector("#share-copy").addEventListener("click", async () => {
      const ok = await copyLink(url);
      if (ok) { showToast("링크가 복사되었습니다."); close(); }
      else { input.focus(); input.select(); showToast("주소를 길게 눌러(또는 Ctrl+C로) 복사해 주세요."); }
    });
    ov.querySelector("#share-close").addEventListener("click", close);
    ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });
  }

  const shareBtn = document.getElementById("btn-share");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = shareUrl();
      if (navigator.share) {
        try { await navigator.share({ title: document.title, text: "밤도리 PSAT 이용안내", url }); return; }
        catch (err) { if (err && err.name === "AbortError") return; }
      }
      const ok = await copyLink(url);
      if (ok) showToast("링크가 복사되었습니다. 붙여넣어 공유해 보세요!");
      else openSharePopup(url);
    });
  }

  const bookmarkBtn = document.getElementById("btn-bookmark");
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", () => {
      const ua = navigator.userAgent || "";
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
      if (isMobile) {
        showToast("브라우저 메뉴(공유)에서 ‘즐겨찾기’ 또는 ‘홈 화면에 추가’를 선택하세요.");
      } else {
        const isMac = /Mac/i.test(navigator.platform || ua);
        showToast((isMac ? "⌘ + D" : "Ctrl + D") + " 를 눌러 즐겨찾기에 추가하세요.");
      }
    });
  }

  /* ---------- 시작점 찾기 (chooser) ---------- */
  const opts = Array.prototype.slice.call(document.querySelectorAll(".ch-opt[data-target]"));
  if (opts.length) {
    function pick(btn) {
      const target = btn.getAttribute("data-target");
      opts.forEach((o) => o.classList.toggle("active", o.getAttribute("data-target") === target));
      let shown = null;
      document.querySelectorAll(".ch-result").forEach((r) => {
        const on = r.id === target;
        r.classList.toggle("show", on);
        if (on) shown = r;
      });
      if (shown) {
        /* 열린 답변이 화면 밖에 있으면 보이는 위치까지 스크롤 (이미 다 보이면 이동 없음) */
        requestAnimationFrame(() => {
          shown.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
    }
    opts.forEach((o) => o.addEventListener("click", () => pick(o)));
  }

  /* ---------- 해시로 지정된 토글 자동 열기 ---------- */
  function openTargetDetails() {
    const h = location.hash ? location.hash.slice(1) : "";
    if (!h) return;
    const el = document.getElementById(h);
    if (el && el.tagName === "DETAILS") {
      el.open = true;
      el.scrollIntoView();
    }
  }
  window.addEventListener("hashchange", openTargetDetails);
  openTargetDetails();

  /* ---------- 맞춤 활용법 찾기 (wizard) ---------- */
  const $wizard = document.getElementById("wizard");
  if ($wizard) {
    const STEPS = [
      {
        key: "stage", q: "어떤 상황인가요?",
        opts: [
          { v: "new",  label: "이제 막 시작하려고요", jump: "R1" },
          { v: "score", label: "성적을 올려야 하는데 뭘 보면 되나요?" },
          { v: "bpc",  label: "밤프콘 활용법이 궁금해요", jump: "R_BPC" },
          { v: "blog", label: "블로그 활용법이 궁금해요", jump: "R_BLOG" }
        ]
      },
      {
        key: "gap", q: "현재 실력과 합격선의 차이는?",
        opts: [
          { v: "close", label: "별 차이 없어요", jump: "R_CLOSE" },
          { v: "far",   label: "차이가 커요" }
        ]
      },
      {
        key: "area", q: "공부해야 할 영역은?",
        opts: [
          { v: "lang", label: "언어논리" },
          { v: "data", label: "자료해석" },
          { v: "sit",  label: "상황판단" },
          { v: "all",  label: "전반적으로 다 해야 해요" }
        ]
      }
    ];

    const RESULTS = {
      R1: {
        title: "먼저 기출문제로 내 위치를 파악하세요",
        body: "무작정 강의·책을 구매하거나 구독부터 하기 전에, 기출문제를 풀어 자신의 위치를 파악해야 합니다. 아래 글을 참조해 진입점수를 측정해 보세요.",
        actions: [
          { label: "진입점수 측정 가이드", href: "https://contents.premium.naver.com/psatbamdori/psat/contents/240527210720767nt", cls: "btn", ext: true }
        ]
      },
      R_CLOSE: {
        title: "기출 풀이 + 해설 모방 리뷰 조합으로 충분합니다",
        body: "기출문제 풀이 + 해설 모방 리뷰 조합으로도 충분히 합격선에 도달할 수 있습니다. 무료로 이용 가능한 ‘블로그 해설’을 활용해 보세요. 해설을 어떻게 활용하는지는 블로그 활용법 페이지에서 확인할 수 있습니다. 독학으로 확신이 들지 않거나 좀 더 친절한 해설을 원한다면 밤프콘을 둘러보세요.",
        actions: [
          { label: "블로그 활용법", href: "blog.html", cls: "btn bdblue" },
          { label: "밤프콘 안내 및 활용법", href: "premium.html", cls: "btn ghost o-naver" }
        ]
      },
      R_BPC: {
        theme: "naver",
        title: "밤프콘, 이렇게 활용하세요",
        body: "밤프콘(네이버 프리미엄콘텐츠 ‘밤도리 PSAT’)은 문제를 처음 본 순간부터 풀이를 끝내는 시점까지의 사고 과정을 풀어낸 학습용 해설과 이론, 유형별 모음집, 질의응답을 제공하는 유료 채널입니다. 구독 추천·비추천 기준부터 콘텐츠맵, 시스템·질의응답 안내까지 활용법 페이지에 정리되어 있습니다.",
        actions: [
          { label: "밤프콘 안내 및 활용법", href: "premium.html", cls: "btn naver" },
          { label: "밤프콘 바로가기", href: "https://contents.premium.naver.com/psatbamdori/psat", cls: "btn ghost o-naver", ext: true }
        ]
      },
      R_BLOG: {
        theme: "blog",
        title: "블로그, 이렇게 활용하세요",
        body: "티스토리 블로그 ‘PSAT 푸는 밤도리’에서는 2014년 이후 5급·7급·민경채 기출 해설을 광고 없이 무료로 볼 수 있습니다. 다만 사고 과정이 다수 생략된 러프한 해설이라, 제대로 쓰는 법을 먼저 익히는 것이 중요합니다. 원하는 해설은 블로그 안에서 찾기보다, 기출 정답·해설 모음 페이지에서 문항별 링크로 찾는 것이 편합니다.",
        actions: [
          { label: "블로그 활용법", href: "blog.html", cls: "btn bdblue" },
          { label: "기출 정답·해설 모음", href: "https://bamdori-psat.github.io/psat-answer/", cls: "btn ghost", ext: true }
        ]
      },
      low_lang: {
        title: "언어논리는 밤프콘으로 잡으세요",
        body: "합격선과 차이가 큰 수준이라면 혼자 버티기보다 검증된 사고 과정을 배우는 쪽이 좋습니다. 언어논리의 논리·퀴즈, 논증·실험 유형은 밤프콘만으로 공부를 마칠 수 있습니다. 이론편, 유형별 모음집, 매일추론 순으로 이용하세요.",
        actions: [
          { label: "밤프콘 안내 및 활용법", href: "premium.html", cls: "btn naver" },
          { label: "언어논리 공부법", href: "https://contents.premium.naver.com/psatbamdori/psat/contents/241219004241675fq", cls: "btn ghost o-naver", ext: true }
        ]
      },
      low_data: {
        title: "자료해석은 강의 + 밤프콘 조합으로",
        body: "자료해석의 기본기가 전혀 잡혀 있지 않은 것 같다면 시중 자료해석 기본강의로 토대를 잡은 뒤에 밤도리 콘텐츠를 이용하시는 편을 추천합니다. 밤프콘의 연산·암산 훈련 PDF로 계산연습을 부족하지 않게 할 수 있고, 해설강의와 프리미엄 해설로 문제풀이 훈련을 병행하는 조합을 권합니다.",
        actions: [
          { label: "밤프콘 안내 및 활용법", href: "premium.html", cls: "btn naver" },
          { label: "밤프콘 콘텐츠맵", href: "premium.html#contentmap", cls: "btn ghost o-naver" }
        ]
      },
      low_sit: {
        title: "상황판단은 박문각 강의 + 밤프콘 조합으로",
        body: "합격선과 차이가 크다면 박문각에서 진행하는 밤도리 상황판단 강의로 퀴즈 유형분류와 유형별 풀이법, 필요한 배경지식을 배우는 편을 추천합니다. 밤프콘의 전체 유형별 모음집과 프리미엄 해설을 이용해 스스로 훈련하는 것도 가능합니다.",
        actions: [
          { label: "박문각 상황판단 강의", href: "https://www.pmg.co.kr/user/pno/prof16/prof_detail_v2.asp?pf=psatbamdori&ctn=37", cls: "btn", ext: true },
          { label: "밤프콘 안내 및 활용법", href: "premium.html", cls: "btn ghost o-naver" }
        ]
      },
      low_all: {
        title: "밤프콘과 시중 강의를 적절히 병행하세요",
        body: "언어논리의 논리·퀴즈, 논증·실험 유형은 밤프콘만으로 공부를 마칠 수 있습니다. 자료해석은 기본기가 잡혀 있지 않다면 시중 기본강의로 토대를 잡은 뒤, 밤프콘의 연산·암산 훈련 PDF와 해설강의·프리미엄 해설로 훈련하세요. 상황판단은 박문각에서 진행하는 밤도리 강의로 배우는 편을 추천하며, 밤프콘의 유형별 모음집과 프리미엄 해설로 스스로 훈련하는 것도 가능합니다. 공부법 글을 정독한 뒤 콘텐츠맵에서 영역별 자료를 순서대로 이용하세요.",
        actions: [
          { label: "밤프콘 콘텐츠맵", href: "premium.html#contentmap", cls: "btn naver" },
          { label: "밤프콘 안내 및 활용법", href: "premium.html", cls: "btn ghost o-naver" }
        ]
      }
    };

    let answers = {};
    let stepIdx = 0;
    const $step = document.getElementById("wz-step");
    const $result = document.getElementById("wz-result");

    function esc(t) { return t.replace(/&/g, "&amp;"); }

    function renderStep() {
      const s = STEPS[stepIdx];
      $result.className = "wz-result";
      let html = '<p class="wz-q">' + s.q + '</p><div class="wz-opts">';
      s.opts.forEach((o) => {
        html += '<button class="wz-opt" type="button" data-v="' + o.v + '"' + (o.jump ? ' data-jump="' + o.jump + '"' : "") + ">" + o.label + "</button>";
      });
      html += "</div>";
      if (stepIdx > 0) html += '<button class="wz-back" type="button" id="wz-back">← 이전으로</button>';
      $step.innerHTML = html;
      $step.style.display = "block";
      $step.querySelectorAll(".wz-opt").forEach((b) => b.addEventListener("click", () => {
        answers[s.key] = b.dataset.v;
        if (b.dataset.jump) { showResult(b.dataset.jump); return; }
        stepIdx++;
        if (stepIdx >= STEPS.length) showResult("low_" + answers.area);
        else renderStep();
      }));
      const back = document.getElementById("wz-back");
      if (back) back.addEventListener("click", () => { stepIdx--; renderStep(); });
    }

    function showResult(key) {
      const r = RESULTS[key];
      $step.style.display = "none";
      let html = '<span class="wz-r-label">추천 가이드</span>';
      html += '<p class="wz-r-title">' + r.title + "</p>";
      html += '<p class="wz-r-body">' + r.body + "</p>";
      html += '<div class="wz-actions">';
      r.actions.forEach((a) => {
        const extAttr = a.ext ? ' target="_blank" rel="noopener"' : "";
        const arrow = a.ext ? "ic-arrow-ur" : "ic-arrow-right";
        html += '<a class="' + a.cls + '" href="' + esc(a.href) + '"' + extAttr + ">" + a.label + ' <svg class="ic"><use href="#' + arrow + '"/></svg></a>';
      });
      html += "</div>";
      html += '<button class="wz-back" type="button" id="wz-restart">↻ 처음부터 다시 고르기</button>';
      $result.innerHTML = html;
      $result.className = "wz-result show" + (r.theme ? " wz-th-" + r.theme : "");
      document.getElementById("wz-restart").addEventListener("click", () => {
        answers = {}; stepIdx = 0; renderStep();
      });
    }

    renderStep();
  }
})();

/* ===== 박문각 링크 기기별 분기 — 폰에서는 모바일용 링크로 이동 ===== */
(function () {
  "use strict";
  var ua = navigator.userAgent;
  var isPhone = /iPhone|iPod|Windows Phone/i.test(ua) ||
                (/Android/i.test(ua) && /Mobile/i.test(ua));
  if (!isPhone) return;
  var MAP = {
    /* 강사홈은 기기 구분 없이 PC 링크 유지 (2026-07-29 확정) — MAP에 넣지 말 것 */
    /* PSAT패스 */
    "https://www.pmg.co.kr/user/pno/event/event_pmg_psat.asp":
      "https://m.pmg.co.kr/user/m/pno/event/event_pmg_psat.asp?SiteID=gosispa",
    /* 미리피셋 강의 */
    "https://www.pmg.co.kr/user/pno/lecture/lecture_detail.asp?OpenCrsCode=020220260726O&CrsCode=020220260631M":
      "https://m.pmg.co.kr/user/m/lecture/lecture_view.asp?OpenCrsCode=020220260726O&CrsCode=020220260631M&SiteID=gosispa"
  };
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var mob = MAP[a.getAttribute("href")];
    if (mob) a.setAttribute("href", mob);
  }, true);
})();
