import { useEffect, useState } from "react";

type Props = { onExpire: () => void };

const PriceHoldTimer = ({ onExpire }: Props) => {
  const getRemaining = () => {
    const exp = Number(sessionStorage.getItem("priceHoldExpiry") || 0);
    return Math.max(0, exp - Date.now());
  };
  const [remaining, setRemaining] = useState<number>(getRemaining);

  useEffect(() => {
    const id = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(id);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onExpire]);

  const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  const warn = remaining > 0 && remaining <= 60000;

  return (
    <span className={`fw-semibold ${warn ? "text-danger" : ""}`}>
      Price held — Time out in {mm}:{ss}
    </span>
  );
};

export default PriceHoldTimer;
