import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  y?: number;
  x?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  ease?: string;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    const {
      y = 40,
      x = 0,
      scale = 1,
      duration = 0.8,
      delay = 0,
      stagger = 0.1,
      start = 'top 80%',
      ease = 'power3.out',
      once = true,
    } = options;

    const children = ref.current.children.length > 0
      ? Array.from(ref.current.children)
      : [ref.current];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y,
          x,
          scale: scale !== 1 ? 0.9 : 1,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale,
          duration,
          delay,
          stagger,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start,
            once,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}
