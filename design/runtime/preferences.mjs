/** Shared accessibility adjustments. System palettes retain automatic browser
 * adjustment; these rules restore boundaries and state cues lost with shadows
 * or theme backgrounds. They are not a substitute for assistive-device checks.
 */
export function generatePreferenceCSS(scope = '.ds-scope') {
  if (typeof scope !== 'string' || !/^[.#][a-zA-Z_][a-zA-Z0-9_-]*$/.test(scope)) throw new Error('CSS scope must be a single class or ID selector.');
  const within = selector => `${scope} ${selector}`;
  const buttons = ':is(.ds-signature, .ds-button, .ds-action-button, .ds-segmented-option, .ds-tag, .ds-menubar__item, .ds-menu-item, .ds-tree__action, .ds-tabs__tab, .ds-accordion__summary, .ds-pagination__link, .ds-combobox__clear, .ds-combobox__toggle, .ds-multiselect__clear, .ds-multiselect__toggle, .ds-multiselect__remove, .ds-file-upload__remove, .ds-toast__close)';
  const surfaces = ':is(.ds-card, .ds-dialog, .ds-drawer, .ds-popover, .ds-inspector, .ds-alert, .ds-tooltip, .ds-scroll-area[data-variant="contained"], .ds-tree, .ds-menu, .ds-toolbar, .ds-segmented-control, .ds-accordion__item, .ds-field-group, .ds-combobox__listbox, .ds-multiselect__listbox, .ds-multiselect__chip, .ds-toast, .ds-empty-state, .ds-file-upload__item, .ds-file-upload[data-variant="drop"], .ds-data-table__viewport, .ds-data-table__caption, .ds-data-table__header, .ds-data-table__cell, .ds-data-table__detail, .ds-data-grid__viewport, .ds-data-grid__caption, .ds-data-grid__header, .ds-data-grid__cell)';
  const nativeFields = ':is(.ds-input, .ds-select, .ds-choice-field__control, .ds-textarea__control, .ds-number-input__control, .ds-combobox__control, .ds-multiselect__control, .ds-date-picker__control, .ds-time-picker__control, .ds-file-upload__control, .ds-data-grid__editor)';
  const fields = `:is(${nativeFields}, .ds-switch__track)`;
  const choiceOptions = ':is(.ds-combobox__option, .ds-multiselect__option)';
  const choiceSelected = choiceOptions + '[aria-selected="true"]';
  const choiceActive = choiceOptions + '[data-active="true"]';
  const tableSelected = '.ds-data-table__row[data-state~="selected"] > .ds-data-table__cell';
  const gridSelected = '.ds-data-grid__cell:is([aria-selected="true"], [data-state~="selected"])';
  const selection = ':is([aria-pressed="true"], [aria-selected="true"], [aria-checked="true"], [aria-current]:not([aria-current="false"]), [data-state~="pressed"], [data-state~="selected"], [data-state~="current"])';
  const selected = `${buttons}${selection}, ${within('button'+selection)}, ${within('a'+selection)}, ${within('.ds-tag[data-variant="selected"]')}, ${within('.ds-menubar__item[aria-expanded="true"]')}`;
  const treeSelected = '.ds-tree__item:is([aria-selected="true"], [data-state~="selected"]) > .ds-tree__row';
  const focus = ':is(button, a[href], input, select, textarea, summary, [tabindex]):focus-visible';
  const rule = (selectors, styles) => `${selectors} { ${styles} }`;
  return [
    // Global focus protection must not reveal the native checkbox behind a switch.
    rule(within('.ds-switch > .ds-switch__control:focus-visible'), 'opacity: 0 !important;'),
    '@media (prefers-reduced-motion: reduce) {',
    rule(`${scope}, ${scope} *, ${scope} *::before, ${scope} *::after`, 'animation: none !important; transition: none !important; scroll-behavior: auto !important;'),
    '}',
    '@media (prefers-contrast: more) and (forced-colors: none) {',
    rule(within(fields), 'border-color: var(--ds-color-text-primary) !important; border-width: max(2px, var(--ds-border-width-default, 1px)) !important;'),
    rule(within(buttons), 'border-color: currentColor !important; box-shadow: none !important;'),
    rule(within(nativeFields + '[aria-invalid="true"]'), 'border-style: dashed !important;'),
    rule(within(focus), 'outline-width: max(4px, var(--ds-border-width-focus, 3px)) !important;'),
    rule(within('.ds-switch:has(> .ds-switch__control:focus-visible) > .ds-switch__track'), 'outline-width: max(4px, var(--ds-border-width-focus, 3px)) !important;'),
    rule(`${within(buttons + selection)}, ${within(treeSelected)}`, 'outline: 2px dashed currentColor; outline-offset: -4px;'),
    rule(`${within(choiceSelected)}, ${within(tableSelected)}, ${within(gridSelected)}`, 'outline: 2px dashed currentColor; outline-offset: -4px;'),
    rule(within(choiceActive), 'outline: 3px solid currentColor !important; outline-offset: -4px !important;'),
    '}',
    '@media (forced-colors: active) {',
    rule(scope, 'color: CanvasText !important; background-color: Canvas !important;'),
    rule(within(surfaces), 'color: CanvasText !important; background-color: Canvas !important; background-image: none !important; border-color: CanvasText !important; box-shadow: none !important;'),
    rule(within(buttons), 'color: ButtonText !important; background-color: ButtonFace !important; border-color: ButtonBorder !important; box-shadow: none !important;'),
    rule(within(nativeFields), 'color: FieldText !important; background-color: Field !important; border-color: FieldText !important;'),
    rule(within('.ds-file-upload__control::file-selector-button'), 'color: ButtonText !important; background-color: ButtonFace !important; border-color: ButtonBorder !important;'),
    rule(within(choiceOptions), 'color: CanvasText !important; background-color: Canvas !important; border-color: Canvas !important;'),
    // These native/decorative indicators need a visible extent when fills vanish.
    rule(within('.ds-progress__control'), 'accent-color: auto !important; outline: 1px solid CanvasText; outline-offset: 2px;'),
    rule(within('.ds-skeleton'), 'background-color: Canvas !important; border: 1px solid GrayText !important;'),
    rule(within('.ds-spinner__indicator'), 'border-color: currentColor !important; border-right-style: dotted !important;'),
    rule(within('.ds-link[href]'), 'color: LinkText !important;'),
    rule(within('.ds-icon'), 'color: inherit !important;'),
    // A system-color pair survives forced-colors mapping without opting out.
    rule(`${within(selected)}, ${within(treeSelected)}`, 'color: HighlightText !important; background-color: Highlight !important; border-color: Highlight !important; outline: 1px dashed Highlight; outline-offset: -4px;'),
    rule(`${within(choiceSelected)}, ${within(tableSelected)}, ${within(gridSelected)}`, 'color: HighlightText !important; background-color: Highlight !important; border-color: Highlight !important;'),
    rule(within(tableSelected + ' :is(.ds-text, .ds-heading, .ds-link)'), 'color: inherit !important;'),
    // Active descendant navigation stays visible while focus remains on input.
    rule(within(choiceActive), 'outline: 2px solid CanvasText !important; outline-offset: -4px !important;'),
    rule(within(choiceSelected + '[data-active="true"]'), 'outline-color: HighlightText !important;'),
    rule(within(choiceOptions + '[aria-disabled="true"]'), 'color: GrayText !important; background-color: Canvas !important; border-color: GrayText !important;'),
    rule(within(choiceSelected + '[aria-disabled="true"]'), 'outline: 2px dashed GrayText !important; outline-offset: -4px !important;'),
    rule(within('.ds-file-upload[data-drag-state="over"]'), 'outline: 3px dashed Highlight !important; outline-offset: 2px !important;'),
    rule(`${within('.ds-button' + selection + ' > .ds-button__description')}, ${within('.ds-menu-item' + selection + ' > .ds-menu-item__shortcut')}`, 'color: inherit !important;'),
    // Selected tree rows do not change the palette of nested rows or actions.
    rule(`${within('.ds-tree__row > .ds-tree__label')}, ${within('.ds-tree__row > .ds-tree__toggle')}`, 'color: inherit !important; background-color: transparent !important;'),
    rule(`${within(treeSelected + ' > .ds-tree__meta')}, ${within(treeSelected + ' > .ds-tree__badge')}`, 'color: inherit !important; background-color: transparent !important;'),
    // The switch keeps its native checkbox for input, and its visible track.
    rule(within('.ds-switch > .ds-switch__control'), 'opacity: 0 !important;'),
    rule(within('.ds-switch__track'), 'background-color: Canvas !important; border-color: CanvasText !important;'),
    rule(within('.ds-switch__thumb'), 'background-color: CanvasText !important;'),
    rule(within('.ds-switch:has(> .ds-switch__control:checked) > .ds-switch__track'), 'background-color: Highlight !important; border-color: Highlight !important;'),
    rule(within('.ds-switch:has(> .ds-switch__control:checked) > .ds-switch__track > .ds-switch__thumb'), 'background-color: HighlightText !important;'),
    rule(`${within(buttons + ':is(:disabled, [aria-disabled="true"])')}, ${within(nativeFields + ':disabled')}`, 'color: GrayText !important; border-color: GrayText !important; opacity: 1 !important;'),
    rule(`${within('.ds-checkbox__control:disabled')}, ${within('.ds-radio:has(> :disabled)')}, ${within('.ds-switch:has(> :disabled)')}`, 'opacity: 1 !important;'),
    rule(`${within('.ds-checkbox:has(> :disabled) .ds-checkbox__label')}, ${within('.ds-radio:has(> :disabled) .ds-radio__label')}, ${within('.ds-switch:has(> :disabled) .ds-switch__label')}`, 'color: GrayText !important;'),
    rule(within('.ds-switch:has(> :disabled) > .ds-switch__track'), 'border-color: GrayText !important;'),
    rule(within(nativeFields + '[aria-invalid="true"]'), 'border-style: dashed !important;'),
    rule(within(focus), 'outline: max(3px, var(--ds-border-width-focus, 3px)) solid Highlight !important; outline-offset: max(2px, var(--ds-border-offset-focus, 2px)) !important;'),
    // In a selected range, an inset opposite-color ring cannot merge into
    // neighboring selected cells. Editors keep their own native field palette.
    rule(within(gridSelected + ':focus-visible'), 'outline: max(3px, var(--ds-border-width-focus, 3px)) solid HighlightText !important; outline-offset: -4px !important;'),
    rule(`${within(gridSelected + ' > .ds-data-grid__editor:focus-visible')}, ${within(tableSelected + ' > :is(button, a[href], input, select, textarea):focus-visible')}, ${within(tableSelected + ' > .ds-data-table__tools > :is(button, a[href], input, select, textarea):focus-visible')}`, 'outline-color: HighlightText !important;'),
    rule(within('.ds-switch:has(> .ds-switch__control:focus-visible) > .ds-switch__track'), 'outline: max(3px, var(--ds-border-width-focus, 3px)) solid Highlight !important; outline-offset: max(2px, var(--ds-border-offset-focus, 2px)) !important;'),
    '}',
  ].join('\n');
}
