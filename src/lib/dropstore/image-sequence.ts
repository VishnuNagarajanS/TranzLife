'use client';

import { gsap } from './gsap';

const imageCache = new Map<string, HTMLImageElement>();

export interface ImageSequenceOptions {
  frames: string[];
  canvas?: HTMLCanvasElement;
  fallback?: HTMLElement | null;
  width: number;
  height: number;
  fps?: number;
}

/** Draws a list of frame images onto a canvas, driven by GSAP tweens. */
export class ImageSequence {
  static instances = new Map<string, ImageSequence>();

  id!: string;
  canvas!: HTMLCanvasElement;
  frames: (HTMLImageElement | undefined)[] = [];
  framesAmount!: number;
  width!: number;
  height!: number;
  fps!: number;
  fallback?: HTMLElement;
  loader!: Promise<unknown>;
  currentFrame = 0;
  private prevFrameNumber?: number;
  private isFallbackHidden = false;
  private dpr = Math.min(devicePixelRatio, 2);
  private tweens: gsap.core.Animation[] = [];

  constructor(options: ImageSequenceOptions) {
    const canvas = options.canvas ?? document.createElement('canvas');
    const existing = Array.from(ImageSequence.instances.values()).find((s) => s.canvas === canvas);
    if (existing) return existing;

    this.canvas = canvas;
    this.width = canvas.parentElement?.offsetWidth || options.width;
    this.height = canvas.parentElement?.offsetHeight || options.height;
    this.fps = options.fps ?? 60;
    this.framesAmount = options.frames.length;
    this.setupCanvas();
    this.loader = this.loadFrames(options.frames);
    this.fallback = options.fallback ?? undefined;
    this.id = String(ImageSequence.instances.size + Math.random());
    ImageSequence.instances.set(this.id, this);
    this.drawFrame();
  }

  get context2d() {
    return this.canvas?.getContext('2d');
  }

  get frameTime() {
    return 1000 / this.fps;
  }

  get duration() {
    return (this.frameTime * this.framesAmount) / 1000;
  }

  private loadFrames(sources: string[]) {
    return Promise.allSettled(
      sources.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = imageCache.get(src) ?? new Image(this.width, this.height);
            if (img.complete && img.naturalWidth) return resolve(img);
            img.src = src;
            img.addEventListener('load', () => {
              imageCache.set(src, img);
              resolve(img);
            });
            img.addEventListener('error', () => reject(img));
          })
      )
    ).then((results) => {
      this.frames = results.map((r) => (r.status === 'fulfilled' ? r.value : undefined));
      return results;
    });
  }

  setupCanvas() {
    if (!this.canvas) return;
    this.width = this.canvas.parentElement?.offsetWidth || this.width;
    this.height = this.canvas.parentElement?.offsetHeight || this.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.context2d?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  drawFrame = async (frame = this.currentFrame, force = false) => {
    const changed = this.prevFrameNumber !== frame;
    if ((!changed && !force) || !this.context2d || !document.body.contains(this.canvas)) return;
    await this.loader;
    const image = this.frames[frame % this.framesAmount];
    if (!image) return;
    if (!this.isFallbackHidden) {
      this.fallback?.classList.add('hidden');
      this.isFallbackHidden = true;
    }
    const scale = Math.min(this.width / image.naturalWidth, this.height / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    const ctx = this.context2d;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(image, (this.width - w) * 0.5, (this.height - h) * 0.5, w, h);
    this.prevFrameNumber = frame;
  };

  seek = (progress: number) => {
    const frame = Math.floor(gsap.utils.mapRange(0, 1, 0, this.framesAmount - 1, progress % 1));
    return this.drawFrame(frame);
  };

  createTween(vars: gsap.TweenVars & { reversed?: boolean } = {}) {
    const total = this.framesAmount;
    const reversed = !!vars.reversed;
    const state = { frame: reversed ? total : 0 };
    const tween = gsap.to(state, {
      frame: reversed ? 0 : total,
      paused: true,
      ease: 'none',
      duration: this.duration,
      ...vars,
      onUpdate: () => {
        (vars.onUpdate as (() => void) | undefined)?.();
        this.drawFrame(Math.floor(state.frame), true);
      },
    });
    this.tweens.push(tween);
    return tween;
  }

  createTimeline(vars: gsap.TimelineVars = {}) {
    const timeline = gsap.timeline({ defaults: { ease: 'none' }, ...vars });
    this.tweens.push(timeline);
    return timeline;
  }

  destroy = () => {
    this.frames = [];
    while (this.tweens.length) this.tweens.pop()?.kill();
    ImageSequence.instances.delete(this.id);
  };
}
