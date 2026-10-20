import { useState } from "react";
import api from "@/tockenapi/api";

export type CouponAppliedResult = {
  code: string;
  discount: number;
  finalAmount: number;
};

type Props = {
  type: "FLIGHT" | "HOTEL" | "CAR" | "CRUISE";
  amount: number;
  currency?: string;
  /** Called with the applied coupon when validation succeeds. */
  onApplied: (result: CouponAppliedResult) => void;
  /** Called when the customer removes an applied coupon. */
  onRemoved: () => void;
};

/**
 * Reusable checkout coupon field. Calls the public preview endpoint to show the
 * discount before payment. The applied code is passed to the payment call, where
 * the server re-validates and is authoritative.
 */
const CouponInput = ({ type, amount, currency, onApplied, onRemoved }: Props) => {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/api/coupons/validate", {
        code: trimmed,
        type,
        amount,
        currency,
      });
      const d = res.data?.data;
      if (d?.valid) {
        setApplied({ code: trimmed, discount: d.discount });
        onApplied({ code: trimmed, discount: d.discount, finalAmount: d.finalAmount });
      } else {
        setError(d?.reason || "This coupon can't be applied.");
      }
    } catch {
      setError("Could not validate the coupon. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setCode("");
    setError("");
    onRemoved();
  };

  if (applied) {
    return (
      <div className="d-flex align-items-center justify-content-between border rounded p-2">
        <span className="text-success fw-semibold">
          Coupon {applied.code} applied — you saved {applied.discount}
          {currency ? ` ${currency}` : ""}
        </span>
        <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={remove}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
        />
        <button type="button" className="btn btn-primary" onClick={apply} disabled={busy}>
          {busy ? "Applying…" : "Apply"}
        </button>
      </div>
      {error && <small className="text-danger d-block mt-1">{error}</small>}
    </div>
  );
};

export default CouponInput;
