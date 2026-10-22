import { useEffect, useRef, useState, type ReactNode } from "react";
import type { DisplayStatus } from "./bookingView";

const STATUS_ICON: Record<DisplayStatus, string> = {
  Upcoming: "isax-calendar5",
  Completed: "isax-tick-circle5",
  Cancelled: "isax-close-circle5",
  Pending: "isax-timer-1",
};

const NOTE_ICON: Record<DisplayStatus, string> = {
  Upcoming: "isax-clock",
  Completed: "isax-tick-circle",
  Cancelled: "isax-close-circle",
  Pending: "isax-timer-1",
};

export type MenuAction = {
  label: string;
  icon: string;
  onSelect: () => void;
  disabled?: boolean;
};

/** "⋮" button with a small action menu; closes on outside click or Escape. */
const CardMenu = ({ actions, label }: { actions: MenuAction[]; label: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!actions.length) return null;

  return (
    <div className="ybk-menu" ref={ref}>
      <button
        type="button"
        className="ybk-menu__btn"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <i className="isax isax-more" style={{ transform: "rotate(90deg)" }} />
      </button>
      {open && (
        <ul className="ybk-menu__list" role="menu">
          {actions.map((a) => (
            <li key={a.label} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={a.disabled}
                onClick={() => {
                  setOpen(false);
                  a.onSelect();
                }}
              >
                <i className={`isax ${a.icon}`} />
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Square brand tile: the airline logo when it loads, else a product icon. */
export const CardLogo = ({ src, icon, tone }: { src?: string; icon: string; tone: string }) => {
  const [failed, setFailed] = useState(!src);
  return (
    <span className={`ybk-card__logo ybk-card__logo--${tone}`}>
      {failed ? (
        <i className={`isax ${icon}`} />
      ) : (
        <img src={src} alt="" onError={() => setFailed(true)} />
      )}
    </span>
  );
};

export type InfoItem = { icon: string; label: string; value: ReactNode; sub?: string };

type BookingCardProps = {
  logo: ReactNode;
  title: string;
  subtitle: string[];
  status: DisplayStatus;
  note: string;
  image: string;
  /** The middle row: a route for flights/cars, an address for hotels. */
  route: ReactNode;
  info: InfoItem[];
  people: { label: string; value: string };
  price: string;
  primary: { label: string; busyLabel?: string; busy?: boolean; disabled?: boolean; onClick: () => void };
  secondary?: { kind: "cancel" | "details"; onClick: () => void };
  menu: MenuAction[];
};

export const BookingCard = ({
  logo,
  title,
  subtitle,
  status,
  note,
  image,
  route,
  info,
  people,
  price,
  primary,
  secondary,
  menu,
}: BookingCardProps) => {
  const cancelled = status === "Cancelled";
  const tone = status.toLowerCase();

  return (
    <article className={`ybk-card${cancelled ? " is-cancelled" : ""}`} aria-label={`${title} — ${status}`}>
      <div className="ybk-card__top">
        <div className="ybk-card__head">
          {logo}
          <div className="ybk-card__title">
            <h3>{title}</h3>
            <p>
              {subtitle.filter(Boolean).map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </p>
          </div>
          <div className="ybk-card__status">
            <span className={`ybk-pill ybk-pill--${tone}`}>
              <i className={`isax ${STATUS_ICON[status]}`} />
              {status}
            </span>
            <small className={`ybk-note ybk-note--${tone}`}>
              <i className={`isax ${NOTE_ICON[status]}`} />
              {note}
            </small>
          </div>
        </div>
        <div className="ybk-card__route">{route}</div>
        <div className="ybk-card__media">
          <img src={image} alt="" loading="lazy" />
          {cancelled && <span className="ybk-card__media-tag">Cancelled</span>}
        </div>
        <CardMenu actions={menu} label={`More actions for ${title}`} />
      </div>

      <dl className="ybk-info">
        {info.map((item) => (
          <div className="ybk-info__item" key={item.label}>
            <i className={`isax ${item.icon}`} aria-hidden />
            <div>
              <dt>{item.label}</dt>
              <dd>
                {item.value}
                {item.sub && <small>{item.sub}</small>}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="ybk-card__meta">
        <div className="ybk-meta">
          <span className="ybk-meta__icon" aria-hidden>
            <i className="isax isax-user" />
          </span>
          <div>
            <span className="ybk-meta__label">{people.label}</span>
            <span className="ybk-meta__value">{people.value}</span>
          </div>
        </div>
        <div className="ybk-meta">
          <span className="ybk-meta__icon" aria-hidden>
            <i className="isax isax-empty-wallet" />
          </span>
          <div>
            <span className="ybk-meta__label">Price</span>
            <span className="ybk-meta__value">{price}</span>
          </div>
        </div>
      </div>

      <div className="ybk-card__actions">
        <button
          type="button"
          className="ybk-btn ybk-btn--primary"
          onClick={primary.onClick}
          disabled={primary.disabled || primary.busy}
        >
          <i className="isax isax-document-download" />
          {primary.busy ? primary.busyLabel || "Preparing..." : primary.label}
        </button>
        {secondary?.kind === "cancel" && (
          <button type="button" className="ybk-btn ybk-btn--danger" onClick={secondary.onClick}>
            <i className="isax isax-close-circle" />
            Cancel Booking
          </button>
        )}
        {secondary?.kind === "details" && (
          <button type="button" className="ybk-btn ybk-btn--ghost" onClick={secondary.onClick}>
            <i className="isax isax-eye" />
            View Details
          </button>
        )}
      </div>
    </article>
  );
};

/** DEL ✈ BOM with the duration over a dashed line. */
export const RouteLine = ({
  from,
  fromSub,
  to,
  toSub,
  duration,
  note,
  icon = "isax-airplane5",
}: {
  from: string;
  fromSub?: string;
  to: string;
  toSub?: string;
  duration?: string;
  note?: string;
  icon?: string;
}) => (
  <div className="ybk-route">
    <i className={`isax ${icon} ybk-route__lead`} aria-hidden />
    <div className="ybk-route__end">
      <strong>{from}</strong>
      {fromSub && <span>{fromSub}</span>}
    </div>
    <div className="ybk-route__mid" aria-hidden>
      <span className="ybk-route__dur">{duration}</span>
      <span className="ybk-route__line">
        <i className={`isax ${icon}`} />
      </span>
      {note && <span className="ybk-route__note">{note}</span>}
    </div>
    <div className="ybk-route__end ybk-route__end--to">
      <strong>{to}</strong>
      {toSub && <span>{toSub}</span>}
    </div>
  </div>
);

export type DetailRow = { label: string; value: ReactNode };

export const DetailsModal = ({
  title,
  rows,
  onClose,
}: {
  title: string;
  rows: DetailRow[];
  onClose: () => void;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content ybk-details">
            <div className="ybk-details__head">
              <h5>{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <dl className="ybk-details__rows">
              {rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};
