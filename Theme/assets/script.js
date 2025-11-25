const story     = document.getElementById('vk-story');
const slides    = story ? story.querySelectorAll('.vk-slide') : [];
const copies    = story ? story.querySelectorAll('.vk-slide .vk-copy') : [];
const bgs       = story ? story.querySelectorAll('.vk-bg-layer .vk-bg-img') : [];
const blurLayer = document.querySelector('.vk-blur-layer');
const slideCount = slides.length;

function resetStoryVisuals() {
  bgs.forEach(bg => {
    bg.style.opacity = 0;
    bg.style.transform = 'scale(1)';
  });
  if (blurLayer) {
    blurLayer.style.backdropFilter = 'blur(0px)';
    blurLayer.style.backgroundColor = 'transparent';
  }
  copies.forEach(copy => {
    copy.style.opacity = 0;
  });
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

const PHASES = {
  CROSS_END:     0.15,
  ZOOM_END:      0.35,
  BLUR_IN_END:   0.45,
  TEXT_IN_END:   0.65,
  TEXT_HOLD_END: 0.90,
  TEXT_OUT_END:  0.97,
  CLEAN_END:     1.00
};

let ticking = false;

function updateStoryAnimations() {
  if (!story) return;
  ticking = false;

  const heroVisible = updateHeroStage();
  if (heroVisible) {
    return;
  }

  const viewportH   = window.innerHeight;
  const rect        = story.getBoundingClientRect();
  if (rect.top > viewportH) {
    resetStoryVisuals();
    document.body && document.body.classList.remove('story-active');
    return;
  }
  const totalHeight = Math.max(story.offsetHeight - viewportH, 0);
  const scrolled = clamp(-rect.top, 0, totalHeight);
  if (totalHeight <= 0) {
    resetStoryVisuals();
    document.body && document.body.classList.remove('story-active');
    return;
  }
  const storyDone = scrolled >= totalHeight - 1;
  if (storyDone) {
    resetStoryVisuals();
    document.body && document.body.classList.remove('story-active');
    return;
  } else {
    document.body && document.body.classList.add('story-active');
  }
  const tGlobal  = totalHeight > 0 ? scrolled / totalHeight : 0;
  const slidePos = tGlobal * slideCount;
  let active     = Math.floor(slidePos);
  active         = clamp(active, 0, slideCount - 1);
  const localRaw = slidePos - active;
  const u        = clamp(localRaw, 0, 1);

  slides.forEach((slide, i) => {
    let opacity = 0;
    let translateY = -120;

    if (i === active) {
      const p = u;

      if (p <= PHASES.BLUR_IN_END || p >= PHASES.CLEAN_END) {
        opacity = 0;
      } else if (p < PHASES.TEXT_IN_END) {
        const t = (p - PHASES.BLUR_IN_END) /
                  (PHASES.TEXT_IN_END - PHASES.BLUR_IN_END);
        const e = smoothstep(clamp(t, 0, 1));
        opacity = e;
        translateY = -120 + (-50 + 120) * e;
      } else if (p < PHASES.TEXT_HOLD_END) {
        opacity = 1;
        translateY = -50;
      } else if (p < PHASES.TEXT_OUT_END) {
        const t = (p - PHASES.TEXT_HOLD_END) /
                  (PHASES.TEXT_OUT_END - PHASES.TEXT_HOLD_END);
        const e = smoothstep(clamp(t, 0, 1));
        opacity = 1 - e;
        translateY = -50 + (-140 + 50) * e;
      } else {
        opacity = 0;
      }
    }

    if (copies[i]) {
      copies[i].style.opacity   = opacity;
      copies[i].style.transform = `translate3d(-50%, ${translateY}%, 0)`;
    }
  });

  bgs.forEach(bg => {
    bg.style.opacity   = 0;
    bg.style.transform = 'scale(1)';
  });

  const current = active;
  const prev    = active - 1;

  let opacityPrev = 0;
  let opacityCur  = 1;
  let scaleCur    = 1;
  const p = u;

  if (prev >= 0) {
    if (p < PHASES.CROSS_END) {
      const t = p / PHASES.CROSS_END;
      const e = smoothstep(clamp(t, 0, 1));
      opacityPrev = 1 - e;
      opacityCur  = e;
    } else {
      opacityPrev = 0;
      opacityCur  = 1;
    }
  }

  if (p >= PHASES.CROSS_END && p < PHASES.ZOOM_END) {
    const t = (p - PHASES.CROSS_END) /
              (PHASES.ZOOM_END - PHASES.CROSS_END);
    const e = smoothstep(clamp(t, 0, 1));
    scaleCur = 1 + 0.02 * e;
  } else if (p >= PHASES.ZOOM_END && p < PHASES.TEXT_OUT_END) {
    scaleCur = 1.02;
  } else if (p >= PHASES.TEXT_OUT_END && p < PHASES.CLEAN_END) {
    const t = (p - PHASES.TEXT_OUT_END) /
              (PHASES.CLEAN_END - PHASES.TEXT_OUT_END);
    const e = smoothstep(clamp(t, 0, 1));
    scaleCur = 1 + 0.02 * (1 - e);
  }

  if (prev >= 0 && bgs[prev]) {
    bgs[prev].style.opacity = opacityPrev;
  }
  if (bgs[current]) {
    bgs[current].style.opacity   = opacityCur;
    bgs[current].style.transform = `scale(${scaleCur})`;
  }

  if (blurLayer) {
    let blurStrength = 0;

    if (p >= PHASES.ZOOM_END && p < PHASES.BLUR_IN_END) {
      const t = (p - PHASES.ZOOM_END) /
                (PHASES.BLUR_IN_END - PHASES.ZOOM_END);
      blurStrength = 8 * smoothstep(clamp(t, 0, 1));
    } else if (p >= PHASES.BLUR_IN_END && p < PHASES.TEXT_OUT_END) {
      blurStrength = 8;
    } else if (p >= PHASES.TEXT_OUT_END && p < PHASES.CLEAN_END) {
      const t = (p - PHASES.TEXT_OUT_END) /
                (PHASES.CLEAN_END - PHASES.TEXT_OUT_END);
      blurStrength = 8 * (1 - smoothstep(clamp(t, 0, 1)));
    }

    blurLayer.style.backdropFilter  = `blur(${blurStrength}px)`;
    blurLayer.style.backgroundColor = 'transparent';
  }
}

const hero     = document.getElementById('vk-hero');
const heroBg   = document.querySelector('.vk-hero-bg');
const heroCopy = document.querySelector('.vk-hero-copy');

function updateHeroStage() {
  if (!hero) return false;

  const rect      = hero.getBoundingClientRect();
  const viewportH = window.innerHeight;
  const heroHeight = rect.height || viewportH;
  const progress   = clamp(-rect.top / heroHeight, 0, 1);
  const heroAlpha  = 1 - progress;

  if (heroBg) {
    heroBg.style.opacity = heroAlpha;
  }
  if (heroCopy) {
    heroCopy.style.opacity = heroAlpha;
    heroCopy.style.transform =
      `translate(-50%, ${-50 - progress * 20}%)`;
  }

  const firstBg = bgs[0];
  if (firstBg) {
    firstBg.style.opacity   = progress;
    firstBg.style.transform = 'scale(1)';
  }

  const heroVisible = rect.bottom > 0;

  if (heroVisible && copies.length) {
    copies.forEach(c => {
      c.style.opacity = 0;
    });
    if (blurLayer) {
      blurLayer.style.backdropFilter  = 'blur(0px)';
      blurLayer.style.backgroundColor = 'transparent';
    }
  }

  return heroVisible;
}

const heroPageScrollEnabled = !!story && slides.length > 0;
const RESPONSIVENESS = 0.3;
let targetScrollY = window.scrollY;
const SCROLL_SCALE = RESPONSIVENESS;
const BASE_SMOOTH  = 0.18;
const SMOOTHING    = clamp(
  BASE_SMOOTH + (RESPONSIVENESS - 1.0) * 0.10,
  0.05,
  0.35
);

if (heroPageScrollEnabled) {
  window.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = e.deltaY * SCROLL_SCALE;
      targetScrollY = Math.max(
        0,
        targetScrollY + delta
      );
    },
    { passive: false }
  );

  function driveSmoothScroll() {
    const current = window.scrollY;
    const diff    = targetScrollY - current;

    if (Math.abs(diff) > 0.5) {
      const next = current + diff * SMOOTHING;
      window.scrollTo(0, next);
    }

    requestAnimationFrame(driveSmoothScroll);
  }
  driveSmoothScroll();
}

function onScrollAll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;

      if (story) {
        updateStoryAnimations();
      } else if (hero) {
        updateHeroStage();
      }
    });
  }
}

window.addEventListener('scroll', onScrollAll, { passive: true });
window.addEventListener('resize', onScrollAll);
onScrollAll();
