import { useEffect, useRef, useState } from 'react';
import { initialContent, type Content } from '../lib/content';

type Props = {
  motion?: boolean;
  accent?: string;
  artwork?: Content['heroArtwork'];
  initials?: string;
  owner?: string;
};

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  color: string;
};

export default function KineticSculpture({
  motion = true,
  accent = '#ff5b23',
  artwork = initialContent.heroArtwork,
  initials = 'hr',
  owner = 'Hamza Rehman',
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phrase, setPhrase] = useState(0);
  const particlesRef = useRef<Particle[]>([]);

  const slides = artwork.phrases.filter(text => text.trim());
  const logoMode = artwork.mode === 'logo';
  // If in text mode with slides, cycle includes HR Logo + each text slide
  const cycle = !logoMode && slides.length > 0;
  const totalSteps = cycle ? slides.length + 1 : 1;
  const currentStep = cycle ? phrase % totalSteps : 0;
  const isLogoNow = logoMode || currentStep === 0;
  const textIndex = currentStep > 0 ? currentStep - 1 : 0;
  const word = isLogoNow ? initials : slides[textIndex] || initials;

  // Auto-advance every 4.2 seconds when motion is on
  useEffect(() => {
    if (!motion || !cycle) return;
    const timer = setInterval(() => {
      if (!document.hidden) {
        setPhrase(p => (p + 1) % totalSteps);
      }
    }, 4200);
    return () => clearInterval(timer);
  }, [motion, cycle, totalSteps]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let disposed = false;
    let logo: HTMLImageElement | undefined;
    const pointer = { x: -1000, y: -1000 };

    const render = (time = 0) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      const animate = motion && !reduced.matches;
      const scale = width / 540;
      const particles = particlesRef.current;

      for (const p of particles) {
        if (!animate) {
          p.x = p.tx;
          p.y = p.ty;
          p.vx = 0;
          p.vy = 0;
        }
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (animate && distance < 90 * scale && distance > 0) {
          const force = (1 - distance / (90 * scale)) * 5;
          p.vx += (dx / distance) * force;
          p.vy += (dy / distance) * force;
        }
        const wave = animate ? Math.sin(time * 0.0013 + p.tx * 0.018) * 3 * scale : 0;
        p.vx += (p.tx - p.x) * 0.035;
        p.vy += (p.ty + wave - p.y) * 0.035;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, Math.max(0.8, 1.65 * scale), 0, Math.PI * 2);
        context.fill();
      }
      if (animate && visible && !document.hidden) {
        frame = requestAnimationFrame(render);
      }
    };

    const wake = () => {
      if (!disposed && !frame) render(performance.now());
    };

    const resize = () => {
      width = element.clientWidth;
      height = element.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(devicePixelRatio, 2);
      element.width = width * dpr;
      element.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mask = document.createElement('canvas');
      mask.width = Math.ceil(width);
      mask.height = Math.ceil(height);
      const ink = mask.getContext('2d', { willReadFrequently: true });
      if (!ink) return;
      const middle = height * (artwork.showCaption ? 0.46 : 0.5);
      ink.textAlign = 'center';
      ink.textBaseline = 'middle';
      let logoBounds: number[] | undefined;

      if (isLogoNow) {
        if (logo?.complete && logo.naturalWidth) {
          const scale = Math.min((width * 0.84) / logo.naturalWidth, (height * 0.63) / logo.naturalHeight);
          logoBounds = [
            (width - logo.naturalWidth * scale) / 2,
            middle - (logo.naturalHeight * scale) / 2,
            logo.naturalWidth * scale,
            logo.naturalHeight * scale,
          ];
          ink.drawImage(
            logo,
            (width - logo.naturalWidth * scale) / 2,
            middle - (logo.naturalHeight * scale) / 2,
            logo.naturalWidth * scale,
            logo.naturalHeight * scale
          );
        } else {
          const size = Math.min(width * 0.56, height * 0.58);
          ink.font = `500 ${size}px Outfit, Arial, sans-serif`;
          const letters = initials.slice(0, 6);
          const lettersWidth = ink.measureText(letters).width;
          const starWidth = size * 0.59;
          ink.save();
          ink.translate(width / 2, middle);
          const fit = Math.min(1, (width * 0.86) / (lettersWidth + starWidth));
          ink.scale(fit, fit);
          ink.fillStyle = '#23231f';
          ink.textAlign = 'left';
          ink.fillText(letters, -(lettersWidth + starWidth) / 2, 0);
          ink.fillStyle = accent;
          ink.font = `400 ${size * 0.69}px Arial, sans-serif`;
          ink.fillText('✳', (lettersWidth - starWidth) / 2, -size * 0.04);
          ink.restore();
        }
      } else {
        const lines: string[] = [];
        for (const paragraph of word.split('\n')) {
          let line = '';
          for (const part of paragraph.split(/\s+/)) {
            if (line.length && line.length + part.length + 1 > 20) {
              lines.push(line);
              line = part;
            } else {
              line += (line ? ' ' : '') + part;
            }
          }
          lines.push(line);
        }
        if (lines.length > 3) lines.splice(2, lines.length - 2, lines.slice(2).join(' '));
        let size = Math.min(width * 0.25, (height * 0.56) / lines.length);
        ink.font = `900 ${size}px Arial, sans-serif`;
        size *= Math.min(1, (width * 0.9) / Math.max(...lines.map(line => ink.measureText(line).width), 1));
        ink.font = `900 ${size}px Arial, sans-serif`;
        lines.forEach((line, i) => {
          ink.fillStyle = i % 2 ? accent : '#23231f';
          ink.fillText(line, width / 2, middle + (i - (lines.length - 1) / 2) * size * 1.04);
        });
      }

      const pixels = ink.getImageData(0, 0, mask.width, mask.height).data;
      const step = Math.max(3, width / 125);
      let whiteBackground = false;
      if (logoBounds) {
        const [left, top, w, h] = logoBounds;
        whiteBackground =
          [
            [left + 1, top + 1],
            [left + w - 2, top + 1],
            [left + 1, top + h - 2],
            [left + w - 2, top + h - 2],
          ].filter(([x, y]) => {
            const i = (Math.floor(y) * mask.width + Math.floor(x)) * 4;
            return pixels[i] > 242 && pixels[i + 1] > 242 && pixels[i + 2] > 242 && pixels[i + 3] > 240;
          }).length >= 3;
      }

      const newTargets: { tx: number; ty: number; color: string }[] = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const offset = (Math.floor(y) * mask.width + Math.floor(x)) * 4;
          const white = pixels[offset] > 242 && pixels[offset + 1] > 242 && pixels[offset + 2] > 242;
          if (pixels[offset + 3] > 100 && !(whiteBackground && white)) {
            newTargets.push({
              tx: x,
              ty: y,
              color: white ? '#23231f' : `rgb(${pixels[offset]} ${pixels[offset + 1]} ${pixels[offset + 2]})`,
            });
          }
        }
      }

      const animate = motion && !reduced.matches;
      const oldParticles = particlesRef.current;

      // Morph existing particles fluidly between logo & text slides
      if (oldParticles.length > 0 && animate) {
        particlesRef.current = newTargets.map((target, i) => {
          if (i < oldParticles.length) {
            const p = oldParticles[i];
            p.tx = target.tx;
            p.ty = target.ty;
            p.color = target.color;
            p.vx += (Math.random() - 0.5) * 14;
            p.vy += (Math.random() - 0.5) * 14;
            return p;
          }
          const donor = oldParticles[i % oldParticles.length];
          return {
            x: donor.x + (Math.random() - 0.5) * 20,
            y: donor.y + (Math.random() - 0.5) * 20,
            tx: target.tx,
            ty: target.ty,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: target.color,
          };
        });
      } else {
        particlesRef.current = newTargets.map(target => ({
          tx: target.tx,
          ty: target.ty,
          x: target.tx + (animate ? (Math.random() - 0.5) * 90 : 0),
          y: target.ty,
          vx: 0,
          vy: 0,
          color: target.color,
        }));
      }

      wake();
    };

    if (isLogoNow && artwork.logo) {
      const url = new URL(artwork.logo, location.origin);
      if (url.origin === location.origin) {
        const image = new Image();
        image.onload = () => {
          if (!disposed) {
            logo = image;
            resize();
          }
        };
        image.src = url.href;
      }
    }

    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const leave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    intersection.observe(element);

    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('pointerup', leave);
    document.addEventListener('visibilitychange', wake);
    reduced.addEventListener('change', wake);
    void document.fonts.ready.then(() => {
      if (!disposed) resize();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('pointerup', leave);
      document.removeEventListener('visibilitychange', wake);
      reduced.removeEventListener('change', wake);
    };
  }, [motion, accent, word, isLogoNow, artwork.logo, artwork.showCaption, initials]);

  const counterLabel = isLogoNow
    ? `HR / ${String(slides.length).padStart(2, '0')}`
    : `${String(textIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;

  const contents = (
    <>
      {artwork.showEyebrow && artwork.eyebrow && <span className="type-edition" aria-hidden="true">{artwork.eyebrow}</span>}
      <canvas ref={canvas} aria-hidden="true" />
      {artwork.showCaption && artwork.caption && (
        <span className="type-caption" aria-hidden="true">
          <span>{artwork.caption}{cycle ? ' ↗' : ''}</span>
          {cycle && <span>{counterLabel}</span>}
        </span>
      )}
    </>
  );

  return cycle ? (
    <button
      className="living-type"
      onClick={() => setPhrase(value => (value + 1) % totalSteps)}
      aria-label={
        isLogoNow
          ? `${owner} logo in interactive dots. Click for next slide.`
          : `${word.replaceAll('\n', ' ')}. Slide ${textIndex + 1} of ${slides.length}`
      }
    >
      {contents}
    </button>
  ) : (
    <div
      className="living-type"
      role="img"
      aria-label={isLogoNow ? `${owner} logo in interactive dots` : word}
    >
      {contents}
    </div>
  );
}
