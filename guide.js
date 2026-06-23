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
  const opts = Array.prototype.slice.call(document.querySelectorAll(".ch-opt"));
  if (opts.length) {
    function pick(btn) {
      const target = btn.getAttribute("data-target");
      opts.forEach((o) => o.classList.toggle("active", o === btn));
      document.querySelectorAll(".ch-result").forEach((r) => {
        r.classList.toggle("show", r.id === target);
      });
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
})();
