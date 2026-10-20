//@ts-nocheck
import { useTranslation } from "react-i18next";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { all_routes } from "../../router/all_routes";
import { useCarSearch } from "../../../context/CarSearchContext";
import { useCarResultsSearch } from "../hooks/useCarResultsSearch";
import CarSearch from "../carSearch";
import CarFilter from "../carFilter";
import CarResultsPanel from "../components/CarResultsPanel";
import CarSearchLoader from "../components/CarSearchLoader";
import "../car-list.scss";

const CarList = () => {
  const { t } = useTranslation();
  const routes = all_routes;
  const { loading, hasSearched } = useCarSearch();

  const breadcrumbs = [
    { label: t("carList.title"), link: routes.home1, active: false },
    { label: t("carList.title"), active: false },
    { label: t("carList.breadcrumbList"), active: true },
  ];

  const { awaitingLinkedSearch } = useCarResultsSearch();
  const showResultsLoader = loading || !hasSearched || awaitingLinkedSearch;

  return (
    <div className="yt-car-list-page">
      <Breadcrumb
        title={t("carList.title")}
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-car-list"
      />
      <div className="yt-car-list-body content bg-details-luxe">
        {showResultsLoader ? <CarSearchLoader scoped /> : null}
        <div className="container yt-car-list-container">
          <div className="yt-car-search-wrap">
            <CarSearch showCategories={false} page="listing" />
          </div>

          <div className="row yt-car-layout-row">
            <CarFilter />
            <div className="col-xl-9 col-lg-8">
              <CarResultsPanel
                layout="list"
                activeView="list"
                inlineLoader={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarList;
