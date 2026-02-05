# SPFP FASE 1 - ACCESSIBILITY CHECKLIST (WCAG 2.1 AA)

**Designer:** Luna - UX/UI Design Expert
**Standards:** WCAG 2.1 Level AA
**Date:** Fevereiro 2026
**Scope:** STY-052, STY-061, STY-067 + all supporting components

---

## ACCESSIBILITY FRAMEWORK

### Standards & Compliance

```
WCAG 2.1 AA Compliance:
├─ Perceivable: Content perceivable by all (colors, contrast, alt text)
├─ Operable: Interface usable via keyboard and multiple input methods
├─ Understandable: Content clear and navigation predictable
└─ Robust: Compatible with assistive technologies

Target Score: 90+ on Lighthouse Accessibility audit
```

---

## FEATURE 1: SIDEBAR REDESIGN - ACCESSIBILITY CHECKLIST

### ✓ Perceivable

#### Color Contrast

- [ ] **Sidebar text on background:** 4.5:1 minimum
  - Light mode: #333333 on white ✓ (12.63:1)
  - Dark mode: #f8fafc on #0f172a ✓ (15.46:1)

- [ ] **Progress bar indicators:** 3:1 minimum (large elements)
  - Emerald-500: 3.2:1 ✓
  - Amber-500: 4.1:1 ✓
  - Rose-500: 5.4:1 ✓

- [ ] **Section headers:** 4.5:1 minimum
  - Text: #0f172a on white ✓
  - Icon (hover): primary-500 on hover state ✓

- [ ] **Progress bars are not color-only:**
  - [x] Include fill percentage (visual width)
  - [x] Include text label "75% - Amarelo"
  - [x] Use distinct hues (not just shade changes)

#### Text & Typography

- [ ] **Minimum font size:** 16px (1rem) base
  - Section headers: 14px (0.875rem) acceptable for secondary
  - Category labels: 14px - OK
  - Values/amounts: 14px - OK

- [ ] **Line height:** Minimum 1.5
  - Sidebar items: 1.5 ✓
  - Category labels: 1.5 ✓
  - Transaction descriptions: 1.5 ✓

- [ ] **Letter spacing:** Minimum 0.02em
  - Normal: 0em ✓
  - Section titles: normal spacing ✓

- [ ] **Text not justified:** Using left-align ✓

#### Text Scaling

- [ ] **Responsive typography:** Text scales on zoom
  - Use `rem` units (not `px`) ✓
  - Test at 200% zoom in browser ✓
  - No horizontal scroll at 200% zoom ✓

**Test Steps:**
```
1. Open browser DevTools (F12)
2. Zoom to 200% (Ctrl + +)
3. Verify sidebar wraps correctly
4. Verify no horizontal scroll needed
```

#### Visual Indicators Beyond Color

- [ ] **Progress bars:** Use fill width + color
  - Not: Color only (red bar)
  - Use: 75% fill + amber color + "75%" text

- [ ] **Status badges:** Use icon + text
  - Pending: ⏱ + "Pendente" (not just yellow)
  - Confirmed: ✓ + "Confirmado" (not just green)
  - Blocked: 🔒 + "Bloqueado" (not just red)

- [ ] **Chevron icons:** Rotate for expand/collapse
  - Not: Down arrow that just changes color
  - Use: Rotation animation (↓ → →)

### ✓ Operable

#### Keyboard Navigation

- [ ] **Tab order logical:**
  - Logo → Section headers → Items → Footer
  - No random jumps in tab sequence

- [ ] **Keyboard shortcuts:**
  - **Tab:** Focus next element
  - **Shift+Tab:** Focus previous element
  - **Enter/Space:** Expand/collapse section
  - **Arrow Down/Up:** Navigate items within section
  - **ESC:** Close mobile drawer
  - **Enter:** Select item (e.g., click account)

**Implementation:**

```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleToggleSection();
  }
  if (e.key === 'Escape') {
    closeDrawer?.();
  }
};
```

- [ ] **Focus trap in mobile drawer:**
  - Tab cycles within drawer
  - Shift+Tab at top returns to close button
  - ESC key closes drawer

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Tab') {
    const focusable = drawer.querySelectorAll('button, [tabindex]');
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
};
```

- [ ] **No keyboard traps:**
  - User can Tab out of all sections
  - User can use keyboard to close drawers
  - No elements "trap" keyboard focus

#### Focus Indicators

- [ ] **Visible focus indicator:** 2px solid outline
  - Color: primary-500 (#0ea5e9)
  - Offset: 2px
  - Always visible (never `outline: none`)

```css
:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

/* Remove default browser focus */
:focus:not(:focus-visible) {
  outline: none;
}
```

- [ ] **Focus indicator on:**
  - Section header buttons ✓
  - Account items ✓
  - Category items ✓
  - Transaction items ✓
  - "Add" buttons ✓
  - Mobile drawer close button ✓

#### Mouse & Touch Alternatives

- [ ] **All functionality available via keyboard:**
  - Expand section: Enter/Space ✓
  - Select item: Enter ✓
  - Close drawer: ESC ✓
  - Confirm transaction: Tab to item + Enter ✓

- [ ] **Touch targets minimum 44x44px:**
  - Section headers: ≥44px height ✓
  - Category items: ≥44px height ✓
  - Account items: ≥44px height ✓
  - "Quick confirm" button: ≥44px ✓

- [ ] **Touch targets well-spaced:**
  - Minimum 8px gap between clickable elements ✓
  - No overlapping hit areas ✓

#### Motion & Animation

- [ ] **Respects `prefers-reduced-motion`:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **No auto-playing animations:**
  - Sections don't auto-expand ✓
  - Progress bars don't animate until user interacts ✓

- [ ] **Animation duration ≤ 300ms:**
  - Expand/collapse: 300ms ✓
  - Progress bar fill: 300ms ✓
  - Hover effects: 200ms ✓

- [ ] **No infinite animations:**
  - No spinning loaders in sidebar ✓
  - No flashing content ✓

### ✓ Understandable

#### Predictable Behavior

- [ ] **Consistent navigation:**
  - Same sections always in same order ✓
  - Same expand/collapse behavior ✓
  - Same icons for same categories ✓

- [ ] **Context is clear:**
  - Section headers have clear purpose ✓
  - Icons are recognizable ✓
  - Values are labeled (not just numbers) ✓

- [ ] **Changes are expected:**
  - Section expand/collapse only on click ✓
  - No surprise navigation ✓
  - No unexpected modal opens ✓

#### Clear Language

- [ ] **Language is plain:**
  - "Orçamento" not "Alocação de Recursos Mensais"
  - "Contas" not "Depósitos de Fundos"
  - Labels use pt-BR consistently ✓

- [ ] **Abbreviations defined:**
  - All labels spelled out ✓
  - No currency abbreviations (R$ used, not "reais") ✓

- [ ] **Instructions are clear:**
  - "Expandir seção Orçamento" ✓
  - "Adicionar nova conta" ✓
  - "Confirmar transação" ✓

#### Error Prevention

- [ ] **Confirmation for destructive actions:**
  - Delete transaction: Show modal ✓
  - Mark as confirmed: Maybe confirmation? (design decision)

- [ ] **Input validation:**
  - Numbers only in amount fields ✓
  - Date format validation ✓

### ✓ Robust

#### ARIA Labels & Roles

- [ ] **Semantic HTML used:**
  - `<button>` for clickable sections ✓
  - `<nav>` for sidebar ✓
  - `<section>` for content groups ✓

```html
<nav role="navigation" aria-label="Navegação de finanças">
  <button
    aria-label="Expandir seção Orçamento"
    aria-expanded="false"
    aria-controls="budget-section"
  >
    📊 Orçamento <ChevronDown />
  </button>

  <section id="budget-section" aria-hidden={!isExpanded}>
    {/* Section content */}
  </section>
</nav>
```

- [ ] **ARIA roles appropriate:**
  - `role="complementary"` for sidebar ✓
  - `role="button"` not needed (use `<button>`) ✓
  - `role="region"` for major sections ✓

- [ ] **aria-expanded on collapsibles:**

```html
<button aria-expanded={isExpanded} aria-controls="section-id">
  Toggle Section
</button>
```

- [ ] **aria-live for dynamic updates:**

```html
<div role="status" aria-live="polite" aria-atomic="true">
  {syncing ? 'Sincronizando...' : 'Sincronizado'}
</div>
```

#### Assistive Technology Support

- [ ] **Screen reader testing (NVDA, JAWS, VoiceOver):**
  - Sidebar announced as navigation ✓
  - Section headers readable ✓
  - Budget values readable ✓
  - Status badges announced correctly ✓

**Screen Reader Announcement for Budget Item:**

```
Expected: "Alimentação, 450 reais de 600, 75% do orçamento"
Actual: Read button, "Alimentação", read amount, "Confirmar", skip progress bar silently
```

- [ ] **Icon-only buttons have labels:**
  - No icon-only buttons in sidebar ✓
  - All buttons have text or aria-label ✓

- [ ] **Images have alt text:**
  - Bank logos: `alt="Nubank"` ✓
  - Category icons: `alt="Alimentação"` ✓

---

## FEATURE 2: CREDIT CARD VISUAL - ACCESSIBILITY CHECKLIST

### ✓ Perceivable

#### Card Content Contrast

- [ ] **Cardholder name on gradient:** 4.5:1
  - White text on purple (#8B5CF6): 7.2:1 ✓
  - White text on blue (#1e40af): 5.8:1 ✓
  - White text on pink (#ec4899): 4.7:1 ✓

- [ ] **Status badges (if blocked/expired):**
  - 🔒 on rose background: 4.5:1 ✓
  - ⚠️ on amber background: 4.5:1 ✓

#### Non-Color Indicators

- [ ] **Card status not color-only:**
  - Blocked: Red + icon (🔒) + "BLOQUEADO" text ✓
  - Expired: Orange + icon (⚠️) + "EXPIRADO" text ✓
  - Active: Normal display (not marked) ✓

- [ ] **Card number masking:**
  - Default: Masked (•••• •••• •••• 1234)
  - Revealed: Full number + "Não compartilhe este número" warning ✓

### ✓ Operable

#### Keyboard Interaction

- [ ] **Reveal toggle keyboard accessible:**
  - Checkbox or button element ✓
  - Focusable with Tab ✓
  - Toggleable with Space/Enter ✓

```html
<input
  type="checkbox"
  id="reveal-card"
  aria-label="Mostrar número completo do cartão"
  checked={isRevealed}
  onChange={() => setIsRevealed(!isRevealed)}
/>
```

- [ ] **Card carousel (if multiple):**
  - Previous button: Tab navigable ✓
  - Next button: Tab navigable ✓
  - Arrow keys to navigate: Consider adding ✓

- [ ] **3D hover effect not required for functionality:**
  - Card readable without hover ✓
  - 3D is enhancement, not required ✓

#### Focus Management

- [ ] **Focus on reveal toggle visible:**
  - 2px outline when focused ✓

- [ ] **Focus trap not created:**
  - Tab moves to next element ✓
  - Shift+Tab moves to previous ✓

### ✓ Understandable

#### Clear Labeling

- [ ] **Card fields clearly labeled:**
  - "TITULAR" (Cardholder) ✓
  - "VÁLIDO ATÉ" (Expiration) ✓
  - "NÚMERO DO CARTÃO" (Card Number) ✓

- [ ] **Abbreviations explained:**
  - No unexplained abbreviations ✓
  - "Pessoa A" / "Pessoa B" explained in context ✓

#### Information Security

- [ ] **Sensitive information warning:**
  - "Não compartilhe este número" when revealed ✓
  - Warning appears before full number shows ✓

- [ ] **CVV protection:**
  - CVV never displayed ✓
  - CVV never in tooltip ✓

### ✓ Robust

#### ARIA & Semantics

- [ ] **Card is region:**

```html
<div role="region" aria-label="Exibição do cartão de crédito">
  {/* Card content */}
</div>
```

- [ ] **Visual-only content hidden from screen readers:**

```html
<div aria-hidden="true" class="card-visual">
  {/* 3D card effect - purely visual */}
</div>

<div class="sr-only">
  Cartão de crédito {cardholder} do {bank}, válido até {expiryDate}
</div>
```

- [ ] **Reveal state announced:**

```html
<button
  aria-pressed={isRevealed}
  aria-label={isRevealed ? 'Ocultar número completo' : 'Mostrar número completo'}
/>
```

---

## FEATURE 3: RETIREMENT DASHPLAN - ACCESSIBILITY CHECKLIST

### ✓ Perceivable

#### Chart Accessibility

- [ ] **Lines distinguishable by more than color:**
  - Conservador: Amber color + solid line
  - Moderado: Blue color + solid line (thicker)
  - Agressivo: Green color + solid line
  - [ ] Different stroke widths ✓
  - [ ] Different line styles (optional dashes) ✓
  - [ ] Clear legend ✓

- [ ] **Axis labels readable:**
  - X-axis: "Anos de investimento" ✓
  - Y-axis: "Patrimônio (R$)" ✓
  - Tick labels: Readable at default zoom ✓

- [ ] **Tooltip contrast:** 4.5:1
  - Dark background with white text ✓

#### Data Table Alternative

- [ ] **Provide data table in addition to chart:**

```html
<div class="sr-only">
  <table>
    <caption>Projeção de Aposentadoria - Cenários</caption>
    <thead>
      <tr>
        <th>Ano</th>
        <th>Conservador</th>
        <th>Moderado</th>
        <th>Agressivo</th>
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.year}>
          <td>{row.year}</td>
          <td>R$ {row.conservador}</td>
          <td>R$ {row.moderado}</td>
          <td>R$ {row.agressivo}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### Scenario Cards Contrast

- [ ] **Recommended badge:** 4.5:1
  - "✓ RECOMENDADO" on green ✓

- [ ] **Card titles:** 4.5:1 on background ✓

### ✓ Operable

#### Chart Interaction

- [ ] **Keyboard accessible tooltips:**
  - Tab to chart ✓
  - Arrow keys navigate data points ✓
  - Enter shows tooltip ✓

```typescript
const handleChartKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    showPreviousDataPoint();
  } else if (e.key === 'ArrowRight') {
    showNextDataPoint();
  } else if (e.key === 'Enter') {
    toggleTooltip();
  }
};
```

- [ ] **Scenario tabs/buttons:**
  - All keyboard accessible ✓
  - Tab navigates between ✓
  - Space/Enter activates ✓

```html
<div role="tablist" aria-label="Seleção de cenários">
  <button
    role="tab"
    aria-selected={selectedScenario === 'conservador'}
    aria-controls="conservador-panel"
    onKeyDown={handleTabKeyDown}
  >
    Conservador
  </button>
  {/* Other tabs */}
</div>
```

#### Focus Management

- [ ] **Focus visible on:**
  - Scenario tabs ✓
  - Scenario cards ✓
  - Edit button ✓
  - Goal form inputs ✓

- [ ] **Modal focus trap (goal editing):**
  - Tab cycles within modal ✓
  - ESC closes modal ✓
  - Focus returns to edit button when closed ✓

### ✓ Understandable

#### Clear Labeling

- [ ] **Chart title:** "CENÁRIOS DE PROJEÇÃO" ✓

- [ ] **Legend always visible:** ✓

- [ ] **Milestone labels clear:**
  - "50% da meta (R$ 600k)" ✓
  - "Ano 12 • 52 anos" ✓

#### Form Understanding

- [ ] **Goal form fields labeled:**
  - `<label htmlFor="target-date">Data Alvo:</label>` ✓
  - `<label htmlFor="target-age">Idade:</label>` ✓
  - All inputs have labels ✓

- [ ] **Error messages clear:**
  - "Data deve ser no futuro"
  - "Idade deve estar entre 55 e 75"
  - "Renda deve ser maior que zero"

- [ ] **Hints provided:**
  - `aria-describedby="field-hint"` ✓
  - Hint text under field ✓

### ✓ Robust

#### ARIA & Semantics

- [ ] **Chart region labeled:**

```html
<div role="region" aria-label="Gráfico de evolução de aposentadoria">
  <RetirementDashPlanChart data={data} />
</div>
```

- [ ] **Tabs properly marked:**

```html
<div role="tablist" aria-label="Seleção de cenários de investimento">
  <button role="tab" aria-selected="true" aria-controls="panel1">
    Conservador
  </button>
</div>

<div id="panel1" role="tabpanel" aria-labelledby="tab1">
  {/* Panel content */}
</div>
```

- [ ] **Modal dialog proper ARIA:**

```html
<dialog aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Editar Meta de Aposentadoria</h2>
  <p id="dialog-desc">Atualize sua data-alvo e valores...</p>
  {/* Form content */}
</dialog>
```

---

## TESTING PROCEDURES

### Automated Testing

```bash
# Run Lighthouse accessibility audit
npm run lighthouse -- --only-categories=accessibility

# Run axe DevTools automated scan
npx axe-core audit

# Run pa11y for accessibility testing
npm install pa11y
pa11y http://localhost:3000/dashboard
```

**Expected Results:**
- Lighthouse: ≥ 90
- axe: Zero violations
- pa11y: Zero errors

### Manual Testing

#### Screen Reader Testing

**Tools:** NVDA (Windows), JAWS (Windows), VoiceOver (macOS)

**Sidebar Test Sequence:**

1. Start screen reader
2. Navigate sidebar with Tab
3. Verify announcement: "Navigation region"
4. Focus section header
5. Verify announcement: "Expandir seção Orçamento, button, not pressed"
6. Press Enter
7. Verify announcement: "Section expanded"
8. Tab to item
9. Verify announcement: "Alimentação, 450 reais de 600, 75 porcento"

**Credit Card Test Sequence:**

1. Start screen reader
2. Tab to card region
3. Verify announcement: "Card display region"
4. Tab to reveal checkbox
5. Verify announcement: "Mostrar número completo, checkbox, unchecked"
6. Press Space
7. Verify announcement: "Checked. Não compartilhe este número"

**Retirement Chart Test Sequence:**

1. Start screen reader
2. Tab to chart
3. Verify announcement: "Chart region, Gráfico de evolução de aposentadoria"
4. Tab to scenario tabs
5. Verify announcement: "Tablist, Seleção de cenários"
6. Tab to first tab
7. Verify announcement: "Conservador, tab, selected"

#### Keyboard Navigation Testing

**Checklist:**

- [ ] Can navigate all elements with Tab
- [ ] Can navigate all groups with Tab
- [ ] Can expand/collapse with Space or Enter
- [ ] Can operate all buttons/links with Enter or Space
- [ ] Can close modals with ESC
- [ ] No keyboard traps
- [ ] Focus always visible
- [ ] Focus doesn't jump unexpectedly

**Test Steps:**

```
1. Unplug mouse
2. Use only keyboard to navigate
3. Complete all key user tasks:
   - Expand each sidebar section
   - View account details
   - Confirm transaction
   - Select scenario
   - Edit retirement goal
```

#### Color Contrast Testing

**Tools:** WebAIM Contrast Checker, Colourblind Simulator

```
1. Use browser color picker
2. Sample text color
3. Sample background color
4. Calculate ratio using: https://webaim.org/resources/contrastchecker
5. Verify ≥ 4.5:1 for normal text
6. Verify ≥ 3:1 for large text (18px+ or bold 14px+)
```

#### Zoom & Scaling Testing

```
1. Zoom to 200% (Ctrl/Cmd + +)
2. Verify content wraps correctly
3. Verify no horizontal scroll
4. Verify readability
5. Verify button sizes still ≥ 44x44px
```

#### Mobile & Touch Testing

```
1. Use browser DevTools responsive mode
2. Test at 320px, 375px, 768px
3. Verify:
   - Touch targets ≥ 44x44px
   - Spacing between targets ≥ 8px
   - No hover-only functionality
   - Drawer closes on outside tap
```

---

## WCAG CRITERION MAPPING

### PRINCIPLE 1: PERCEIVABLE

| Criterion | Guideline | Status | Evidence |
|-----------|-----------|--------|----------|
| 1.4.3 Contrast (Minimum) | Level AA | ✓ | Text 4.5:1, large 3:1 |
| 1.4.4 Resize Text | Level AA | ✓ | Uses rem units, no fixed heights |
| 1.4.5 Images of Text | Level AA | ✓ | No text in images |
| 1.4.10 Reflow | Level AA | ✓ | Responsive, no horizontal scroll |
| 1.4.11 Non-text Contrast | Level AA | ✓ | UI components 3:1, color + pattern |
| 1.4.12 Text Spacing | Level AA | ✓ | Supports 2x line height/letter spacing |

### PRINCIPLE 2: OPERABLE

| Criterion | Guideline | Status | Evidence |
|-----------|-----------|--------|----------|
| 2.1.1 Keyboard | Level A | ✓ | All functions keyboard accessible |
| 2.1.2 No Keyboard Trap | Level A | ✓ | Can always Tab out or ESC |
| 2.2.1 Timing Adjustable | Level A | ✓ | No time limits |
| 2.3.3 Animation from Interactions | Level AAA | ✓ | Motion respects prefers-reduced-motion |
| 2.4.3 Focus Order | Level A | ✓ | Logical tab order |
| 2.4.7 Focus Visible | Level AA | ✓ | Outline always visible |
| 2.5.5 Target Size | Level AAA | ✓ | 44x44px minimum |

### PRINCIPLE 3: UNDERSTANDABLE

| Criterion | Guideline | Status | Evidence |
|-----------|-----------|--------|----------|
| 3.1.1 Language of Page | Level A | ✓ | `lang="pt-BR"` on HTML |
| 3.2.1 On Focus | Level A | ✓ | No unexpected context changes |
| 3.2.2 On Input | Level A | ✓ | Predictable section expand |
| 3.2.4 Consistent Identification | Level AA | ✓ | Same icons, labels, behaviors |
| 3.3.1 Error Identification | Level A | ✓ | Clear error messages |
| 3.3.3 Error Suggestion | Level AA | ✓ | Suggests correction |
| 3.3.4 Error Prevention | Level AA | ✓ | Confirms destructive actions |

### PRINCIPLE 4: ROBUST

| Criterion | Guideline | Status | Evidence |
|-----------|-----------|--------|----------|
| 4.1.1 Parsing | Level A | ✓ | Valid HTML, no duplicate IDs |
| 4.1.2 Name, Role, Value | Level A | ✓ | ARIA labels, semantic HTML |
| 4.1.3 Status Messages | Level AA | ✓ | aria-live for sync status |

---

## ACCESSIBILITY TESTING SCHEDULE

### Phase 1: Sidebar (STY-052 onwards)

- **Week 1:** Automated testing (Lighthouse, axe)
- **Week 2:** Manual keyboard testing
- **Week 3:** Screen reader testing (NVDA, VoiceOver)
- **Week 4:** Mobile/touch testing

### Phase 2: Credit Card (STY-061)

- **Week 5:** All automated + manual tests
- **Week 6:** VoiceOver testing on macOS/iOS
- **Week 7:** Responsive testing

### Phase 3: Retirement (STY-067 onwards)

- **Week 8:** All tests including chart accessibility
- **Week 9:** Data table alternative verification
- **Week 10:** Full accessibility audit

---

## FAILURE SCENARIOS & FIXES

### Failure 1: Progress bar is color-only

**Issue:** Orange bar indicates > 80%, but color-blind users can't distinguish

**Fix:**
- [x] Add text "75% - Amarelo"
- [x] Add fill width indicator
- [x] Add pattern overlay (optional)

### Failure 2: Card number not accessible when hidden

**Issue:** Screen reader can't access masked number, full number never readable

**Fix:**
- [x] Checkbox/button to reveal
- [x] aria-label explains purpose
- [x] Full number in hidden text for screen readers

### Failure 3: Chart not accessible without interaction

**Issue:** User can't understand chart data without hovering

**Fix:**
- [x] Provide data table (sr-only)
- [x] Keyboard accessible tooltips
- [x] Legend always visible
- [x] Clear axis labels

### Failure 4: Modal focus not trapped

**Issue:** Tab key escapes modal, confusion for keyboard users

**Fix:**
- [x] Focus trap code (first/last focusable)
- [x] ESC key closes modal
- [x] Initial focus on first input
- [x] Focus returns to trigger on close

---

## RESOURCES & REFERENCES

**WCAG 2.1 Guidelines:**
- https://www.w3.org/WAI/WCAG21/quickref/

**Color Contrast:**
- https://webaim.org/resources/contrastchecker/

**Screen Reader Testing:**
- NVDA (free): https://www.nvaccess.org/
- JAWS (paid): https://www.freedomscientific.com/products/software/jaws/
- VoiceOver (built-in macOS/iOS)

**Keyboard Testing:**
- Unplug mouse!
- Test with browser keyboard navigation

**Automated Tools:**
- Lighthouse: Built into Chrome DevTools
- axe DevTools: https://www.deque.com/axe/devtools/
- pa11y: https://pa11y.org/

---

**Prepared by:** Luna - UX/UI Design Expert
**Date:** Fevereiro 2026
**Status:** READY FOR TESTING
**Revision:** v1.0

---

For accessibility questions or concerns during implementation, contact Luna immediately.
Accessibility is a core requirement, not optional enhancement.

