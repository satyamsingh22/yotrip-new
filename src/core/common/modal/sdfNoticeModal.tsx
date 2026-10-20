import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSdfNotice } from "../../../context/SdfNoticeContext";

export const SDF_PORTAL_URL = "https://airsuvidha.civilaviation.gov.in";
export const SDF_NOTICE_TITLE = "Travelling to India?";
export const SDF_NOTICE_TEXT =
  "Please be informed that all passengers travelling to India are required to complete the Self-Declaration Form (SDF) online prior to travel and present it to Immigration upon arrival in India.";

const SdfNoticeModal = () => {
  const { isOpen, closeNotice } = useSdfNotice();

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNotice();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeNotice]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="sdf-notice-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeNotice}
        >
          <motion.div
            className="sdf-notice-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sdf-notice-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdf-notice-header">
              <span className="sdf-notice-icon">
                <i className="fa-solid fa-plane-departure" />
              </span>
              <h4 id="sdf-notice-title" className="sdf-notice-title">
                {SDF_NOTICE_TITLE}
              </h4>
              <button
                type="button"
                className="sdf-notice-close"
                aria-label="Close"
                onClick={closeNotice}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="sdf-notice-body">
              <p className="sdf-notice-badge">
                Immigration Notice — Mandatory for India arrivals
              </p>
              <p className="sdf-notice-text">{SDF_NOTICE_TEXT}</p>
              <p className="sdf-notice-subtext">
                The form can be completed through the Air Suvidha portal.
              </p>
            </div>

            <div className="sdf-notice-footer">
              <a
                className="sdf-notice-cta"
                href={SDF_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Air Suvidha Portal
              </a>
              <button
                type="button"
                className="sdf-notice-dismiss"
                onClick={closeNotice}
              >
                Got it, thanks
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SdfNoticeModal;
