let panelSequence = 0;

/** Disclosure and horizontal resizing for a right-hand panel; the host owns its content. */
export function mountPanelControls({ container, panel, handle, toggle, minimum = 240, maximum = 560, width = 320, open = true, onChange = () => {}, document = container?.ownerDocument ?? globalThis.document } = {}) {
  if (![container, panel, toggle].every(node => node?.setAttribute && node?.addEventListener)
    || (handle && (!handle.setAttribute || !handle.addEventListener))) throw new Error('Panel controls require a container, panel and toggle.');
  if (![minimum, maximum, width].every(Number.isFinite) || minimum <= 0 || maximum < minimum || typeof open !== 'boolean' || typeof onChange !== 'function') throw new Error('Invalid panel limits or initial state.');
  let currentWidth = width, isOpen = open, destroyed = false, drag = null, keyboardStart = null;
  const listeners = [], pointerTarget = document?.addEventListener ? document : handle;
  const listen = (node, type, handler) => { if (node?.addEventListener) { node.addEventListener(type, handler); listeners.push([node, type, handler]); } };
  const alive = () => { if (destroyed) throw new Error('The panel controls have been destroyed.'); };
  const notify = () => onChange({ width: currentWidth, open: isOpen });
  const hide = (node, hidden) => { if (!node) return; node.hidden = hidden; if (hidden) node.setAttribute('hidden', ''); else node.removeAttribute('hidden'); };
  if (!panel.getAttribute('id')) {
    let id;
    do { id = 'ds-panel-' + ++panelSequence; } while (document?.getElementById?.(id));
    panel.setAttribute('id', id);
  }
  toggle.setAttribute('aria-controls', panel.getAttribute('id'));
  if (toggle.tagName === 'BUTTON') toggle.setAttribute('type', 'button');
  if (handle) {
    handle.setAttribute('role', 'separator'); handle.setAttribute('aria-orientation', 'vertical'); handle.setAttribute('aria-controls', panel.getAttribute('id'));
    if (!handle.getAttribute('aria-label')) handle.setAttribute('aria-label', 'Juster sidepanelets bredde');
    if (handle.tagName === 'BUTTON') handle.setAttribute('type', 'button');
  }
  function limits() {
    const bounds = container.getBoundingClientRect?.(), available = Number.isFinite(bounds?.width) && bounds.width > 0 ? bounds.width : container.clientWidth;
    const measured = Number.isFinite(available) && available > 0;
    const compact = measured && (available < minimum + 248 || (Number.isFinite(bounds?.height) && bounds.height > 0 && bounds.height < 320));
    container.setAttribute('data-panel-compact', String(compact));
    return { minimum, maximum: Number.isFinite(available) && available > 0 && !compact ? Math.min(maximum, Math.max(minimum, available - 248)) : maximum };
  }
  function applyWidth(value, emit = true) {
    const range = limits(), view = document?.defaultView;
    const unavailable = handle && (!isOpen || container.getAttribute('data-panel-compact') === 'true'
      || view?.matchMedia?.('(max-width: 800px), (max-height: 480px)').matches || view?.getComputedStyle?.(handle).display === 'none');
    if (unavailable) {
      if (drag) { value = drag.width; finishDrag(); }
      keyboardStart = null;
      if (handle.contains(document?.activeElement)) toggle.focus({ preventScroll: true });
    }
    const next = Math.min(range.maximum, Math.max(range.minimum, Math.round(value))), changed = next !== currentWidth;
    currentWidth = next;
    if (container.style.setProperty) container.style.setProperty('--ds-panel-width', next + 'px');
    else container.style['--ds-panel-width'] = next + 'px';
    if (handle) for (const [name, value] of [['aria-valuemin', range.minimum], ['aria-valuemax', range.maximum], ['aria-valuenow', next], ['aria-valuetext', next + ' pixels']]) handle.setAttribute(name, String(value));
    if (emit && changed) notify();
  }
  function finishDrag(cancel = false) {
    if (!drag) return;
    const previous = drag; drag = null; keyboardStart = null;
    try { handle.releasePointerCapture?.(previous.id); } catch { /* Capture may already have ended. */ }
    if (cancel) applyWidth(previous.width);
  }
  function setOpen(value) {
    alive(); if (typeof value !== 'boolean') throw new Error('Panel open state must be boolean.');
    const changed = value !== isOpen;
    if (!value) {
      finishDrag(true);
      if (panel.contains(document?.activeElement) || handle?.contains(document?.activeElement)) toggle.focus({ preventScroll: true });
    }
    isOpen = value; container.setAttribute('data-panel-open', String(value)); toggle.setAttribute('aria-expanded', String(value));
    hide(panel, !value); hide(handle, !value); handle?.setAttribute('tabindex', value ? '0' : '-1');
    if (changed) notify();
  }
  function setWidth(value) { alive(); if (!Number.isFinite(value)) throw new Error('Panel width must be a finite number.'); applyWidth(value); }
  listen(toggle, 'click', () => setOpen(!isOpen));
  listen(handle, 'focusin', () => { keyboardStart = currentWidth; });
  listen(handle, 'focusout', () => { keyboardStart = null; });
  listen(handle, 'keydown', event => {
    if (!isOpen || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && (drag || keyboardStart !== null)) {
      event.preventDefault(); event.stopPropagation();
      if (drag) finishDrag(true); else { const start = keyboardStart; keyboardStart = null; applyWidth(start); }
      return;
    }
    if (drag) return;
    const step = event.shiftKey ? 32 : 16, range = limits();
    const next = event.key === 'ArrowLeft' ? currentWidth + step : event.key === 'ArrowRight' ? currentWidth - step : event.key === 'Home' ? range.minimum : event.key === 'End' ? range.maximum : null;
    if (next === null) return;
    keyboardStart ??= currentWidth; event.preventDefault(); applyWidth(next);
  });
  listen(handle, 'pointerdown', event => {
    if (!isOpen || (event.button !== undefined && event.button !== 0) || !Number.isFinite(event.clientX)) return;
    event.preventDefault(); handle.focus({ preventScroll: true });
    drag = { id: event.pointerId, x: event.clientX, width: currentWidth };
    try { handle.setPointerCapture?.(event.pointerId); } catch { /* Document listeners remain available. */ }
  });
  listen(pointerTarget, 'pointermove', event => { if (drag && event.pointerId === drag.id && Number.isFinite(event.clientX)) { event.preventDefault(); applyWidth(drag.width + drag.x - event.clientX); } });
  listen(pointerTarget, 'pointerup', event => { if (drag && event.pointerId === drag.id) finishDrag(); });
  listen(pointerTarget, 'pointercancel', event => { if (drag && event.pointerId === drag.id) finishDrag(true); });
  listen(handle, 'lostpointercapture', event => { if (drag && event.pointerId === drag.id) finishDrag(true); });
  listen(pointerTarget, 'keydown', event => { if (drag && event.key === 'Escape') { event.preventDefault(); finishDrag(true); } });
  const ViewResizeObserver = document?.defaultView?.ResizeObserver ?? globalThis.ResizeObserver;
  const observer = typeof ViewResizeObserver === 'function' ? new ViewResizeObserver(() => { if (!destroyed) applyWidth(currentWidth); }) : null;
  if (observer) observer.observe(container);
  listen(document?.defaultView, 'resize', () => applyWidth(currentWidth));
  applyWidth(width, false); setOpen(open);
  return {
    setOpen, setWidth,
    destroy() {
      if (destroyed) return;
      finishDrag(); destroyed = true; observer?.disconnect();
      for (const [node, type, handler] of listeners) node.removeEventListener(type, handler);
    },
  };
}
