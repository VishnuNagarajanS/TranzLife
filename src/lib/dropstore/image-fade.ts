/*
 * Blur-up for images: any <img> that is still downloading starts transparent and blurred, then
 * sharpens into place once it has loaded, instead of popping in. Images already in the cache are
 * left alone. The fade attribute is removed after the transition so it never fights an element's
 * own transitions (hover zooms etc.). Opt out with data-no-fade.
 */
const FADE_MS = 800;

function track(img: HTMLImageElement) {
  if (img.dataset.imgFade !== undefined || img.hasAttribute('data-no-fade')) return;
  if (img.complete && img.naturalWidth > 0) return;
  img.dataset.imgFade = '';
  img.dataset.imgLoading = '';
  const done = () => {
    img.removeEventListener('load', done);
    img.removeEventListener('error', done);
    // A short timer (not rAF, which a background tab pauses) so the loading styles have painted
    // and the change animates, and an image can never stay hidden.
    window.setTimeout(() => {
      delete img.dataset.imgLoading;
      window.setTimeout(() => delete img.dataset.imgFade, FADE_MS + 100);
    }, 30);
  };
  img.addEventListener('load', done);
  img.addEventListener('error', done);
}

export function initImageFade() {
  document.querySelectorAll('img').forEach(track);
  const observer = new MutationObserver((records) => {
    records.forEach((record) =>
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement) track(node);
        else if (node instanceof HTMLElement) node.querySelectorAll('img').forEach(track);
      })
    );
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
