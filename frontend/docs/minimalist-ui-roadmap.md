# Xenomorph Park Minimalist UI Roadmap

## 1) Current State (What We Have)

### App shell and layout
- `src/App.tsx` currently acts as the main orchestration layer for rendering, modal state wiring, mobile handling, visual effects, and major page composition.
- The shell is dense: header + toolbar + trends + side panels + grid + footer + many global overlays/modals in one file.

### Styling model
- `src/index.css` defines a sci-fi visual language (neon green glow, heavy gradients, frequent animation classes).
- Tailwind utility classes are mixed heavily with global custom CSS.

### Core systems already present
- Game state and actions: `src/stores/gameStore.ts`
- Domain modules: facilities/species/grid/research/campaign/crisis/tutorial/biome/genetics
- Global UX systems: notifications, keyboard shortcuts, accessibility, floating text, particles, mobile touch controls

## 2) Target Minimalist Architecture

### Product information architecture
Use one game workspace shell with left navigation and route-like sections (can be tab/state driven first):
- `Overview`: high-level park status and alerts
- `Operations`: grid and placement actions
- `Species`: species roster and containment overview
- `Facilities`: build/upgrade/maintenance
- `Research`: research tree and genetics
- `Campaign`: campaign/scenarios/statistics
- `System`: settings, accessibility, controls

### Visual principles
- Keep the sci-fi identity, but reduce effects by default: fewer glows, fewer layered borders, less motion.
- Prioritize hierarchy via spacing and typography over decorative color.
- One primary accent + clear semantic statuses (`ok`, `warning`, `critical`).

### State and composition principles
- `App.tsx` becomes a thin shell.
- Feature modules own their section composition.
- Global overlays (modals/toasts/tutorial/campaign events) move into a dedicated overlay manager.

## 3) Proposed File/Folder Structure (Incremental)

Add these folders without breaking existing features:

- `src/layout/`
- `src/layout/AppShell.tsx`
- `src/layout/TopBar.tsx`
- `src/layout/SidebarNav.tsx`
- `src/layout/ContentFrame.tsx`
- `src/features/overview/OverviewPage.tsx`
- `src/features/operations/OperationsPage.tsx`
- `src/features/species/SpeciesPage.tsx`
- `src/features/facilities/FacilitiesPage.tsx`
- `src/features/research/ResearchPage.tsx`
- `src/features/campaign/CampaignPage.tsx`
- `src/features/system/SystemPage.tsx`
- `src/features/overlays/GlobalOverlays.tsx`
- `src/design/tokens.css`
- `src/design/motion.css`
- `src/design/components.css`

Keep existing components and re-export them through feature-level entry files as migration adapters.

## 4) Design System Plan (Concrete)

### Tokens
Create `src/design/tokens.css` with:
- Color tokens: background/surface/text/border/accent/success/warning/danger
- Space scale: `--space-1` to `--space-8`
- Radius scale: `--radius-sm`, `--radius-md`, `--radius-lg`
- Elevation and focus ring tokens
- Motion tokens: `--motion-fast`, `--motion-base`, `--motion-slow`

### Global styles split
- Move generic styles from `src/index.css` into tokenized files:
- `tokens.css`: variables only
- `motion.css`: animation and reduced-motion behavior
- `components.css`: reusable base classes (`.panel`, `.stat`, `.status-pill`, `.section-title`)

### Component state contract
Standardize UI states for major widgets:
- `loading`
- `empty`
- `error`
- `ready`

Apply first to:
- `src/components/game/GroupedFacilityPanel.tsx`
- `src/components/game/GroupedSpeciesPanel.tsx`
- `src/components/game/GameGrid.tsx`
- `src/components/game/ResourceTrends.tsx`

## 5) System-by-System Mapping

### Operations system
- Keep `GameGrid` central in `OperationsPage`.
- Build controls and selections move into right-side utility rail panels.
- Source files: `src/components/game/GameGrid.tsx`, `src/components/game/GameControls.tsx`, `src/components/game/FacilityPanel.tsx`, `src/components/game/SpeciesPanel.tsx`

### Facilities and species system
- Promote grouped panels as default, classic panels as fallback/legacy.
- Source files: `src/components/game/GroupedFacilityPanel.tsx`, `src/components/game/GroupedSpeciesPanel.tsx`, `src/components/game/FacilityUpgrade.tsx`

### Research and genetics
- Consolidate research tree and genetics entry under one research page.
- Source files: `src/components/game/ResearchTreeView.tsx`, `src/components/game/GeneticModification.tsx`

### Campaign/scenario system
- Move campaign/scenario/stats under `CampaignPage` launcher + overlay stack.
- Source files: `src/components/game/CampaignMode.tsx`, `src/components/game/HistoricalScenarios.tsx`, `src/components/game/CampaignStatistics.tsx`, `src/components/game/CampaignObjectiveTracker.tsx`, `src/components/game/CampaignEventModal.tsx`

### Crisis and notifications
- Keep crisis modal highest priority in overlay manager.
- Source files: `src/components/game/useCrisisManager.tsx`, `src/components/game/CrisisEventModal.tsx`, `src/components/ui/NotificationSystem.tsx`

### Accessibility and mobile
- Preserve and centralize these as shell-level concerns.
- Source files: `src/components/ui/AccessibilityFeatures.tsx`, `src/components/ui/useAccessibilityPreferences.ts`, `src/components/ui/MobileOptimization.tsx`, `src/components/ui/KeyboardShortcuts.tsx`

### Visual feedback systems
- Keep particles/floating text but gate intensity by user setting and reduced motion.
- Source files: `src/components/ui/ParticleSystem.tsx`, `src/components/ui/FloatingText.tsx`, hooks/contexts under `src/components/ui` and `src/contexts`

## 6) Phased Delivery Plan

### Phase 0: Baseline and guardrails (0.5-1 day)
- Add layout and design folders.
- Add `tokens.css` and wire into `src/main.tsx`.
- Define success metrics (layout consistency, contrast, reduced-motion compliance).

### Phase 1: Shell extraction (1-2 days)
- Extract `AppShell`, `TopBar`, `SidebarNav`, `ContentFrame` from `src/App.tsx`.
- Keep existing behavior and state unchanged.
- Result: `App.tsx` mainly composes providers + shell + overlays.

### Phase 2: Page segmentation (2-3 days)
- Create feature pages and move section composition out of `App.tsx`.
- Keep current components; avoid deep rewrites.
- Introduce a simple section state/router.

### Phase 3: Overlay manager (1-2 days)
- Add `GlobalOverlays.tsx` and move all modal wiring there.
- Normalize modal open/close patterns from `useMainToolbar` and campaign/crisis hooks.

### Phase 4: Visual simplification pass (2-3 days)
- Reduce glow/border noise and animation frequency.
- Convert major panels to tokenized base classes.
- Ensure mobile spacing and desktop density are balanced.

### Phase 5: State clarity and UX states (2-3 days)
- Standardize loading/empty/error/ready across key widgets.
- Audit store selectors and heavy re-renders in visible panels.

### Phase 6: Accessibility and QA hardening (1-2 days)
- Keyboard traversal pass for sidebar, top bar, modals, and primary actions.
- Contrast verification and reduced-motion verification.
- Smoke tests update under `test/`.

## 7) Acceptance Criteria
- `src/App.tsx` is reduced to orchestration and is no longer the primary layout file.
- All major systems are reachable via consistent navigation sections.
- Default visual style is minimalist (lower decoration, clearer hierarchy).
- Core pages rely on shared tokens and shell components.
- Accessibility systems remain active and pass manual keyboard and contrast checks.

## 8) Immediate Next Sprint Backlog

1. Create `src/design/tokens.css` and wire it in.
2. Extract `AppShell` and move existing header there.
3. Create a left nav with section state (`overview`, `operations`, `species`, `facilities`, `research`, `campaign`, `system`).
4. Move current central content block into `OperationsPage`.
5. Add `GlobalOverlays.tsx` and migrate modal rendering from `App.tsx`.
6. Remove duplicate/legacy toggles that conflict with the minimalist layout direction.
