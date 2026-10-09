"use client";

import { useEffect, type RefObject } from "react";

/** Reveal only visible content; the page remains readable without animation support. */
export function usePageMotion(root: RefObject<HTMLElement | null>, filter: string, paused: boolean) {
  useEffect(() => {
    const page = root.current;
    if (!page) return;
    let frame = 0;
    let previousY = scrollY;
    const update = () => {
      const distance = document.documentElement.scrollHeight - innerHeight;
      page.style.setProperty("--page-progress", String(distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0));
      if (scrollY !== previousY) page.setAttribute("data-scroll-direction", scrollY > previousY ? "down" : "up");
      previousY = scrollY;
      frame = 0;
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, [root, filter]);

  useEffect(() => {
    const page = root.current;
    if (!page || typeof IntersectionObserver === "undefined") return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let enterObserver: IntersectionObserver | undefined;
    let leaveObserver: IntersectionObserver | undefined;
    const records = new Map<Element, { armed: boolean; animation?: Animation }>();
    const stop = () => {
      enterObserver?.disconnect();
      leaveObserver?.disconnect();
      records.forEach(record => record.animation?.cancel());
      records.clear();
    };
    const start = () => {
      stop();
      if (paused || preference.matches) return;
      const cards = [...page.querySelectorAll(".effect-card")];
      const elements = page.querySelectorAll(".effect-card, .section-heading, .principle-grid article, .hero h1, .hero-copy, .hero-actions");
      elements.forEach(element => records.set(element, { armed: true }));
      enterObserver = new IntersectionObserver(entries => {
        let stagger = 0;
        entries.forEach(entry => {
          const record = records.get(entry.target);
          if (!record?.armed || !entry.isIntersecting || entry.intersectionRatio < .12) return;
          record.armed = false;
          const direction = page.dataset.scrollDirection === "up" ? -1 : 1;
          const cardIndex = cards.indexOf(entry.target);
          const variant = cardIndex >= 0 ? cardIndex % 3 : -1;
          let frames: Keyframe[];
          if (variant === 0) {
            frames = [
              { opacity: 0, translate: `${cardIndex % 2 ? 65 : -65}px ${direction * 80}px`, rotate: `${cardIndex % 2 ? 6 : -6}deg`, scale: .84 },
              { opacity: 1, translate: `0 ${-direction * 8}px`, rotate: "0deg", scale: 1.025, offset: .8 },
              { opacity: 1, translate: "0 0", rotate: "0deg", scale: 1 },
            ];
          } else if (variant === 1) {
            frames = [
              { opacity: 0, transform: `perspective(900px) rotateX(${direction * 38}deg)`, translate: `0 ${direction * 75}px`, scale: .88 },
              { opacity: 1, transform: "perspective(900px) rotateX(-3deg)", translate: "0 0", scale: 1.02, offset: .8 },
              { opacity: 1, transform: "perspective(900px) rotateX(0deg)", translate: "0 0", scale: 1 },
            ];
          } else if (variant === 2) {
            frames = [
              { opacity: .1, clipPath: direction > 0 ? "inset(0 100% 0 0 round 18px)" : "inset(0 0 0 100% round 18px)", translate: `0 ${direction * 35}px` },
              { opacity: 1, clipPath: "inset(0 0 0 0 round 18px)", translate: "0 0" },
            ];
          } else if (entry.target.matches(".principle-grid article")) {
            frames = [{ opacity: 0, scale: .65, rotate: "-5deg" }, { opacity: 1, scale: 1, rotate: "0deg" }];
          } else {
            frames = [
              { opacity: 0, translate: `0 ${direction * 55}px`, clipPath: direction > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" },
              { opacity: 1, translate: "0 0", clipPath: "inset(0)" },
            ];
          }
          const animation = entry.target.animate(frames, {
            duration: variant === 2 ? 850 : 1000, delay: Math.min(stagger++, 4) * 100,
            easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards",
          });
          animation.id = `page-reveal-${variant}`;
          record.animation = animation;
          animation.onfinish = () => { if (record.animation === animation) record.animation = undefined; };
        });
      }, { threshold: [0, .12] });
      // Rearm outside an expanded viewport so transforms cannot cause edge jitter.
      leaveObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) return;
          const record = records.get(entry.target);
          if (!record) return;
          record.animation?.cancel();
          record.animation = undefined;
          record.armed = true;
        });
      }, { rootMargin: "100px 0px", threshold: 0 });
      elements.forEach(element => { enterObserver?.observe(element); leaveObserver?.observe(element); });
    };
    start();
    preference.addEventListener("change", start);
    return () => { stop(); preference.removeEventListener("change", start); };
  }, [root, filter, paused]);

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let active: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      active?.classList.remove("is-pointer-active");
      active?.style.removeProperty("--tilt-x");
      active?.style.removeProperty("--tilt-y");
      active = null;
    };
    const update = () => {
      frame = 0;
      if (!active) return;
      const bounds = active.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
      const relativeY = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
      active.style.setProperty("--pointer-x", `${relativeX * 100}%`);
      active.style.setProperty("--pointer-y", `${relativeY * 100}%`);
      active.style.setProperty("--tilt-x", `${(relativeY - .5) * -12}deg`);
      active.style.setProperty("--tilt-y", `${(relativeX - .5) * 12}deg`);
    };
    const move = (event: PointerEvent) => {
      if (paused || reduced.matches || !finePointer.matches || event.pointerType === "touch") { reset(); return; }
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".effect-card, .hero") : null;
      if (target !== active) { reset(); active = target; active?.classList.add("is-pointer-active"); }
      x = event.clientX;
      y = event.clientY;
      if (active && !frame) frame = requestAnimationFrame(update);
    };
    page.addEventListener("pointermove", move, { passive: true });
    page.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", reset, { passive: true });
    reduced.addEventListener("change", reset);
    finePointer.addEventListener("change", reset);
    return () => {
      reset();
      page.removeEventListener("pointermove", move);
      page.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", reset);
      reduced.removeEventListener("change", reset);
      finePointer.removeEventListener("change", reset);
    };
  }, [root, filter, paused]);
}
