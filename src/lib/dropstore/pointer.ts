'use client';

import { gsap } from './gsap';

type Listener = (event: MouseEvent) => void;

/** Shared pointer position singleton, normalised to 0..1 across the viewport. */
export class Pointer {
  private static _instance?: Pointer;

  static get instance() {
    return (this._instance ??= new Pointer());
  }

  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
  clientX = this.viewWidth / 2;
  clientY = this.viewHeight / 2;
  normalX = 0.5;
  normalY = 0.5;
  private listeners = new Set<Listener>();

  private constructor() {
    window.addEventListener('mousemove', (event) => {
      if (matchMedia('(pointer: fine)').matches) {
        this.clientX = event.clientX;
        this.clientY = event.clientY;
        this.normalX = gsap.utils.mapRange(0, this.viewWidth, 0, 1, this.clientX);
        this.normalY = gsap.utils.mapRange(0, this.viewHeight, 0, 1, this.clientY);
      }
      this.listeners.forEach((listener) => listener(event));
    });
    window.addEventListener('resize', () => {
      this.viewWidth = window.innerWidth;
      this.viewHeight = window.innerHeight;
    });
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
