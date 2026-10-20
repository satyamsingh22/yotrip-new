import { useTranslation } from "react-i18next";
import { useModal } from "@/context/ModalContext";

const FinalCta = () => {
  const { t } = useTranslation();
  const { openRegister } = useModal();

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cta-final rv" data-aos="fade-up">
          <h2>{t("finalCta.title")}</h2>
          <p>{t("finalCta.sub")}</p>
          <button type="button" onClick={openRegister} className="btn btn-white">
            {t("finalCta.button")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
