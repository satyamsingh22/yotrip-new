import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import VideoModal from '../../home-Two/videoModal';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CarInfo from './carInfo';
import { useCarDetailsData } from '../hooks/useCarDetailsData';

const CarDetailsSkeleton = () => {
  const shimmer = {
    background: "linear-gradient(90deg,#eeeeee 25%,#f5f5f5 50%,#eeeeee 75%)",
    backgroundSize: "800px 100%",
    animation: "car-details-shimmer 1.5s infinite linear",
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-car-details-skeleton", "1");
    style.innerHTML = `
      @keyframes car-details-shimmer {
        0% { background-position: -400px 0 }
        100% { background-position: 400px 0 }
      }
    `;
    if (!document.head.querySelector("[data-car-details-skeleton]")) {
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="content bg-details-luxe">
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-4 gap-3">
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ width: "55%", height: 28, borderRadius: 6, marginBottom: 12, ...shimmer }} />
            <div style={{ width: "70%", height: 16, borderRadius: 6, ...shimmer }} />
          </div>
          <div style={{ width: 140, height: 48, borderRadius: 8, ...shimmer }} />
        </div>
        <div className="row">
          <div className="col-xl-8 mb-4">
            <div style={{ width: "100%", height: 360, borderRadius: 12, marginBottom: 16, ...shimmer }} />
            <div className="d-flex gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 90, height: 70, borderRadius: 8, ...shimmer }} />
              ))}
            </div>
            <div style={{ width: "40%", height: 22, borderRadius: 6, marginBottom: 12, ...shimmer }} />
            <div style={{ width: "100%", height: 14, borderRadius: 6, marginBottom: 8, ...shimmer }} />
            <div style={{ width: "92%", height: 14, borderRadius: 6, marginBottom: 8, ...shimmer }} />
            <div style={{ width: "80%", height: 14, borderRadius: 6, ...shimmer }} />
          </div>
          <div className="col-xl-4">
            <div style={{ width: "100%", height: 420, borderRadius: 12, ...shimmer }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CarDetails = () => {
  const { t } = useTranslation();
  const routes = all_routes
          const {
            loading,
            galleryImages,
            videos,
            lightboxSlides,
            title,
            carClass,
            location,
            vendor,
            vehicle,
            pricing,
            priceLabel,
            dayPriceLabel,
            rentalDays,
            extras,
            modeLabel,
            pickUp,
          } = useCarDetailsData();
          const [showModal, setShowModal] = React.useState(false);
          const videoUrl = videos[0] || '';
        
          const handleOpenModal = () => setShowModal(true);
          const handleCloseModal = () => setShowModal(false);
          const [open, setOpen] = React.useState(false);
          const [open2, setOpen2] = React.useState(false);
        //Breadcrumb Data
        const breadcrumbs = [
            {
                label: t("carList.title"),
                link: routes.home1,
                active: false,
            },
            {
                label: t("carList.title"),
                active: false,
            },
            {
                label: t("carList.breadcrumbDetails"),
                active: true,
            },
        ];
 
  const sliderForRef = useRef<any>(null);
        const sliderNavRef = useRef<any>(null);
        const [navSync, setNavSync] = useState<any>({ sliderFor: null, sliderNav: null });
        const CustomNextArrow = ({  onClick }: any) => (
          <span className="slick-next slick-arrow" onClick={onClick}><i className="fa-solid fa-chevron-down"></i></span>
  
          );
          
          const CustomPrevArrow = ({  onClick }: any) => (
            <span className="slick-prev slick-arrow" onClick={onClick}><i className="fa-solid fa-chevron-up"></i></span>
          );
        useEffect(() => {
            setNavSync({
            sliderFor: sliderNavRef.current,
            sliderNav: sliderForRef.current,
            });
        }, []);
        const sliderNavSettings = {
          slidesToShow: 4,
          slidesToScroll: 1,
          dots: false,
          arrows: true,
          vertical: true,
          draggable:true,
          swipe:true,
          verticalSwiping: true,
          infinite: true,
          nextArrow: <CustomNextArrow />,
          prevArrow: <CustomPrevArrow />,
          focusOnSelect: true,
          asNavFor: navSync.sliderNav,
          responsive: [
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 4,
              },
            },
            {
              breakpoint: 768,
              settings: {
                  slidesToShow: 3,
              },
            },
            {
              breakpoint: 580,
              settings: {
                slidesToShow: 2,
              },
            },
            {
              breakpoint: 0,
              settings: {
                vertical: false,
                slidesToShow: 1,
              },
            },
          ],
        };
        const sliderForSettings = {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            arrows: false,
            fade: true,
            nextArrow: <CustomNextArrow />,
            prevArrow: <CustomPrevArrow />,
            asNavFor: navSync.sliderFor,
          };
          const gallerySettings = {
            infinite: false, // Loop enabled
          speed: 2000, // Matches smartSpeed
          autoplay: false,
          dots: false,
          arrows: false,
          slidesToShow: 6,
          slidesToScroll: 1,
          responsive: [
            {
              breakpoint: 1400,
              settings: {
                slidesToShow: 6,
              },
            },
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: 5,
              },
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 4,
              },
            },
            {
              breakpoint: 576,
              settings: {
                slidesToShow: 3,
              },
            },
            {
              breakpoint: 0,
              settings: {
                slidesToShow: 2,
              },
            },
          ],
          };
  if (loading) {
    return (
      <>
        <Breadcrumb title={t("carList.title")} breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-03" />
        <CarDetailsSkeleton />
      </>
    );
  }

  return (
    <>
    <Breadcrumb title={t("carList.title")} breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-03" />
    <div className="card-top-head bg-details-luxe">
        <div className="container">
            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                <div>
                    <div className="d-flex align-items-center mb-2">
                        <h4 className="d-flex align-items-center flex-wrap fw-bold">{title}</h4>
                        {vendor?.name ? (
                          <span className="badge badge-info badge-xs fs-13 fw-medium ms-2">{vendor.name}</span>
                        ) : null}
                    </div>
                    <div className="d-flex align-items-center flex-wrap row-gap-2">
                        <p className="fs-14 mb-0 me-3 pe-3 border-end d-inline-flex align-items-center"><span><i className="isax isax-smart-car text-primary me-2"></i></span>{carClass}</p>
                        <p className="fs-14 mb-0 me-3 pe-3 border-end"><i className="isax isax-location5 me-2"></i>{location}</p>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                            <p className="fs-14 me-3 mb-0 d-inline-flex align-items-center"><span><i className="isax isax-tick-circle5 text-success me-1"></i></span>{modeLabel}</p>
                            {vehicle?.transmission ? (
                              <p className="fs-14 me-3 mb-0 d-inline-flex align-items-center"><span><i className="isax isax-tick-circle5 text-success me-1"></i></span>{vehicle.transmission}</p>
                            ) : null}
                            {vehicle?.fuelAir ? (
                              <p className="fs-14 mb-0 d-inline-flex align-items-center"><span><i className="isax isax-tick-circle5 text-success me-1"></i></span>{vehicle.fuelAir}</p>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center flex-wrap row-gap-2">
                    <Link to="#" className="btn btn-outline-light btn-icon btn-sm d-flex align-items-center justify-content-center me-2"><i className="isax isax-share"></i></Link>
                    {/* Save is hidden until the wishlist feature ships (feat/wishlist). */}
                    {rentalDays ? (
                      <span className="badge badge-light text-gray-9 badge-md fs-13 fw-medium rounded-pill me-4">Rental: {rentalDays} day{rentalDays > 1 ? "s" : ""}</span>
                    ) : null}
                    <div>
                        <p className="fs-13 fw-medium mb-1">{t("carList.total")}</p>
                        <h5 className="text-primary">{priceLabel} {dayPriceLabel !== "—" ? <span className="fs-14 text-default fw-normal">({dayPriceLabel} {t("carList.perDay")})</span> : null}</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/*  Page Wrapper */}
    <div className="content bg-details-luxe">
        <div className="container">

            <div className="row">
                <div className="col-xl-8">

                    {/*  Slider */}
                    {galleryImages.length > 0 ? (
                    <div>
                        <div className="service-wrap vertical-slicks card border-0 mb-4">
                            <div className="card-body" style={{ background: "#eef3f8" }}>
                                <div className="slider-wrap list-full vertical-slider vertical-slider-two d-flex align-items-center">
                                    <Slider {...sliderNavSettings} ref={sliderNavRef}  className="slider-nav small-slick nav-center" >
                                        {galleryImages.map((src, index) => (
                                          <div key={`thumb-${index}`}>
                                            <ImageWithBasePath src={src} className="img-fluid" alt={`${title} thumbnail ${index + 1}`} />
                                          </div>
                                        ))}
                                    </Slider>
                                    <Slider
                                      {...sliderForSettings}
                                      ref={sliderForRef}
                                      className="slider-for nav-center"
                                    >
                                        {galleryImages.map((src, index) => (
                                          <div className="service-img" key={`main-${index}`}>
                                            <ImageWithBasePath src={src} className="img-fluid" alt={`${title} image ${index + 1}`} />
                                          </div>
                                        ))}
                                    </Slider>
                                    <Link to="#" onClick={()=>setOpen2(true)} className="btn btn-white btn-xs view-btn"><i className="isax isax-image me-1"></i>See All</Link>
                                    <Lightbox
                                        open={open2}
                                        close={() => setOpen2(false)}
                                        slides={lightboxSlides}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    ) : null}
                    {/*  /Slider */}
                    <ul id="list-example" className="active-tab-list d-flex align-items-center flex-wrap mb-4">
                        <li><Link to="#field_one" className="btn active">Description</Link></li>
                        <li><Link to="#field_two" className="btn">Specification</Link></li>
                        <li><Link to="#field_three" className="btn">Services</Link></li>
                        <li><Link to="#field_four" className="btn">Gallery</Link></li>
                        <li><Link to="#field_five" className="btn">Video</Link></li>
                        <li><Link to="#field_six" className="btn">Features</Link></li>
                        <li><Link to="#field_eight" className="btn">FAQ</Link></li>
                    </ul>
                    <div className="accordion custom-accordion" data-bs-spy="scroll" data-bs-target="#list-example" data-bs-offset="0" tabIndex={0}>
                        <div className="accordion-item mb-4" id="field_three">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_one" aria-expanded="true">
                                    Extra Services
                                </button>
                            </div>
                            <div id="accordion_collapse_one" className="accordion-collapse collapse show">
                                <div className="accordion-body">
                                    <div className="row gy-3">
                                        {extras.length ? extras.map((extra, index) => (
                                          <div className="col-md-6 col-lg-4" key={`${extra.code || "extra"}-${index}`}>
                                            <div className="d-flex align-items-center">
                                              <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-tick-circle fs-16"></i>
                                              </span>
                                              <p>{extra.plan || extra.code || "Extra service"}</p>
                                            </div>
                                          </div>
                                        )) : (
                                          <div className="col-12">
                                            <p className="mb-0 text-muted">No extra services listed for this vehicle.</p>
                                          </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-4" id="field_one">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_two" aria-expanded="true">
                                    Description
                                </button>
                            </div>
                            <div id="accordion_collapse_two" className="accordion-collapse collapse show">
                                <div className="accordion-body">
                                    <p className="mb-2">
                                      {title} from {vendor?.name || "rental partner"}.
                                      {vehicle?.typeLabel ? ` Vehicle type: ${vehicle.typeLabel}.` : ""}
                                      {vehicle?.seats ? ` Seats up to ${vehicle.seats}.` : ""}
                                      {pricing?.mileageAllowance ? ` Mileage allowance: ${pricing.mileageAllowance}.` : ""}
                                    </p>
                                    <p className="mb-0 text-muted">
                                      Pickup at {location}.
                                      {pickUp?.address?.line1 ? ` ${pickUp.address.line1}` : ""}
                                      {pickUp?.address?.city ? `, ${pickUp.address.city}` : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-4" id="field_two">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_three" aria-expanded="true">
                                    Specification
                                </button>
                            </div>
                            <div id="accordion_collapse_three" className="accordion-collapse collapse show">
                                <div className="accordion-body">
                                    <div className="row gy-3">
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-data fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Transmission</h6>
                                                    <span>{vehicle?.transmission || "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-driving fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Mileage</h6>
                                                    <span>{pricing?.mileageAllowance || "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-story fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Vendor</h6>
                                                    <span>{vendor?.name || vendor?.code || "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-car fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Model</h6>
                                                    <span>{vehicle?.makeAndModel || title}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-calendar fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Type</h6>
                                                    <span>{vehicle?.typeLabel || vehicle?.type || "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-weight fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Seats</h6>
                                                    <span>{vehicle?.seats ?? "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-cente">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-car fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Body</h6>
                                                    <span>{vehicle?.bodyType || carClass}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-drop3 fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Fuel / AC</h6>
                                                    <span>{vehicle?.fuelAir || "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-screenmirroring fs-16"></i>
												</span>
                                                <div>
                                                    <h6 className="mb-1">Doors</h6>
                                                    <span>{vehicle?.doors || "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-4" id="field_six">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_six" aria-expanded="true">
                                    Features
                                </button>
                            </div>
                            <div id="accordion_collapse_six" className="accordion-collapse collapse show">
                                <div className="accordion-body">
                                    <div className="row gy-3">
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Multi-zone A/C</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Heated front seats</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Andriod Auto</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Navigation system</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Premium sound system</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Bluetooth</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Keyles Start</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Memory seat</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>6 Cylinders</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Adaptive Control</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>Intermittent wipers</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
													<i className="isax isax-verify fs-16"></i>
												</span>
                                                <p>4 power windows</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-4" id="field_four">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_four" aria-expanded="true">
                                    Gallery
                                </button>
                            </div>
                            <div id="accordion_collapse_four" className="accordion-collapse collapse show">
                            <Lightbox
                            open={open}
                            close={() => setOpen(false)}
                            slides={lightboxSlides}
                        />
                                <div className="accordion-body">
                                    <Slider  {...gallerySettings} className="tour-gallery-slider car-gallery-slick owl-carousel">
                                        {galleryImages.map((src, index) => (
                                          <Link className="galley-wrap" to="#" key={`gallery-${index}`} onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src={src} alt={`${title} gallery ${index + 1}`} />
                                          </Link>
                                        ))}
                                    </Slider>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-4" id="field_five">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_five" aria-expanded="true">
                                    Video
                                </button>
                            </div>
                            <div id="accordion_collapse_five" className="accordion-collapse collapse show">
                                <div className="accordion-body">
                                    {videos.length ? (
                                      <div className="position-relative">
                                        {videos[0].includes("youtube.com") || videos[0].includes("youtu.be") ? (
                                          <>
                                            {galleryImages[0] ? (
                                              <ImageWithBasePath src={galleryImages[0]} className="rounded" alt={title} />
                                            ) : null}
                                            <Link to="#" onClick={handleOpenModal} className="avatar avatar-lg rounded-circle bg-white circle-middle">
                                              <i className="isax isax-play-circle5 fs-24"></i>
                                            </Link>
                                            <VideoModal show={showModal} handleClose={handleCloseModal} videoUrl={videoUrl} />
                                          </>
                                        ) : (
                                          <video controls className="w-100 rounded" poster={galleryImages[0] || undefined}>
                                            <source src={videos[0]} />
                                            Your browser does not support the video tag.
                                          </video>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-muted mb-0">No vehicle video available from the rental provider.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-4" id="field_eight">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_eight" aria-expanded="true">
                                    Frequently Asked Questions
                                </button>
                            </div>
                            <div id="accordion_collapse_eight" className="accordion-collapse collapse show">
                                <div className="accordion-body">
                                    <div className="accordion faq-accordion" id="accordionFaq">
                                        <div className="accordion-item show mb-2">
                                            <div className="accordion-header">
                                                <button className="accordion-button fw-medium" type="button" data-bs-toggle="collapse" data-bs-target="#faq-collapseOne"  aria-controls="faq-collapseOne">
                                                    How old do I need to be to rent a car?
                                                </button>
                                            </div>
                                            <div id="faq-collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">
                                                        We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item mb-2">
                                            <div className="accordion-header">
                                                <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-two"  aria-controls="faq-two">
                                                    What documents do I need to rent a car?
                                                </button>
                                            </div>
                                            <div id="faq-two" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">
                                                        We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item mb-2">
                                            <div className="accordion-header">
                                                <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-three"  aria-controls="faq-three">
                                                    What types of vehicles are available for rent?
                                                </button>
                                            </div>
                                            <div id="faq-three" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">
                                                        We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <div className="accordion-header">
                                                <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-four"  aria-controls="faq-four">
                                                    Can I rent a car with a debit card?
                                                </button>
                                            </div>
                                            <div id="faq-four" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">
                                                        We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item mb-4 mb-xl-0">
                            <div className="accordion-header">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_ten" aria-expanded="true">
                                    Leave A Review
                                </button>
                            </div>
                            <div id="accordion_collapse_ten" className="accordion-collapse collapse show">
                                <div className="accordion-body">
                                    <form >
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Your Rating <span className="text-danger">*</span></label>
                                                    <div className="selection-wrap">
                                                        <div className="d-inline-block">
                                                            <div className="rating-selction">
                                                                <input type="radio" name="rating" defaultValue="5" id="rating05" />
                                                                <label htmlFor="rating05"><i className="fa-solid fa-star"></i></label>
                                                                <input type="radio" name="rating" defaultValue="4" id="rating04" />
                                                                <label htmlFor="rating04"><i className="fa-solid fa-star"></i></label>
                                                                <input type="radio" name="rating" defaultValue="3" id="rating03" />
                                                                <label htmlFor="rating03"><i className="fa-solid fa-star"></i></label>
                                                                <input type="radio" name="rating" defaultValue="2" id="rating02" />
                                                                <label htmlFor="rating02"><i className="fa-solid fa-star"></i></label>
                                                                <input type="radio" name="rating" defaultValue="1" id="rating01" />
                                                                <label htmlFor="rating01"><i className="fa-solid fa-star"></i></label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Name <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Email <span className="text-danger">*</span></label>
                                                    <input type="email" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Write Your Review <span className="text-danger">*</span></label>
                                                    <textarea className="form-control" rows={3}></textarea>
                                                </div>
                                            </div>
                                            <div className="col-md-12 text-center">
                                                <button type="submit" className="btn btn-primary btn-md">
                                                    <i className="isax isax-edit-2 me-1"></i>Submit Review
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4">
                    <CarInfo/>
                </div>
            </div>
        </div>
    </div>
    {/*  /Page Wrapper */}
    </>
  )
}

export default CarDetails