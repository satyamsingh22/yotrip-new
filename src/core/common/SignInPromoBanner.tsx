import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { useTranslation } from "react-i18next";

type SignInPromoBannerProps = {
  product?: "hotels" | "flights" | "cruise" | "tour";
};

const SignInPromoBanner = ({ product = "hotels" }: SignInPromoBannerProps) => {
  const { t } = useTranslation();
  const { status } = useAuth();
  const { openLogin } = useModal();

  if (status !== "unauthenticated") {
    return null;
  }

  const productKey =
    product === "flights"
      ? "flightList.productFlights"
      : "flightList.productHotels";

  return (
    <div className="bg-info br-10 p-3 pb-2 mb-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap">
        <p className="fs-14 fw-medium mb-2 d-inline-flex align-items-center">
          <i className="isax isax-info-circle me-2" />
          {t("flightList.signInPromo", { product: t(productKey) })}
        </p>
        <button
          type="button"
          className="btn btn-white btn-sm mb-2"
          onClick={() => {
            sessionStorage.setItem("returnUrl", window.location.pathname);
            openLogin();
          }}
        >
          {t("flightList.signIn")}
        </button>
      </div>
    </div>
  );
};

export default SignInPromoBanner;
