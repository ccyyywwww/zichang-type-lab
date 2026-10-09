"use client";
import { createElement, useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties, type ElementType } from "react";
import { splitGraphemes } from "../core/segment-text";

export type TypewriterTextProps = { children: string; as?: ElementType; typingSpeed?: number; deletingSpeed?: number; holdDelay?: number; startDelay?: number; cursor?: string; loop?: boolean; paused?: boolean; className?: string; style?: CSSProperties };
export const typewriterTextDefaults = { typingSpeed: 90, deletingSpeed: 45, holdDelay: 1200, startDelay: 200, cursor: "|", loop: true };

function subscribeMotion(listener: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
function subscribeVisibility(listener: () => void) {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}
const motionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const visibilitySnapshot = () => document.hidden;
const serverMotionSnapshot = () => true;
const serverVisibilitySnapshot = () => false;
const timerDelay = (value: number, fallback: number) => Number.isFinite(value) ? Math.max(10, value) : fallback;

export function TypewriterText({ children, as = "span", typingSpeed = 90, deletingSpeed = 45, holdDelay = 1200, startDelay = 200, cursor = "|", loop = true, paused = false, className = "", style }: TypewriterTextProps) {
  const characters = useMemo(() => splitGraphemes(children), [children]);
  const [state, setState] = useState({ text: children, length: 0, deleting: false });
  const reduced = useSyncExternalStore(subscribeMotion, motionSnapshot, serverMotionSnapshot);
  const hidden = useSyncExternalStore(subscribeVisibility, visibilitySnapshot, serverVisibilitySnapshot);
  if (state.text !== children) setState({ text: children, length: 0, deleting: false });
  const { length, deleting } = state;
  useEffect(() => {
    if (paused || reduced || hidden || !characters.length || state.text !== children) return;
    const complete = length >= characters.length;
    const empty = length === 0;
    if (complete && !deleting && !loop) return;
    const delay = empty && !deleting ? timerDelay(startDelay, 200) : complete && !deleting ? timerDelay(holdDelay, 1200) : deleting ? timerDelay(deletingSpeed, 45) : timerDelay(typingSpeed, 90);
    const timer = window.setTimeout(() => {
      setState(current => {
        if (current.text !== children) return current;
        if (complete && !deleting) return { ...current, deleting: true };
        if (empty && deleting) return { ...current, deleting: false };
        return { ...current, length: Math.min(characters.length, Math.max(0, current.length + (deleting ? -1 : 1))) };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [characters.length, children, deleting, deletingSpeed, hidden, holdDelay, length, loop, paused, reduced, startDelay, state.text, typingSpeed]);
  const visible = paused || reduced ? children : characters.slice(0, state.text === children ? length : 0).join("");
  return createElement(as, { className: ["zc-typewriter-text", paused ? "is-paused" : "", className].filter(Boolean).join(" "), style }, <><span className="zc-typewriter-readable">{children}</span><span className="zc-typewriter-measure" aria-hidden="true">{children}{cursor}</span><span className="zc-typewriter-visible" aria-hidden="true"><span className="zc-typewriter-visible-text">{visible}</span><span className="zc-typewriter-cursor">{cursor}</span></span></>);
}
