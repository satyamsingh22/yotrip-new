const PAYMENT_METHODS = [
  { src: "/visa.jpeg", alt: "Visa" },
  { src: "/master_card.jpeg", alt: "Mastercard" },
  { src: "/american_express.jpeg", alt: "American Express" },
  { src: "/apple_pay.jpeg", alt: "Apple Pay" },
  { src: "/smasamg_pay.jpeg", alt: "Samsung Pay" },
  { src: "/csio_mada.jpeg", alt: "mada" },
  { src: "/union_pay.jpeg", alt: "UnionPay" },
] as const;

type CcavenuePaymentIconsProps = {
  className?: string;
};

const CcavenuePaymentIcons = ({ className = "" }: CcavenuePaymentIconsProps) => (
  <div
    className={`d-flex align-items-center flex-wrap gap-2 ${className}`.trim()}
    aria-label="Accepted payment methods"
  >
    {PAYMENT_METHODS.map((method) => (
      <span
        key={method.alt}
        className="payment-img d-flex align-items-center justify-content-center flex-shrink-0 rounded border bg-white p-1"
        style={{ width: 52, height: 34 }}
      >
        <img
          src={method.src}
          alt={method.alt}
          className="img-fluid"
          style={{ maxHeight: 26, maxWidth: 46, objectFit: "contain" }}
        />
      </span>
    ))}
  </div>
);

export default CcavenuePaymentIcons;
