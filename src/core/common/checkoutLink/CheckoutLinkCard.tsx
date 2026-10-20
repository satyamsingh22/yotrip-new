// Shared UI + loader for the chat assistant's checkout links
// (/flight|hotel|car/<x>-booking/:checkoutId). Each product page loads the link,
// re-prices the selection, then hands off to its normal booking page; this file
// owns the waiting/expired/unavailable states so all three look the same.
import { Link } from "react-router-dom";
import Breadcrumb from "../Breadcrumb/breadcrumb";
import type { CheckoutLinkPhase } from "./checkoutLinkLoader";

type Props = {
  title: string;
  breadcrumbs: { label: string; link?: string; active: boolean }[];
  phase: CheckoutLinkPhase;
  /** e.g. "This fare is no longer available" / "This room is no longer available" */
  unavailableTitle: string;
  searchLabel: string;
  onRetry: () => void;
};

const CheckoutLinkCard = ({ title, breadcrumbs, phase, unavailableTitle, searchLabel, onRetry }: Props) => (
  <div>
    <Breadcrumb title={title} breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-05" />
    <div className="content">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card booking-confirmation text-center p-5" aria-live="polite">
              {phase.kind === "loading" && (
                <>
                  <div className="spinner-border text-primary mb-4" role="status" />
                  <h5>{phase.message}</h5>
                  <p className="text-gray-6 mb-0">This only takes a moment.</p>
                </>
              )}
              {phase.kind === "expired" && (
                <>
                  <i className="isax isax-clock text-warning fs-40 mb-3" />
                  <h5>This link has expired</h5>
                  <p className="text-gray-6">Prices change quickly, so checkout links last 30 minutes.</p>
                  <Link to={phase.searchUrl} className="btn btn-primary mt-3">
                    {searchLabel}
                  </Link>
                </>
              )}
              {phase.kind === "missing" && (
                <>
                  <i className="isax isax-close-circle text-danger fs-40 mb-3" />
                  <h5>We couldn't find this checkout</h5>
                  <p className="text-gray-6">The link may be incomplete. Please search again.</p>
                  <Link to={phase.searchUrl} className="btn btn-primary mt-3">
                    {searchLabel}
                  </Link>
                </>
              )}
              {phase.kind === "unavailable" && (
                <>
                  <i className="isax isax-info-circle text-warning fs-40 mb-3" />
                  <h5>{unavailableTitle}</h5>
                  <p className="text-gray-6">{phase.message}</p>
                  <Link to={phase.searchUrl} className="btn btn-primary mt-3">
                    {searchLabel}
                  </Link>
                </>
              )}
              {phase.kind === "error" && (
                <>
                  <i className="isax isax-close-circle text-danger fs-40 mb-3" />
                  <h5>Something went wrong</h5>
                  <p className="text-gray-6">We couldn't open this checkout. Please try again.</p>
                  <button type="button" className="btn btn-primary mt-3" onClick={onRetry}>
                    Try again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CheckoutLinkCard;
