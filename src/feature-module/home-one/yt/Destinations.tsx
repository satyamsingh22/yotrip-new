import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../router/all_routes";

// `to` is the IATA code the flight results page searches for (?to=…). There is
// deliberately no origin here: the traveller departs from wherever geo detection
// put them, so printing a fixed "LON → DXB" on the card advertised a route the
// search would never run.
const TAGS = [
  {
    to: "DXB",
    key: "dubai",
    img: "/assets/img/destination/destination-dubai.jpg",
  },
  {
    to: "IST",
    key: "istanbul",
    img: "/assets/img/destination/destination-istanbul.jpg",
  },
  {
    to: "MLE",
    key: "maldives",
    img: "/assets/img/destination/destination-maldives.jpg",
  },
  {
    to: "KUL",
    key: "kualaLumpur",
    img: "/assets/img/destination/destination-kuala-lumpur.jpg",
  },
] as const;

/** Category glyph on each card chip (mock: plane, landmark, palm, cutlery). */
const TagIcon = ({ kind }: { kind: string }) => {
  const common = { width: 15, height: 15, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (kind === "istanbul")
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 2 3 7v2h18V7zM5 11v7h2v-7zm4 0v7h2v-7zm4 0v7h2v-7zm4 0v7h2v-7zM3 20v2h18v-2z" />
      </svg>
    );
  if (kind === "maldives")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 21V10M12 10C10 6 6 5 3 6c3 0 6 2 9 4zm0 0c2-4 6-5 9-4-3 0-6 2-9 4zM12 10c-1-3-1-6 1-8M7 21h10" />
      </svg>
    );
  if (kind === "kualaLumpur")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 4-3 7h3v11" />
      </svg>
    );
  return (
    <svg {...common} fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  );
};

const Destinations = () => {
  const { t } = useTranslation();

  return (
    <section className="section section--dest">
      <div className="wrap wrap--wide">
        <div className="dest-head rv" data-aos="fade-up">
          <div>
            <span className="sec-eyebrow">{t("destinations.eyebrow")}</span>
            <h2>
              {t("destinations.titleLead")}{" "}
              <span className="dest-head__accent">{t("destinations.titleAccent")}</span>
            </h2>
            <p>{t("destinations.subNew")}</p>
          </div>
          <svg className="dest-head__trail" viewBox="0 0 380 80" aria-hidden>
            <path d="M4 66 C 70 20, 130 80, 200 46 S 300 30, 330 30" />
            <path className="dest-head__plane" d="M330 18 l26 -8 -8 26 -6 -10 -12 -8z" />
          </svg>
          <Link to={all_routes.flightList} className="dest-head__more">
            {t("destinations.exploreAll")}
          </Link>
        </div>

        <div className="dest-grid">
          {TAGS.map((tag, i) => (
            <Link
              key={tag.to}
              className="dest-card rv"
              data-aos="fade-up"
              data-aos-delay={i * 80}
              to={`${all_routes.flightList}?to=${tag.to}`}
              aria-label={`${t(`destinations.${tag.key}.city`)} — ${t("destinations.searchFlights")}`}
            >
              <span
                className="dest-card__img"
                style={{ backgroundImage: `url(${tag.img})` }}
                aria-hidden
              />
              <span className="dest-card__badge">
                <TagIcon kind={tag.key} />
                {t(`destinations.${tag.key}.tag`)}
              </span>
              <span className="dest-card__body">
                <span className="dest-card__city">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  {t(`destinations.${tag.key}.city`)}
                </span>
                <span className="dest-card__note">
                  {t(`destinations.${tag.key}.note`)}
                </span>
              </span>
              <span className="dest-card__go" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
