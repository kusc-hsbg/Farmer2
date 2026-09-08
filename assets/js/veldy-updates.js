/*
 * veldy-updates.js — local (non-Framer) client-requested revisions
 *
 * 수정1: the footer end section ("Where clean aesthetics ..." + BACK TO TOP)
 *        gets a second pill button, CONTACT, identical in style to BACK TO TOP,
 *        placed directly below it. It is built by cloning the live BACK TO TOP
 *        element (so typography/border/roundness always match) and opens the
 *        shared PROJECT INQUIRY form (veldy-inquiry.js) when available,
 *        otherwise it navigates to the contact page.
 *
 * 수정2: the HELP CENTER / FAQ section gets a bold, large "구독 서비스" title
 *        in the empty band above the first question ("01 VELDY 구독 서비스는
 *        어떤 방식으로 운영되나요?").
 *
 * Both are absolutely-positioned overlays appended to <body> (outside Framer's
 * DOM, so hydration/responsive re-renders can never delete them) and re-anchored
 * whenever the page re-lays out — the same pattern veldy-contact.js uses.
 */
(function () {
  function visible(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }

  // contact page URL that works from both the site root and /work, /article
  function contactUrl() {
    var s = document.querySelector('script[src*="veldy-updates.js"]');
    if (s && s.src) return s.src.replace(/assets\/js\/veldy-updates\.js.*$/, 'contact.html');
    return 'contact.html';
  }

  function openContact(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.VeldyInquiry && window.VeldyInquiry.open) window.VeldyInquiry.open();
    else window.location.href = contactUrl();
  }

  /* ---------- 수정1 · footer CONTACT button (clone of BACK TO TOP) ---------- */

  // The footer button label is rendered as per-letter rolling-text spans, so we
  // match on the joined letters rather than textContent.
  function rollingLabel(a) {
    var p = a.querySelector('p[class*="rolling-text-inner"]');
    if (!p) return '';
    return (p.textContent || '').replace(/\s+/g, '').toLowerCase();
  }

  function findBackToTop() {
    var links = document.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.id === 'vu-contact-btn') continue;
      if (/^(backtotop|emailme)+$/.test(rollingLabel(a)) && visible(a)) return a;
    }
    return null;
  }

  function buildContactButton(anchor) {
    var el = document.getElementById('vu-contact-btn');
    if (el) return el;
    el = anchor.cloneNode(true);
    el.id = 'vu-contact-btn';
    el.removeAttribute('href');
    el.removeAttribute('target');
    el.removeAttribute('data-framer-appear-id');
    [].forEach.call(el.querySelectorAll('[data-framer-appear-id]'), function (n) {
      n.removeAttribute('data-framer-appear-id'); n.style.opacity = '1'; n.style.transform = 'none';
    });
    // relabel the rolling-text letters to CONTACT, reusing an original letter
    // span as the template so the font styling is byte-identical
    var p = el.querySelector('p[class*="rolling-text-inner"]');
    if (p) {
      var tmpl = p.querySelector('span');
      p.textContent = '';
      'CONTACT'.split('').forEach(function (ch) {
        var s2 = tmpl ? tmpl.cloneNode(false) : document.createElement('span');
        s2.textContent = ch;
        s2.style.transform = 'none';
        p.appendChild(s2);
      });
    }
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Contact');
    el.style.position = 'absolute';
    el.style.zIndex = '2147483000';
    el.style.margin = '0';
    el.style.cursor = 'pointer';
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.addEventListener('click', openContact);
    document.body.appendChild(el);
    return el;
  }

  function positionContactButton() {
    var a = findBackToTop();
    var el = document.getElementById('vu-contact-btn');
    if (!a) { if (el) el.style.display = 'none'; return; }
    el = buildContactButton(a);
    var r = a.getBoundingClientRect();
    el.style.display = 'block';
    el.style.boxSizing = 'border-box';
    // natural (content) width — the label differs from the original's, so forcing
    // the original's width would clip it; center it under the original instead
    el.style.width = 'max-content';
    el.style.height = r.height + 'px';
    el.style.top = (r.bottom + window.scrollY + 16) + 'px';
    el.style.left = (r.left + window.scrollX + (r.width - el.offsetWidth) / 2) + 'px';
  }

  /* ---------- 수정2 · "구독 서비스" title above the FAQ list ---------- */

  var FAQ_FIRST_Q = 'VELDY 구독 서비스는 어떤 방식으로 운영되나요?';

  function findFaqFirstItem() {
    var ps = document.querySelectorAll('p');
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if ((p.textContent || '').trim() === FAQ_FIRST_Q && visible(p)) {
        return p.closest('[data-framer-name="Primary"]') || p.closest('div[class*="-container"]') || p;
      }
    }
    return null;
  }

  function buildFaqTitle(fontRef) {
    var el = document.getElementById('vu-subs-title');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'vu-subs-title';
    el.textContent = '구독 서비스';
    el.style.position = 'absolute';
    el.style.zIndex = '2147483000';
    el.style.margin = '0';
    el.style.pointerEvents = 'none';
    el.style.whiteSpace = 'nowrap';
    el.style.fontWeight = '700';
    el.style.lineHeight = '1.2';
    el.style.color = 'var(--token-9811e40b-3ed8-4237-98e5-61535bb22d2f, #fff)';
    try { el.style.fontFamily = getComputedStyle(fontRef).fontFamily; } catch (e) {}
    document.body.appendChild(el);
    return el;
  }

  function positionFaqTitle() {
    var item = findFaqFirstItem();
    var el = document.getElementById('vu-subs-title');
    if (!item) { if (el) el.style.display = 'none'; return; }
    var q = item.querySelector('p') || item;
    el = buildFaqTitle(q);
    var r = item.getBoundingClientRect();
    // bold + large, scaled to the FAQ column so it holds up on every breakpoint
    var size = Math.max(26, Math.min(44, r.width * 0.055));
    el.style.display = 'block';
    el.style.fontSize = size + 'px';
    el.style.top = (r.top + window.scrollY - el.offsetHeight - 28) + 'px';
    el.style.left = (r.left + window.scrollX) + 'px';
  }

  /* ---------- shared re-anchor loop (same pattern as veldy-contact.js) ---------- */

  var pending = false;
  function apply() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      try { positionContactButton(); } catch (e) {}
      try { positionFaqTitle(); } catch (e) {}
    });
  }

  function schedule() {
    apply();
    // layout settles as fonts/images load, and Framer re-renders on hydration/resize
    [120, 300, 600, 1000, 1600, 2600, 4000].forEach(function (t) { setTimeout(apply, t); });
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    window.addEventListener('load', apply);
    window.addEventListener('scroll', apply, { passive: true });
    try { new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
    if (window.ResizeObserver) { try { var ro = new ResizeObserver(apply); ro.observe(document.documentElement); } catch (e) {} }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') schedule();
  else window.addEventListener('DOMContentLoaded', schedule);
})();
