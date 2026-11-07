import * as anatomy from './anatomy.mjs';
import {GRAPHIC_CATALOG_IDS} from '../catalog.mjs';
import * as lightroom from './lightroom.mjs';
import * as passage from './passage.mjs';
import * as fieldlines from './fieldlines.mjs';
import { GRAPHIC_TOKEN_DEFAULTS } from '../../graphic-tokens.mjs';

const modules = Object.freeze({ anatomy, lightroom, passage, fieldlines });
const motifs = new Set(['poster', 'focus', 'relation', 'rhythm', ...GRAPHIC_CATALOG_IDS]);
export const GRAPHIC_MOTION = Object.freeze(Object.fromEntries(Object.entries(modules).map(([id, module]) => [id, Object.freeze({ ...module.meta })])));

export function graphicDuration(value) {
  const text = String(value ?? '').trim();
  const match = /^(\d+(?:\.\d+)?|\.\d+)(ms|s)?$/.exec(text);
  const duration = match ? Number(match[1]) * (match[2] === 's' ? 1000 : 1) : NaN;
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

/** One finite, seekable timeline. Mount leaves the original SVG static. */
export function mountGraphicMotion(svg, {
  family = svg?.getAttribute?.('data-family'),
  motif = svg?.getAttribute?.('data-motif'),
  interactive = svg?.getAttribute?.('aria-hidden') !== 'true',
  reduced = false,
  duration: durationOverride,
  hintId,
  createPlan,
  onUpdate = () => {},
  beforePlay = () => {}
} = {}) {
  if (!svg?.ownerDocument?.defaultView || !svg.querySelector) throw new Error('Graphic motion requires a native SVG element.');
  if (!Object.hasOwn(modules, family)) throw new Error('Unknown graphic motion family: ' + String(family));
  if (createPlan !== undefined && typeof createPlan !== 'function') throw new TypeError('Graphic motion createPlan must be a function.');
  if (!motifs.has(motif) && !createPlan) throw new Error('Unknown graphic motion motif: ' + String(motif));
  if (durationOverride !== undefined && graphicDuration(durationOverride) === null) throw new Error('Graphic motion duration must be a positive time.');
  const module = modules[family], document = svg.ownerDocument, view = document.defaultView;
  const preference = view.matchMedia?.('(prefers-reduced-motion: reduce)') ?? { matches: false };
  const supported = typeof svg.animate === 'function';
  const originalAttributes = new Map(['tabindex', 'focusable', 'aria-describedby', 'data-motion-progress', 'data-interacting'].map(name => [name, svg.getAttribute(name)]));
  const defaultDuration = graphicDuration(GRAPHIC_TOKEN_DEFAULTS['duration.illustration'].$value) ?? 3200;
  const readDuration = () => graphicDuration(durationOverride)
    ?? graphicDuration(view.getComputedStyle?.(svg)?.getPropertyValue('--ds-duration-illustration'))
    ?? graphicDuration(svg.getAttribute('data-motion-duration'))
    ?? graphicDuration(module.meta.duration) ?? defaultDuration;
  let requestedReduced = Boolean(reduced), plan = null, animations = [], duration = readDuration();
  let time = duration, playing = false, direction = 1, loop = false, frame = 0, last = 0, rest = 0, destroyed = false;
  let pointerFrame = 0, pointerInput = null, interactionEnabled = true, keyX = 0, keyY = 0;
  const isReduced = () => requestedReduced || preference.matches || !supported;
  const state = () => ({ progress: time / duration, time, duration, playing, direction, reduced: isReduced(), systemReduced: Boolean(preference.matches), loop, supported });
  const report = () => onUpdate(state());
  const progressAttribute = () => svg.setAttribute('data-motion-progress', String(Math.round(time / duration * 1000)));
  const resetInteraction = () => {
    keyX = keyY = 0;
    plan?.interact?.({ x: 0, y: 0, active: false });
    svg.removeAttribute('data-interacting');
  };
  function discard() {
    animations.forEach(animation => animation.cancel()); animations = [];
    resetInteraction(); plan?.destroy?.(); plan = null;
  }
  function syncDuration() {
    const next = readDuration();
    if (next === duration) return;
    const progress = time / duration;
    discard(); duration = next; time = progress * duration;
  }
  function prepare() {
    if (plan || isReduced() || destroyed) return;
    // Trusted authoring recipes share the same timing, accessibility and cleanup.
    plan = (createPlan ?? module.create)(svg, motif);
    try {
      for (const { target, frames, start = 0, end = 1, easing = 'cubic-bezier(.2,.7,.2,1)' } of plan.tracks.filter(Boolean)) {
        if (!target || !svg.contains(target) || !(start >= 0 && end > start && end <= 1) || typeof target.animate !== 'function') throw new Error(`Invalid graphic motion track: ${family}/${motif}`);
        const animation = target.animate(frames, { duration: (end - start) * duration, delay: start * duration, easing, fill: 'both' });
        animation.pause(); animation.currentTime = time;
        animations.push(animation);
      }
    } catch (error) {
      discard(); throw error;
    }
  }
  function apply() {
    prepare();
    animations.forEach(animation => { animation.pause(); animation.currentTime = time; });
    progressAttribute();
  }
  function pause() {
    if (destroyed) return;
    playing = false; view.cancelAnimationFrame(frame); frame = 0; report();
  }
  function tick(now) {
    if (destroyed || !playing) return;
    const elapsed = Math.max(0, now - last); last = now;
    if (rest > 0) { rest -= elapsed; if (rest <= 0) time = direction > 0 ? 0 : duration; }
    else {
      time = Math.max(0, Math.min(duration, time + elapsed * direction)); apply();
      if ((direction > 0 && time === duration) || (direction < 0 && time === 0)) {
        if (loop) rest = 650; else playing = false;
      }
    }
    report(); frame = playing ? view.requestAnimationFrame(tick) : 0;
  }
  function settle() {
    if (destroyed) return;
    pause(); discard(); time = duration; progressAttribute(); report();
  }
  function play(backwards = false) {
    if (destroyed) return;
    syncDuration();
    if (isReduced()) { settle(); return; }
    beforePlay(); resetInteraction(); direction = backwards ? -1 : 1; rest = 0;
    if ((direction > 0 && time >= duration) || (direction < 0 && time <= 0)) time = direction > 0 ? 0 : duration;
    apply(); playing = true; last = view.performance.now(); view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(tick); report();
  }
  function seek(progress, { direction: restoredDirection } = {}) {
    if (destroyed) return;
    if (typeof progress !== 'number' || !Number.isFinite(progress)) throw new Error('Graphic motion progress must be finite.');
    if (restoredDirection !== undefined && restoredDirection !== -1 && restoredDirection !== 1) throw new Error('Graphic motion direction must be -1 or 1.');
    pause(); resetInteraction(); rest = 0; syncDuration();
    if (restoredDirection !== undefined) direction = restoredDirection;
    time = isReduced() ? duration : Math.max(0, Math.min(1, progress)) * duration;
    if (!isReduced()) apply(); else progressAttribute();
    report();
  }
  function toggle() { if (playing) pause(); else play(direction < 0 && time > 0 && time < duration); }
  function setReduced(value) {
    if (destroyed) return;
    requestedReduced = Boolean(value); pause(); discard(); syncDuration(); time = duration; progressAttribute(); report();
  }
  function move(input) {
    if (!interactionEnabled || isReduced() || destroyed || time < duration || playing) return;
    syncDuration(); prepare();
    plan?.interact?.(input);
    if (input.active) svg.setAttribute('data-interacting', ''); else svg.removeAttribute('data-interacting');
  }
  function pointerMove(event) {
    const bounds = svg.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointerInput = { x: Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)), y: Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)), active: true };
    if (!pointerFrame) pointerFrame = view.requestAnimationFrame(() => { pointerFrame = 0; move(pointerInput); });
  }
  function pointerLeave() { view.cancelAnimationFrame(pointerFrame); pointerFrame = 0; resetInteraction(); }
  function keyDown(event) {
    if (event.key === ' ') { event.preventDefault(); toggle(); return; }
    if (event.key === 'Escape' || event.key === 'Home') { event.preventDefault(); pointerLeave(); return; }
    const arrows = { ArrowLeft: [-.16, 0], ArrowRight: [.16, 0], ArrowUp: [0, -.16], ArrowDown: [0, .16] };
    if (!Object.hasOwn(arrows, event.key)) return;
    event.preventDefault();
    if (!interactionEnabled || isReduced()) return;
    if (time < duration || playing) settle();
    keyX = Math.max(-1, Math.min(1, keyX + arrows[event.key][0])); keyY = Math.max(-1, Math.min(1, keyY + arrows[event.key][1]));
    move({ x: keyX, y: keyY, active: true });
  }
  const changedPreference = () => setReduced(requestedReduced);
  const hidden = () => { if (document.hidden) { pause(); pointerLeave(); } };
  const observer = typeof view.IntersectionObserver === 'function' ? new view.IntersectionObserver(entries => { if (!entries[0].isIntersecting) { pause(); pointerLeave(); } }, { threshold: 0 }) : null;
  if (preference.addEventListener) preference.addEventListener('change', changedPreference); else preference.addListener?.(changedPreference);
  document.addEventListener('visibilitychange', hidden); observer?.observe(svg);
  if (interactive) {
    svg.setAttribute('tabindex', '0'); svg.setAttribute('focusable', 'true');
    if (hintId) svg.setAttribute('aria-describedby', [...new Set([...(svg.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean), String(hintId)])].join(' '));
    svg.addEventListener('pointermove', pointerMove); svg.addEventListener('pointerleave', pointerLeave); svg.addEventListener('pointercancel', pointerLeave);
    svg.addEventListener('keydown', keyDown); svg.addEventListener('blur', pointerLeave);
  }
  progressAttribute(); report();
  return {
    play, pause, toggle, seek, settle, setReduced,
    setLoop(value) { loop = Boolean(value); report(); },
    setInteraction(value) { interactionEnabled = Boolean(value); if (!interactionEnabled) pointerLeave(); },
    get state() { return state(); },
    destroy() {
      if (destroyed) return;
      pause(); destroyed = true; view.cancelAnimationFrame(pointerFrame); discard(); observer?.disconnect();
      if (preference.removeEventListener) preference.removeEventListener('change', changedPreference); else preference.removeListener?.(changedPreference);
      document.removeEventListener('visibilitychange', hidden);
      svg.removeEventListener('pointermove', pointerMove); svg.removeEventListener('pointerleave', pointerLeave); svg.removeEventListener('pointercancel', pointerLeave);
      svg.removeEventListener('keydown', keyDown); svg.removeEventListener('blur', pointerLeave);
      for (const [name, value] of originalAttributes) { if (value === null) svg.removeAttribute(name); else svg.setAttribute(name, value); }
    }
  };
}
