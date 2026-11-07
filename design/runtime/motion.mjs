/** Shared timing for expanding and restoring content. */
export const STANDARD_MOTION = Object.freeze({
  duration: 240,
  easing: 'cubic-bezier(.2,.7,.2,1)',
});

/** Reduced motion shows the final layout immediately; callers own animation cleanup. */
export function animateStandard(element, keyframes, options = {}) {
  if (!element?.animate || element.ownerDocument?.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null;
  return element.animate(keyframes, { ...STANDARD_MOTION, ...options });
}

/** Opt-in expressive motion. Themes supply timing, products supply keyframes.
 * Read from the target's own window so embedded documents keep their theme.
 * No animation is started on mount and reduced motion always takes priority.
 */
export function animateThemed(element, keyframes, options = {}) {
  const view = element?.ownerDocument?.defaultView;
  if (!element?.animate || view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null;
  const style = view?.getComputedStyle?.(element);
  const read = name => style?.getPropertyValue('--ds-' + name).trim() ?? '';
  const timing = read('duration-expressive');
  const duration = /^(?:\d*\.)?\d+(ms|s)$/.test(timing)
    ? Math.min(1000, parseFloat(timing) * (timing.endsWith('ms') ? 1 : 1000)) : STANDARD_MOTION.duration;
  const curve = ['x1','y1','x2','y2'].map(name => read('motion-curve-' + name));
  const values = curve.map(Number);
  const valid = curve.every(value => value !== '') && values.every(Number.isFinite)
    && [values[0],values[2]].every(value => value >= 0 && value <= 1);
  const easing = valid ? 'cubic-bezier(' + values.join(',') + ')' : STANDARD_MOTION.easing;
  return element.animate(keyframes, { duration, easing, ...options });
}
