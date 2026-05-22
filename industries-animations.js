/* ============================================================
   KEYSTONE · INDUSTRIES (CASE STUDIES) ANIMATIONS
   ------------------------------------------------------------
   GSAP + ScrollTrigger choreography for industries.html only.

   Pattern: each animation targets elements that were pre-hidden
   via the `.has-js` CSS guard in industries.html. We animate them
   FROM their hidden state into their natural one as they enter the
   viewport. Once-per-element (no replay on scroll-up).

   Restraint: tuned to match the rest of the site's motion language
   (Emil Kowalski skill principles — professional B2B, crisp not
   playful). Durations 0.6–0.8s, ease power3.out, stagger 50–80ms.

   Reduced motion: short-circuit. The CSS guard restores opacity
   for these users so nothing stays invisible.
   ============================================================ */
(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // GSAP didn't load — reveal everything via the same path reduced-motion
    // takes, so the page is never left with invisible elements.
    document.documentElement.classList.remove('has-js');
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Reduced motion: remove the guard so the @media rule isn't needed
    // and elements show at their natural opacity. No JS animation.
    document.documentElement.classList.remove('has-js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Critical: drop the `.has-js` guard NOW, before any gsap.from() call.
  // gsap.from() reads the element's CURRENT computed style as the TO
  // destination. While `.has-js` is on the root, that computed opacity
  // is 0 — so gsap.from(..., opacity: 0) would animate from 0 to 0 (no
  // visible change). Removing the guard before gsap.from runs makes the
  // natural state (opacity 1) the destination. GSAP then synchronously
  // sets opacity 0 inline as the FROM state in the same JS task, so the
  // browser never paints the elements in their visible state — no flash.
  document.documentElement.classList.remove('has-js');

  var EASE = 'power3.out';
  var DUR  = 0.7;
  var TRIGGER_START = 'top 82%';     // a touch above viewport bottom

  /* ─── HERO ─────────────────────────────────────────────────── */
  // Plays on page load — no ScrollTrigger needed since hero is above fold.
  var heroTl = gsap.timeline({ defaults: { ease: EASE, duration: DUR } });
  heroTl
    .from('.page-hero .k-label',         { y: 18, opacity: 0 })
    .from('.page-hero h1',               { y: 28, opacity: 0 }, '-=0.45')
    .from('.page-hero__inner > p',       { y: 20, opacity: 0 }, '-=0.45');

  /* ─── CASE-STUDY CARD GRID ─────────────────────────────────── */
  // 7 cards stagger fade-up as the grid enters viewport. The
  // .is-revealed class on each card triggers internal SVG animations
  // (progress bars filling, etc.) defined in industries.html CSS.
  var cards = gsap.utils.toArray('.case-card');
  if (cards.length) {
    gsap.from(cards, {
      y: 28,
      opacity: 0,
      duration: 0.7,
      ease: EASE,
      stagger: 0.06,
      scrollTrigger: {
        trigger: '.case-studies-grid',
        start: 'top 88%',
        once: true,
        onEnter: function () {
          cards.forEach(function (c, i) {
            // Stagger the .is-revealed flag so each card's SVG
            // animations begin in step with the card's own fade-up.
            setTimeout(function () { c.classList.add('is-revealed'); }, i * 60);
          });
        }
      }
    });
  }

  /* ─── PER-SECTION CHOREOGRAPHY ─────────────────────────────── */
  gsap.utils.toArray('.industry-section').forEach(function (section) {
    var label  = section.querySelector('.industry-section__label');
    var h2     = section.querySelector('h2');
    var intro  = section.querySelector('.industry-section__intro');
    var rightP = section.querySelectorAll('.industry-section__right p');
    var items  = section.querySelectorAll('.use-case-item');
    var ctaBar = section.querySelector('.industry-cta-bar');
    var useCaseList = section.querySelector('.use-case-list');

    // Section header: label → h2 → intro fade up in sequence
    var headerTl = gsap.timeline({
      defaults: { ease: EASE, duration: DUR },
      scrollTrigger: { trigger: section, start: TRIGGER_START, once: true }
    });
    if (label) headerTl.from(label, { y: 20, opacity: 0 });
    if (h2)    headerTl.from(h2,    { y: 26, opacity: 0 }, '-=0.5');
    if (intro) headerTl.from(intro, { y: 18, opacity: 0 }, '-=0.5');
    if (rightP.length) {
      headerTl.from(rightP, { y: 16, opacity: 0, stagger: 0.08, duration: 0.6 }, '-=0.45');
    }

    // Use-case items: staggered fade-up when the grid enters view
    if (items.length && useCaseList) {
      gsap.from(items, {
        y: 22,
        opacity: 0,
        duration: 0.6,
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: { trigger: useCaseList, start: 'top 85%', once: true }
      });
    }

    // CTA bar: fade up + slight slide
    if (ctaBar) {
      gsap.from(ctaBar, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: EASE,
        scrollTrigger: { trigger: ctaBar, start: 'top 88%', once: true }
      });
    }
  });

  /* ─── BOTTOM CTA ───────────────────────────────────────────── */
  var bottom = document.querySelector('.industries-bottom-cta');
  if (bottom) {
    gsap.from('.industries-bottom-cta > *', {
      y: 22,
      opacity: 0,
      duration: 0.7,
      ease: EASE,
      stagger: 0.1,
      scrollTrigger: { trigger: bottom, start: 'top 82%', once: true }
    });
  }

  /* ─── REFRESH ON FONT LOAD ─────────────────────────────────── */
  // Web fonts can shift layout after ScrollTrigger has measured. Recompute
  // start positions once fonts are ready so triggers fire at the right
  // scroll positions.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
