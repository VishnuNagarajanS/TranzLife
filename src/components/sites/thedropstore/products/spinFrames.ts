/** Transparent turntable frames (cut out of a product video), keyed by product slug. */
export const SPIN_FRAME_COUNT = 94;
export const SPIN_FRAME_SLUGS = new Set(['pulmoclear']);

const COARSE_STEP = 4;
const CONCURRENCY = 6;
const DENSE_DELAY_MS = 800;

/** Frames fill in over time; `images[i]` is null until frame i has been decoded. */
export interface SpinSet {
  images: (HTMLImageElement | null)[];
  width: number;
  height: number;
}

const sets = new Map<string, SpinSet>();
const loading = new Map<string, Promise<void>>();
const listeners = new Map<string, Set<(set: SpinSet) => void>>();

const frameUrl = (slug: string, i: number) => `/tranzlife/spin/${slug}/${String(i + 1).padStart(3, '0')}.webp`;

export function getSpinSet(slug: string): SpinSet {
  let set = sets.get(slug);
  if (!set) {
    set = { images: Array.from({ length: SPIN_FRAME_COUNT }, () => null), width: 0, height: 0 };
    sets.set(slug, set);
  }
  return set;
}

/** Nearest decoded frame to `index` (frames arrive coarse-to-fine), or null if none yet. */
export function nearestFrame(set: SpinSet, index: number): { image: HTMLImageElement; index: number } | null {
  for (let d = 0; d < SPIN_FRAME_COUNT; d++) {
    for (const i of d === 0 ? [index] : [index - d, index + d]) {
      const image = set.images[i];
      if (image) return { image, index: i };
    }
  }
  return null;
}

async function loadFrame(slug: string, i: number, set: SpinSet) {
  const image = new Image();
  image.decoding = 'async';
  image.src = frameUrl(slug, i);
  try {
    await image.decode();
  } catch {
    return;
  }
  set.images[i] = image;
  if (!set.width) {
    set.width = image.naturalWidth;
    set.height = image.naturalHeight;
  }
}

async function loadBatch(slug: string, indices: number[], set: SpinSet) {
  const queue = [...indices];
  const worker = async () => {
    for (let i = queue.shift(); i !== undefined; i = queue.shift()) {
      const hadSize = !!set.width;
      await loadFrame(slug, i, set);
      if (!hadSize && set.width) listeners.get(slug)?.forEach((listener) => listener(set));
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

/**
 * Loads a product's frames progressively: every 4th frame first so it can spin straight away,
 * then (after a short pause) the rest. `onFirst` fires as soon as the first frame's size is known.
 */
export function loadSpinSet(slug: string, onFirst?: (set: SpinSet) => void): Promise<void> {
  const set = getSpinSet(slug);
  if (onFirst) {
    // Several mounts (React strict mode, route changes) can wait on the same load.
    if (!listeners.has(slug)) listeners.set(slug, new Set());
    listeners.get(slug)!.add(onFirst);
    if (set.width) onFirst(set);
  }
  let promise = loading.get(slug);
  if (!promise) {
    const all = Array.from({ length: SPIN_FRAME_COUNT }, (_, i) => i);
    const coarse = all.filter((i) => i % COARSE_STEP === 0);
    const dense = all.filter((i) => i % COARSE_STEP !== 0);
    promise = loadBatch(slug, coarse, set)
      .then(() => new Promise<void>((resolve) => window.setTimeout(resolve, DENSE_DELAY_MS)))
      .then(() => loadBatch(slug, dense, set));
    loading.set(slug, promise);
  }
  return promise;
}
