import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "./filterDrawer.scss";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Names the dialog for assistive tech and titles the header. */
  title: string;
  /** Override the close control's accessible name (defaults to flight copy). */
  closeAriaLabel?: string;
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Generic slide-in shell. Deliberately knows nothing about filters — it owns
 * the backdrop, the transition, focus and scroll locking, and nothing else.
 *
 * Children are ALWAYS rendered, open or closed. That is the load-bearing
 * decision here, not an oversight: the filter panel stages airline/stop/cabin
 * edits in its own local state, so unmounting it on dismiss would silently
 * throw away a staged selection the user has not applied yet. Keeping it
 * mounted also lets the panel slide rather than pop in, and costs nothing —
 * `inert` keeps a closed drawer out of the tab order without `display: none`,
 * which would do both jobs badly.
 */
const FilterDrawer = ({
  open,
  onClose,
  title,
  closeAriaLabel,
  children,
}: FilterDrawerProps) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // This listener is on `document`, so `stopPropagation()` here only
      // keeps the event from continuing on to `window` — it does NOT stop
      // React's synthetic onKeyDown handlers on ancestor elements (React 19
      // delegates at the root container, which sits earlier in the bubble
      // path and has already run by the time this fires), and it cannot
      // stop another listener added directly on `document` either (e.g. the
      // fare modal, the search panel): those are siblings on the same node,
      // not ancestors, and only `stopImmediatePropagation()` would reach
      // them.
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Focus in on open, back to whatever opened it on close. Reading
  // `document.activeElement` at open time rather than taking a prop keeps the
  // drawer usable from more than one trigger.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement;
      closeRef.current?.focus();
      return;
    }
    const previous = restoreFocusRef.current;
    restoreFocusRef.current = null;
    // Guard on `isConnected`: a re-search can replace the trigger between open
    // and close, and focusing a detached node silently drops focus to <body>.
    // Also guard on `disabled`: if `filtersLoading` flips true while the
    // drawer is open, the Filters button that opened it goes `disabled`, and
    // `.focus()` on a disabled control silently no-ops too — same failure,
    // different cause. Either way, fall back to blurring whatever is
    // currently focused (still inside the closing panel) so focus lands
    // deliberately on <body> rather than staying stuck on a node about to go
    // `inert`. `document.body.focus()` will not do this itself: body has no
    // `tabindex`, so it is only ever a focus target by default, not one an
    // explicit `.focus()` call can steal onto from another focused element.
    const isDisabled =
      previous instanceof HTMLElement &&
      "disabled" in previous &&
      (previous as unknown as { disabled?: boolean }).disabled === true;
    if (previous instanceof HTMLElement && previous.isConnected && !isDisabled) {
      previous.focus();
    } else if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    // Compensate for the scrollbar the lock removes, or the whole page jumps
    // sideways the moment the drawer opens.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`ytf-drawer ${open ? "is-open" : ""}`}
      data-testid="filter-drawer"
    >
      <div
        className="ytf-drawer__backdrop"
        data-testid="filter-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className="ytf-drawer__panel"
        data-testid="filter-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // `inert` alone is enough to pull a closed panel out of the
        // accessibility tree (that's part of what `inert` means per the
        // HTML spec, in every browser this app supports), so `aria-hidden`
        // here would be pure belt-and-suspenders — except it isn't free:
        // `@testing-library/dom`'s `getByRole` excludes anything under an
        // `aria-hidden="true"` ancestor by default, and five pre-existing
        // flightList test suites (predating this drawer) query the filter
        // panel by role without opening it first. Adding `aria-hidden` back
        // would make every one of those queries fail even though the panel
        // is correctly `inert` and correctly invisible (off-screen via
        // `transform`, not `display: none`) either way.
        inert={!open}
        onKeyDown={trapTab}
      >
        <div className="ytf-drawer__head">
          <h5 className="ytf-drawer__title">{title}</h5>
          <button
            ref={closeRef}
            type="button"
            className="ytf-drawer__close"
            onClick={onClose}
            aria-label={closeAriaLabel ?? t("flightList.closeFilters")}
          >
            <i className="isax isax-close-circle" aria-hidden="true" />
          </button>
        </div>
        <div className="ytf-drawer__body">{children}</div>
      </div>
    </div>
  );
};

export default FilterDrawer;
