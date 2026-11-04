import { disableBlob } from './blob';

/*
 * "Lite" mode drops the effects that are expensive to draw (the WebGL orb, animated leaf shadows,
 * the frosted nav) for visitors whose browser renders on the CPU or can't hold a steady frame rate.
 * It is switched on by: ?lite=1, software WebGL (SwiftShader/llvmpipe), no WebGL at all, or a
 * measured low frame rate. ?lite=0 forces everything on. The first three are remembered per browser.
 */
const KEY = 'tz-lite';

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const write = (value: string) => {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
};

const enable = () => {
  if (document.documentElement.dataset.lite) return;
  document.documentElement.dataset.lite = '1';
  disableBlob();
};

function hasSoftwareWebGL() {
  try {
    const gl = (document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return true;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    return /swiftshader|llvmpipe|software|basic render|softpipe/i.test(name);
  } catch {
    return true;
  }
}

/** Average frame time over ~2s of rAF; resolves with ms per frame (or 0 when the tab is hidden). */
function measureFrameTime() {
  return new Promise<number>((resolve) => {
    const times: number[] = [];
    let last = 0;
    const step = (now: number) => {
      if (document.hidden) return resolve(0);
      if (last) times.push(now - last);
      last = now;
      if (times.length < 90) requestAnimationFrame(step);
      else {
        times.sort((a, b) => a - b);
        resolve(times[Math.floor(times.length * 0.5)]);
      }
    };
    requestAnimationFrame(step);
  });
}

/** Flags <html data-scrolling> while the page scrolls (cleared 140ms after the last scroll event). */
function trackScrolling() {
  let timer = 0;
  const root = document.documentElement;
  window.addEventListener(
    'scroll',
    () => {
      root.dataset.scrolling = '';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => delete root.dataset.scrolling, 140);
    },
    { passive: true }
  );
}

export function initLiteMode() {
  trackScrolling();
  const param = new URLSearchParams(window.location.search).get('lite');
  if (param === '0') return write('0');
  if (param === '1') {
    write('1');
    return enable();
  }
  const stored = read();
  if (stored === '1') return enable();
  if (stored === '0') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || hasSoftwareWebGL()) {
    write('1');
    return enable();
  }
  // Sample the frame rate once the intro has settled; a steady ~30fps or less means the page is too heavy here.
  window.setTimeout(async () => {
    const frame = await measureFrameTime();
    if (frame > 34) enable();
  }, 5000);
}
