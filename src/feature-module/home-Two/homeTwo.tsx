import  { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import VideoModal from './videoModal';
import FooterTwo from './footerTwo';
import { DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import BannerCounter from './counter';
import { all_routes } from '../router/all_routes';


const CustomNextArrow = ({ className, onClick }: any) => (
  <div className={`custom-slick-next ${className}`} onClick={onClick} />
);

const CustomPrevArrow = ({ className, onClick }: any) => (
  <div className={`custom-slick-prev ${className}`} onClick={onClick} />
);

const HomeTwo = () => {


  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };

  const routes = all_routes

  const [showModal, setShowModal] = useState(false);
  const videoUrl = 'https://youtu.be/NSAOrGb9orM';

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const sliderForRef = useRef<any>(null);
  const sliderNavRef = useRef<any>(null);
  const [navSync, setNavSync] = useState<any>({ sliderFor: null, sliderNav: null });

  useEffect(() => {
    setNavSync({
      sliderFor: sliderNavRef.current,
      sliderNav: sliderForRef.current,
    });
  }, []);

  const sliderForSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: navSync.sliderFor,
  };

  const sliderNavSettings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    vertical: true,
    dots: false,
    arrows: false,
    focusOnSelect: true,
    verticalSwiping: true,
    asNavFor: navSync.sliderNav,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {},
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

  const imgslideroption = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 2000,
    autoplay: false,
    swipe: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // place Slider
  const placeSlider = {
    infinite: false, // Loop disabled
    speed: 2000, // Match smartSpeed
    autoplay: false,
    dots: false,
    arrows: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Image Carousel
  const ImageCarousel = {
    infinite: true, // Loop enabled
    speed: 2000, // Matches smartSpeed
    autoplay: false,
    dots: true,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Client Slider
  const clientSliderTwo = {
    infinite: true, // Loop enabled
    speed: 2000, // Matches smartSpeed
    autoplay: true,
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

  //Testimonials Slider
  const TestimonialSider = {
    infinite: true, // Loop enabled
    speed: 2000, // Matches smartSpeed
    autoplay: false,
    dots: false,
    arrows: true,
    slidesToShow: 3, // For 1200px and above
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3.5, // Slick does not support fractional slides directly
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  //Blog Slider
  const BlogSlider = {
    infinite: true, // Loop enabled
    speed: 2000, // Matches smartSpeed
    autoplay: false,
    dots: false,
    arrows: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  //Offer Slider
  const OfferSlider = {
    infinite: true, // Loop enabled
    speed: 2000, // Matches smartSpeed
    autoplay: false,
    dots: false,
    arrows: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  //popular Hotel 
  const PopularHotel = {
    infinite: true, // Loop enabled
    speed: 2000, // Matches smartSpeed
    autoplay: false,
    dots: false,
    arrows: false, // No navigation arrows
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const [defaultDate] = useState(dayjs());


  const defaultTime = dayjs('10:30 AM', 'h:mm A');;


  const [flightRadio, setFlightRadio] = useState<string>('oneway');
  const [carRadio, setCarRadio] = useState<string>('same-drop');

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section hero-sec-two">
        <div className="banner-sliders">
          <div className="slider-wrap home-vertical-slider">
            <Slider {...sliderForSettings} ref={sliderForRef} className="slider-fors nav-center">
              <div className="service-img">
                <ImageWithBasePath
                  src="/assets/img/hotels/hotel-slider-01.jpg"
                  className="img-fluid"
                  alt="Slider Img"
                />
              </div>
              <div className="service-img">
                <ImageWithBasePath
                  src="/assets/img/hotels/hotel-slider-02.jpg"
                  className="img-fluid"
                  alt="Slider Img"
                />
              </div>
              <div className="service-img">
                <ImageWithBasePath
                  src="/assets/img/hotels/hotel-slider-03.jpg"
                  className="img-fluid"
                  alt="Slider Img"
                />
              </div>
              <div className="service-img">
                <ImageWithBasePath
                  src="/assets/img/hotels/hotel-slider-04.jpg"
                  className="img-fluid"
                  alt="Slider Img"
                />
              </div>
            </Slider>
            <div className="">
              <Slider {...sliderNavSettings} ref={sliderNavRef} className="slider-nav nav-center">
                <div>
                  <ImageWithBasePath
                    src="/assets/img/hotels/hotel-slider-thumb-01.jpg"
                    className="img-fluid"
                    alt="Slider Img"
                  />
                </div>
                <div>
                  <ImageWithBasePath
                    src="/assets/img/hotels/hotel-slider-thumb-02.jpg"
                    className="img-fluid"
                    alt="Slider Img"
                  />
                </div>
                <div>
                  <ImageWithBasePath
                    src="/assets/img/hotels/hotel-slider-thumb-03.jpg"
                    className="img-fluid"
                    alt="Slider Img"
                  />
                </div>
                <div>
                  <ImageWithBasePath
                    src="/assets/img/hotels/hotel-slider-thumb-04.jpg"
                    className="img-fluid"
                    alt="Slider Img"
                  />
                </div>
              </Slider>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="hero-content py-0 text-start">
            <div className="row align-items-center">
              <div className="col-md-12 mx-auto aos" data-aos="fade-up">
                <div className="banner-content text-start">
                  <h1 className="text-white display-5 mb-2">
                    Experience the Magic: Exclusive Offers from Yotrip
                  </h1>
                  <p className="text-white">
                    Your ultimate destination for all things help you celebrate
                    &amp; remember tour experience.
                  </p>
                  <Link to={routes.hotelGrid} className="btn btn-primary">
                    Explore All Hotels
                  </Link>
                </div>
                <div className="banner-form-tab">
                  <ul className="nav">
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#flight"
                      >
                        <i className="fa-solid fa-plane-up me-2" />
                        Flights
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#Hotels"
                      >
                        <i className="fa-solid fa-hotel me-2" />
                        Hotels
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#Cars"
                      >
                        <i className="fa-solid fa-car me-2" />
                        Cars
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#Cruise"
                      >
                        <i className="fa-solid fa-ship me-2" />
                        Cruise
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#Tour"
                      >
                        <i className="fa-solid fa-camera me-2" />
                        Tour
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="banner-form card mb-0">
                  <div className="card-body">
                    <div>
                      <div className="tab-content">
                        <div className="tab-pane fade " id="flight">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <div className="d-flex align-items-center flex-wrap">
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="Radio"
                                    id="oneway"
                                    onChange={() => setFlightRadio('oneway')}
                                    checked={flightRadio === 'oneway' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="oneway"
                                  >
                                    Oneway
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="Radio"
                                    id="roundtrip"
                                    onChange={() => setFlightRadio('roundtrip')}
                                    checked={flightRadio === 'roundtrip' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="roundtrip"
                                  >
                                    Round Trip
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="Radio"
                                    id="multiway"
                                    defaultValue="multiway"
                                    onChange={() => setFlightRadio('multiway')}
                                    checked={flightRadio === 'multiway' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="multiway"
                                  >
                                    Multi Trip
                                  </label>
                                </div>
                              </div>
                              <h6 className="fw-medium fs-16 mb-2">
                                Millions of cheap flights. One simple search
                              </h6>
                            </div>
                            <div className="normal-trip" style={{ display: flightRadio === 'multiway' ? 'none' : 'block' }}>
                              <div className="d-lg-flex">
                                <div className="d-flex  form-info">
                                  <div className="form-item dropdown">
                                    <div
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"

                                      role="menu"
                                    >
                                      <label className="form-label fs-14 text-default mb-1">
                                        From
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        defaultValue="Newyork"
                                      />
                                      <p className="fs-12 mb-0">
                                        Ken International Airport
                                      </p>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
                                      <div className="input-search p-3 border-bottom">
                                        <div className="input-group">
                                          <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Location"
                                          />
                                          <span className="input-group-text px-2 border-start-0">
                                            <i className="isax isax-search-normal" />
                                          </span>
                                        </div>
                                      </div>
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item dropdown ps-2 ps-sm-3">
                                    <div
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"

                                      role="menu"
                                    >
                                      <label className="form-label fs-14 text-default mb-1">
                                        To
                                      </label>
                                      <h5>Las Vegas</h5>
                                      <p className="fs-12 mb-0">
                                        Martini International Airport
                                      </p>
                                      <span className="way-icon badge badge-primary rounded-pill translate-middle">
                                        <i className="fa-solid fa-arrow-right-arrow-left" />
                                      </span>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
                                      <div className="input-search p-3 border-bottom">
                                        <div className="input-group">
                                          <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Location"
                                          />
                                          <span className="input-group-text px-2 border-start-0">
                                            <i className="isax isax-search-normal" />
                                          </span>
                                        </div>
                                      </div>
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li>
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">
                                      Departure
                                    </label>
                                    <DatePicker
                                      className="form-control datetimepicker"
                                      placeholder="dd/mm/yyyy"
                                      defaultValue={defaultDate}
                                      format="DD-MM-YYYY"
                                    />
                                    <p className="fs-12 mb-0">Monday</p>
                                  </div>
                                  <div className="form-item round-drip" style={{ display: flightRadio === 'roundtrip' ? 'block' : 'none' }}>
                                    <label className="form-label fs-14 text-default mb-1">
                                      Return
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control datetimepicker"
                                      defaultValue="23-10-2024"
                                    />
                                    <p className="fs-12 mb-0">Wednesday</p>
                                  </div>
                                  <div className="form-item dropdown">
                                    <div
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"

                                      role="menu"
                                    >
                                      <label className="form-label fs-14 text-default mb-1">
                                        Travellers and cabin class
                                      </label>
                                      <h5>
                                        4{" "}
                                        <span className="fw-normal fs-14">
                                          Persons
                                        </span>
                                      </h5>
                                      <p className="fs-12 mb-0">1 Adult, Economy</p>
                                    </div>
                                    <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                      <h5 className="mb-3">
                                        Select Travelers &amp; Class
                                      </h5>
                                      <div className="mb-3 border br-10 info-item pb-1">
                                        <h6 className="fs-16 fw-medium mb-2">
                                          Travellers
                                        </h6>
                                        <div className="row">
                                          <div className="col-md-4">
                                            <div className="mb-3">
                                              <label className="form-label text-gray-9 mb-2">
                                                Adults{" "}
                                                <span className="text-default fw-normal">
                                                  ( 12+ Yrs )
                                                </span>
                                              </label>
                                              <BannerCounter />
                                            </div>
                                          </div>
                                          <div className="col-md-4">
                                            <div className="mb-3">
                                              <label className="form-label text-gray-9 mb-2">
                                                Childrens{" "}
                                                <span className="text-default fw-normal">
                                                  ( 2-12 Yrs )
                                                </span>
                                              </label>
                                              <BannerCounter />
                                            </div>
                                          </div>
                                          <div className="col-md-4">
                                            <div className="mb-3">
                                              <label className="form-label text-gray-9 mb-2">
                                                Infants
                                                <span className="text-default fw-normal">
                                                  ( 0-12 Yrs )
                                                </span>
                                              </label>
                                              <BannerCounter />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mb-3 border br-10 info-item pb-1">
                                        <h6 className="fs-16 fw-medium mb-2">
                                          Travellers
                                        </h6>
                                        <div className="d-flex align-items-center flex-wrap">
                                          <div className="form-check me-3 mb-3">
                                            <input
                                              className="form-check-input"
                                              type="radio"
                                              defaultValue="Economy"
                                              name="cabin-class"
                                              id="economy"
                                              defaultChecked
                                            />
                                            <label
                                              className="form-check-label"
                                              htmlFor="economy"
                                            >
                                              Economy
                                            </label>
                                          </div>
                                          <div className="form-check me-3 mb-3">
                                            <input
                                              className="form-check-input"
                                              type="radio"
                                              defaultValue="Economy"
                                              name="cabin-class"
                                              id="premium-economy"
                                            />
                                            <label
                                              className="form-check-label"
                                              htmlFor="premium-economy"
                                            >
                                              Premium Economy
                                            </label>
                                          </div>
                                          <div className="form-check me-3 mb-3">
                                            <input
                                              className="form-check-input"
                                              type="radio"
                                              defaultValue="Business"
                                              name="cabin-class"
                                              id="business"
                                            />
                                            <label
                                              className="form-check-label"
                                              htmlFor="business"
                                            >
                                              Business
                                            </label>
                                          </div>
                                          <div className="form-check mb-3">
                                            <input
                                              className="form-check-input"
                                              type="radio"
                                              defaultValue="First Class"
                                              name="cabin-class"
                                              id="first-class"
                                            />
                                            <label
                                              className="form-check-label"
                                              htmlFor="first-class"
                                            >
                                              First Class
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="d-flex justify-content-end">
                                        <Link
                                          to="#"
                                          className="btn btn-light btn-sm me-2"
                                        >
                                          Cancel
                                        </Link>

                                        <Link
                                          to={all_routes.flightGrid}
                                          className="btn btn-primary btn-sm"
                                        >
                                          Apply
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Link
                                  to={all_routes.flightGrid}
                                  className="btn btn-primary search-btn rounded"
                                >
                                  Search
                                </Link>
                              </div>
                            </div>
                            <div className="multi-trip" style={{ display: flightRadio === 'multiway' ? 'block' : 'none' }}>
                              <div className="d-lg-flex">
                                <div className="d-flex  form-info">
                                  <div className="form-item dropdown">
                                    <div
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"
                                      role="menu"
                                    >
                                      <label className="form-label fs-14 text-default mb-1">
                                        From
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        defaultValue="Newyork"
                                      />
                                      <p className="fs-12 mb-0">
                                        Ken International Airport
                                      </p>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
                                      <div className="input-search p-3 border-bottom">
                                        <div className="input-group">
                                          <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Location"
                                          />
                                          <span className="input-group-text px-2 border-start-0">
                                            <i className="isax isax-search-normal" />
                                          </span>
                                        </div>
                                      </div>
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item dropdown ps-2 ps-sm-3">
                                    <div
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"
                                      role="menu"
                                    >
                                      <label className="form-label fs-14 text-default mb-1">
                                        To
                                      </label>
                                      <h5>Las Vegas</h5>
                                      <p className="fs-12 mb-0">
                                        Martini International Airport
                                      </p>
                                      <span className="way-icon badge badge-primary rounded-pill translate-middle">
                                        <i className="fa-solid fa-arrow-right-arrow-left" />
                                      </span>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
                                      <div className="input-search p-3 border-bottom">
                                        <div className="input-group">
                                          <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Location"
                                          />
                                          <span className="input-group-text px-2 border-start-0">
                                            <i className="isax isax-search-normal" />
                                          </span>
                                        </div>
                                      </div>
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li>
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">
                                      Departure
                                    </label>
                                    <DatePicker
                                      className="form-control datetimepicker"
                                      placeholder="dd/mm/yyyy"
                                      defaultValue={defaultDate}
                                      format="DD-MM-YYYY"
                                    />
                                    <p className="fs-12 mb-0">Monday</p>
                                  </div>
                                </div>
                                <Link
                                  to={all_routes.flightGrid}
                                  className="btn btn-primary search-btn rounded"
                                >
                                  Search
                                </Link>
                              </div>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade active show" id="Hotels">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <h6 className="fw-medium fs-16 mb-2">
                                Book Hotel - Villas, Apartments &amp; more.
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"
                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      City, Property name or Location
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for City, Property name or Location"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>2000 Properties</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>3000 Properties</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>8000 Properties</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>8000 Properties</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>2000 Properties</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Check In
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Check Out
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"
                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Guests
                                    </label>
                                    <h5>
                                      4{" "}
                                      <span className="fw-normal fs-14">
                                        Persons
                                      </span>
                                    </h5>
                                    <p className="fs-12 mb-0">4 Adult, 2 Rooms</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                    <h5 className="mb-3">
                                      Select Travelers &amp; Class
                                    </h5>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <div className="row">
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Rooms
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Adults
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Children{" "}
                                              <span className="text-default fw-normal">
                                                ( 2-12 Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Infants{" "}
                                              <span className="text-default fw-normal">
                                                ( 0-12 Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Travellers
                                      </h6>
                                      <div className="d-flex align-items-center flex-wrap">
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room1"
                                            defaultChecked
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room1"
                                          >
                                            Single
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room2"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room2"
                                          >
                                            Double
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room3"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room3"
                                          >
                                            Delux
                                          </label>
                                        </div>
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room4"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room4"
                                          >
                                            Suite
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Property Type
                                      </h6>
                                      <div className="d-flex align-items-center flex-wrap">
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property1"
                                            defaultChecked
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property1"
                                          >
                                            Villa
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property2"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property2"
                                          >
                                            Condo
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property3"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property3"
                                          >
                                            Cabin
                                          </label>
                                        </div>
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property4"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property4"
                                          >
                                            Apartments
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <Link
                                        to="#"
                                        className="btn btn-light btn-sm me-2"
                                      >
                                        Cancel
                                      </Link>

                                      <Link
                                        to={all_routes.hotelGrid}
                                        className="btn btn-primary btn-sm"
                                      >
                                        Apply
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Price per Night
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="$1000 - $15000"
                                    />
                                    <p className="fs-12 mb-0">
                                      20 Offers Available
                                    </p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $500 - $2000
                                          </h6>
                                          <p>Upto 65% offers</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Upto 65% offers
                                          </h6>
                                          <p>Upto 40% offers</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $5000 - $8000
                                          </h6>
                                          <p>Upto 35% offers</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $9000 - $11000
                                          </h6>
                                          <p>Upto 20% offers</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $11000 - $15000
                                          </h6>
                                          <p>Upto 10% offers</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              <Link
                                to={all_routes.hotelGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade" id="Cars">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <div className="d-flex align-items-center flex-wrap">
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="same-drop"
                                    defaultValue="same-drop"
                                    onChange={() => setCarRadio('same-drop')}
                                    checked={carRadio === 'same-drop' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="same-drop"
                                  >
                                    Same drop-off
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="different-drop"
                                    defaultValue="different-drop"
                                    onChange={() => setCarRadio('different-drop')}
                                    checked={carRadio === 'different-drop' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="different-drop"
                                  >
                                    Different Drop off
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="airport"
                                    defaultValue="airport"
                                    onChange={() => setCarRadio('airport')}
                                    checked={carRadio === 'airport' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="airport"
                                  >
                                    Airport
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="hourly-drop"
                                    defaultValue="hourly-drop"
                                    onChange={() => setCarRadio('hourly-drop')}
                                    checked={carRadio === 'hourly-drop' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="hourly-drop"
                                  >
                                    Hourly Package
                                  </label>
                                </div>
                              </div>
                              <h6 className="fw-medium fs-16 mb-2">
                                Book Car for rental
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown from-location" style={{ display: carRadio === 'airport' ? 'none' : 'block' }}>
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      From
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for Cars"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>2000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>3000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>6000 Cars</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item dropdown pickup-airport" style={{ display: carRadio === 'airport' ? 'block' : 'none' }}>
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      From
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">
                                      Ken International Airport
                                    </p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for Airport"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Hartsfield-Jackson Atlanta International
                                          </h6>
                                          <p>USA</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Dallas/Fort Worth International
                                          </h6>
                                          <p>USA</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            London Heathrow
                                          </h6>
                                          <p>UK</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Seoul Incheon
                                          </h6>
                                          <p>South Korea</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore Changi International
                                          </h6>
                                          <p>Singapore</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item dropdown to-location ps-2 ps-sm-3" style={{ display: carRadio === 'airport' ? 'block' : 'none' }}>
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      To
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                    <span className="way-icon badge badge-primary rounded-pill translate-middle">
                                      <i className="fa-solid fa-arrow-right-arrow-left" />
                                    </span>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for Cars"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>2000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>3000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>6000 Cars</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Departure
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item return-drop" style={{ display: carRadio === 'different-drop' ? 'block' : 'none' }}>
                                  <label className="form-label fs-14 text-default mb-1">
                                    Return
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Wednesday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Pickup Time
                                  </label>
                                  <TimePicker
                                    use12Hours
                                    defaultValue={defaultTime}
                                    format="h:mm A"
                                    className="form-control timepicker"
                                  />
                                </div>
                                <div className="form-item dropoff-time" style={{ display: carRadio === 'different-drop' ? 'block' : 'none' }}>
                                  <label className="form-label fs-14 text-default mb-1">
                                    Dropoff Time
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control timepicker"
                                    defaultValue="11:45 PM"
                                  />
                                </div>
                                <div className="form-item hourly-time" style={{ display: carRadio === 'hourly-drop' ? 'block' : 'none' }}>
                                  <label className="form-label fs-14 text-default mb-1">
                                    Hours
                                  </label>
                                  <h5>02 Hrs 10 Kms</h5>
                                </div>
                              </div>

                              <Link
                                to={all_routes.carGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade" id="Cruise">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <h6 className="fw-medium fs-16 mb-2">
                                Search For Cruise
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Destination
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search Location"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Newyork
                                          </h6>
                                          <p>Ken International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Boston
                                          </h6>
                                          <p>Boston Logan International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Northern Virginia
                                          </h6>
                                          <p>Dulles International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Los Angeles
                                          </h6>
                                          <p>Los Angeles International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Orlando
                                          </h6>
                                          <p>Orlando International Airport</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Start Date
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    End Date
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Travellers &amp; Cabin{" "}
                                    </label>
                                    <h5>
                                      4{" "}
                                      <span className="fw-normal fs-14">
                                        Persons
                                      </span>
                                    </h5>
                                    <p className="fs-12 mb-0">4 Adult, 2 Rooms</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                    <h5 className="mb-3">
                                      Select Travelers &amp; Class
                                    </h5>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Travellers
                                      </h6>
                                      <div className="row">
                                        <div className="col-md-4">
                                          <div className="mb-3">
                                            <label className="form-label text-gray-9 mb-2">
                                              Adults{" "}
                                              <span className="text-default fw-normal">
                                                ( 12+ Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-4">
                                          <div className="mb-3">
                                            <label className="form-label text-gray-9 mb-2">
                                              Childrens{" "}
                                              <span className="text-default fw-normal">
                                                ( 2-12 Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-4">
                                          <div className="mb-3">
                                            <label className="form-label text-gray-9 mb-2">
                                              Infants{" "}
                                              <span className="text-default fw-normal">
                                                ( 0-12 Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Select Cabin
                                      </h6>
                                      <div className="d-flex align-items-center flex-wrap">
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="cabin"
                                            id="cabin1"
                                            defaultChecked
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin1"
                                          >
                                            Solo cabins
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="cabin"
                                            id="cabin2"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin2"
                                          >
                                            Balcony
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            defaultValue="Business"
                                            name="cabin"
                                            id="cabin3"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin3"
                                          >
                                            Oceanview
                                          </label>
                                        </div>
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="cabin"
                                            id="cabin4"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin4"
                                          >
                                            Balcony rooms
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <Link
                                        to="#"
                                        className="btn btn-light btn-sm me-2"
                                      >
                                        Cancel
                                      </Link>

                                      <Link
                                        to={all_routes.cruiseGrid}
                                        className="btn btn-primary btn-sm"
                                      >
                                        Apply
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Link
                                to={all_routes.cruiseGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade" id="Tour">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <h6 className="fw-medium fs-16 mb-2">
                                Search holiday packages &amp; trips
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Where would like to go?
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for City, Property name or Location"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>200 Places</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>300 Places</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>80 Places</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>500 Places</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>150 Places</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Dates
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Check Out
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Wednesday</p>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Travellers
                                    </label>
                                    <h5>
                                      4{" "}
                                      <span className="fw-normal fs-14">
                                        Persons
                                      </span>
                                    </h5>
                                    <p className="fs-12 mb-0">2 Adult</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                    <h5 className="mb-3">Select Travelers</h5>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <div className="row">
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Adult
                                            </label>
                                            <BannerCounter />
                                          </div>
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Childrens{" "}
                                              <span className="text-default fw-normal">
                                                ( 12+ Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Infants{" "}
                                              <span className="text-default fw-normal">
                                                ( 12+ Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <Link
                                        to="#"
                                        className="btn btn-light btn-sm me-2"
                                      >
                                        Cancel
                                      </Link>
                                      <Link
                                        to={all_routes.tourGrid}
                                        className="btn btn-primary btn-sm"
                                      >
                                        Apply
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Link
                                to={all_routes.tourGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Hero Section */}


      {/* Traveling Section */}
      <section className="section traveling-sec">
        <div className="travel-sec-bg">
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-01.svg" className="bg-1" alt="Img" />
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-02.svg" className="bg-2" alt="Img" />
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-03.svg" className="bg-3" alt="Img" />
        </div>
        <div className="container">
          <div className="section-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div>
              <p className="mb-2 fw-medium d-flex align-items-center">
                <span className="text-bar" />
                Featured Categories
              </p>
              <h2>
                Travelers &amp; Preferences<span className="text-primary">.</span>
              </h2>
            </div>
            <div>
              <Link to={routes.hotelGrid} className="btn btn-primary">
                View All
                <i className="isax isax-arrow-right-3 ms-2" />
              </Link>
            </div>
          </div>
          <div className="travelers-slider owl-carousel">
            <Slider {...imgslideroption}>
              <div className="card travelers-card">
                <div className="card-img">
                  <Link to={routes.hotelGrid}>
                    <ImageWithBasePath
                      src="/assets/img/hotels/hotel-25.jpg"
                      className="rounded-top"
                      alt="Img"
                    />
                  </Link>
                  <span className="overlay-icon">
                    <i className="isax isax-building-3" />
                  </span>
                </div>
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="mb-1">
                      <Link to={routes.hotelGrid}>Deluxe Room</Link>
                    </h5>
                    <p>288 Hotels Available</p>
                  </div>
                  <div>
                    <Link to={routes.hotelGrid} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card travelers-card">
                <div className="card-img">
                  <Link to={routes.hotelGrid}>
                    <ImageWithBasePath
                      src="/assets/img/hotels/hotel-26.jpg"
                      className="rounded-top"
                      alt="Img"
                    />
                  </Link>
                  <span className="overlay-icon">
                    <i className="isax isax-buildings-2" />
                  </span>
                </div>
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="mb-1">
                      <Link to={routes.hotelGrid}>Standard Room</Link>
                    </h5>
                    <p>228 Hotels Available</p>
                  </div>
                  <div>
                    <Link to={routes.hotelGrid} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card travelers-card">
                <div className="card-img">
                  <Link to={routes.hotelGrid}>
                    <ImageWithBasePath
                      src="/assets/img/hotels/hotel-27.jpg"
                      className="rounded-top"
                      alt="Img"
                    />
                  </Link>
                  <span className="overlay-icon">
                    <i className="isax isax-building" />
                  </span>
                </div>
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="mb-1">
                      <Link to={routes.hotelGrid}>Suite Room</Link>
                    </h5>
                    <p>248 Hotels Available</p>
                  </div>
                  <div>
                    <Link to={routes.hotelGrid} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card travelers-card">
                <div className="card-img">
                  <Link to={routes.hotelGrid}>
                    <ImageWithBasePath
                      src="/assets/img/hotels/hotel-28.jpg"
                      className="rounded-top"
                      alt="Img"
                    />
                  </Link>
                  <span className="overlay-icon">
                    <i className="isax isax-building-4" />
                  </span>
                </div>
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="mb-1">
                      <Link to={routes.hotelGrid}>Executive Room</Link>
                    </h5>
                    <p>250 Hotels Available</p>
                  </div>
                  <div>
                    <Link to={routes.hotelGrid} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card travelers-card">
                <div className="card-img">
                  <Link to={routes.hotelGrid}>
                    <ImageWithBasePath
                      src="/assets/img/hotels/hotel-29.jpg"
                      className="rounded-top"
                      alt="Img"
                    />
                  </Link>
                  <span className="overlay-icon">
                    <i className="isax isax-buildings4" />
                  </span>
                </div>
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="mb-1">
                      <Link to={routes.hotelGrid}>Family Rooms</Link>
                    </h5>
                    <p>270 Hotels Available</p>
                  </div>
                  <div>
                    <Link to={routes.hotelGrid} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="card travelers-card">
                <div className="card-img">
                  <Link to={routes.hotelGrid}>
                    <ImageWithBasePath
                      src="/assets/img/hotels/hotel-25.jpg"
                      className="rounded-top"
                      alt="Img"
                    />
                  </Link>
                  <span className="overlay-icon">
                    <i className="isax isax-building-3" />
                  </span>
                </div>
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="mb-1">
                      <Link to={routes.hotelGrid}>Deluxe Room</Link>
                    </h5>
                    <p>288 Hotels Available</p>
                  </div>
                  <div>
                    <Link to={routes.hotelGrid} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </Slider>


          </div>
        </div>
      </section>
      {/* /Traveling Section */}


      {/* Support Section */}
      <section className="support-section support-sec-two bg-secondary">
        <div
          className="horizontal-slide d-flex"
          data-direction="left"
          data-speed="slow"
        >
          <div className="slide-list d-flex">
            <div className="support-item">
              <h5>Personalized Itineraries</h5>
            </div>
            <div className="support-item">
              <h5>Comprehensive Planning</h5>
            </div>
            <div className="support-item">
              <h5>Expert Guidance</h5>
            </div>
            <div className="support-item">
              <h5>Local Experience</h5>
            </div>
            <div className="support-item">
              <h5>Customer Support</h5>
            </div>
            <div className="support-item">
              <h5>Sustainability Efforts</h5>
            </div>
            <div className="support-item">
              <h5>Multiple Regions</h5>
            </div>
          </div>
        </div>
      </section>
      {/* /Support Section */}


      {/* Benefit Section */}
      <section className="section benifit-section bg-light-200">
        <div className="container">
          <div className="section-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div>
              <p className="mb-2 fw-medium d-flex align-items-center">
                <span className="text-bar" />
                Trending Hotel
              </p>
              <h2>
                Focusing on Unique Experiences
                <span className="text-primary">.</span>
              </h2>
            </div>
            <div>
              <Link to={routes.hotelGrid} className="btn btn-primary">
                View All Hotels
                <i className="isax isax-arrow-right-3 ms-2" />
              </Link>
            </div>
          </div>
          <div className="place-slider place-nav owl-carousel">
            <Slider {...placeSlider}>
              <div className="place-item mb-4 flex-fill">
                <div className="place-img">
                  <div className="img-slider image-slide owl-carousel nav-center">
                    <Slider {...ImageCarousel}>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-01.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-02.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-03.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                    </Slider>

                  </div>
                  <div className="fav-item" key={1} onClick={() => handleItemClick(1)}>
                    <span className="badge bg-info d-inline-flex align-items-center">
                      <i className="isax isax-ranking me-1" />
                      Trending
                    </span>
                    <Link to="#" className={`fav-icon ${selectedItems[1] ? 'selected' : ''}`}>
                      <i className="isax isax-heart5" />
                    </Link>
                  </div>
                </div>
                <div className="place-content">
                  <div className="d-flex align-items-center mb-1">
                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                      5.0
                    </span>
                    <p className="fs-14">(400 Reviews)</p>
                  </div>
                  <h5 className="mb-1 text-truncate">
                    <Link to={routes.hotelDetails}>Hotel Plaza Athenee</Link>
                  </h5>
                  <p className="d-flex align-items-center mb-2">
                    <i className="isax isax-location5 me-2" />
                    Ciutat Vella, Barcelona
                  </p>
                  <div className="border-top pt-2 mb-2">
                    <h6 className="d-flex align-items-center">
                      Facillities :
                      <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                      <i className="isax isax-scissor me-2 text-primary" />
                      <i className="isax isax-profile-2user me-2 text-primary" />
                      <i className="isax isax-wind-2 me-2 text-primary" />
                      <Link
                        to="#"
                        className="fs-14 fw-normal text-default d-inline-block"
                      >
                        +2
                      </Link>
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-top pt-3">
                    <h5 className="text-primary text-nowrap me-2">
                      $500{" "}
                      <span className="fs-14 fw-normal text-default">/ Night</span>
                    </h5>
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-01.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Beth Williams</p>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="place-item mb-4 flex-fill">
                <div className="place-img">
                  <div className="img-slider image-slide owl-carousel nav-center">
                    <Slider {...ImageCarousel}>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-07.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-08.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-09.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                    </Slider>

                  </div>
                  <div className="fav-item" key={2} onClick={() => handleItemClick(2)}>
                    <span className="badge bg-info d-inline-flex align-items-center">
                      <i className="isax isax-ranking me-1" />
                      Trending
                    </span>
                    <Link to="#"  className={`fav-icon ${selectedItems[2] ? 'selected' : ''}`}>
                      <i className="isax isax-heart5" />
                    </Link>
                  </div>
                </div>
                <div className="place-content">
                  <div className="d-flex align-items-center mb-1">
                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                      4.9
                    </span>
                    <p className="fs-14">(450 Reviews)</p>
                  </div>
                  <h5 className="mb-1 text-truncate">
                    <Link to={routes.hotelDetails}>The Grand Horizon</Link>
                  </h5>
                  <p className="d-flex align-items-center mb-2">
                    <i className="isax isax-location5 me-2" />
                    Deansgate, Manchester
                  </p>
                  <div className="border-top pt-2 mb-2">
                    <h6 className="d-flex align-items-center">
                      Facillities :
                      <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                      <i className="isax isax-scissor me-2 text-primary" />
                      <i className="isax isax-profile-2user me-2 text-primary" />
                      <i className="isax isax-wind-2 me-2 text-primary" />
                      <Link
                        to="#"
                        className="fs-14 fw-normal text-default d-inline-block"
                      >
                        +2
                      </Link>
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-top pt-3">
                    <h5 className="text-primary text-nowrap me-2">
                      $400{" "}
                      <span className="fs-14 fw-normal text-default">/ Night</span>
                    </h5>
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-11.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Kenneth Palmer</p>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="place-item mb-4 flex-fill">
                <div className="place-img">
                  <div className="img-slider image-slide owl-carousel nav-center">
                    <Slider {...ImageCarousel}>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-05.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-06.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-07.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                    </Slider>
                  </div>
                  <div className="fav-item" key={3} onClick={() => handleItemClick(3)}>
                    <span className="badge bg-info d-inline-flex align-items-center">
                      <i className="isax isax-ranking me-1" />
                      Trending
                    </span>
                    <Link to="#"  className={`fav-icon ${selectedItems[3] ? 'selected' : ''}`}>
                      <i className="isax isax-heart5" />
                    </Link>
                  </div>
                </div>
                <div className="place-content">
                  <div className="d-flex align-items-center mb-1">
                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                      4.7
                    </span>
                    <p className="fs-14">(360 Reviews)</p>
                  </div>
                  <h5 className="mb-1 text-truncate">
                    <Link to={routes.hotelDetails}>The Luxe Haven</Link>
                  </h5>
                  <p className="d-flex align-items-center mb-2">
                    <i className="isax isax-location5 me-2" />
                    Oxford Street, London
                  </p>
                  <div className="border-top pt-2 mb-2">
                    <h6 className="d-flex align-items-center">
                      Facillities :
                      <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                      <i className="isax isax-scissor me-2 text-primary" />
                      <i className="isax isax-profile-2user me-2 text-primary" />
                      <i className="isax isax-wind-2 me-2 text-primary" />
                      <Link
                        to="#"
                        className="fs-14 fw-normal text-default d-inline-block"
                      >
                        +2
                      </Link>
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-top pt-3">
                    <h5 className="text-primary text-nowrap me-2">
                      $600{" "}
                      <span className="fs-14 fw-normal text-default">/ Night</span>
                    </h5>
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-09.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Tom Andrews</p>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="place-item mb-4 flex-fill">
                <div className="place-img">
                  <div className="img-slider image-slide owl-carousel nav-center">
                    <Slider {...ImageCarousel}>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-06.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-11.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-12.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                    </Slider>
                  </div>
                  <div className="fav-item" key={4} onClick={() => handleItemClick(4)}>
                    <span className="badge bg-info d-inline-flex align-items-center">
                      <i className="isax isax-ranking me-1" />
                      Trending
                    </span>
                    <Link to="#" className={`fav-icon ${selectedItems[4] ? 'selected' : ''}`}>
                      <i className="isax isax-heart5" />
                    </Link>
                  </div>
                </div>
                <div className="place-content">
                  <div className="d-flex align-items-center mb-1">
                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                      4.5
                    </span>
                    <p className="fs-14">(500 Reviews)</p>
                  </div>
                  <h5 className="mb-1 text-truncate">
                    <Link to={routes.hotelDetails}>The Urban Retreat</Link>
                  </h5>
                  <p className="d-flex align-items-center mb-2">
                    <i className="isax isax-location5 me-2" />
                    Princes Street, Edinburgh
                  </p>
                  <div className="border-top pt-2 mb-2">
                    <h6 className="d-flex align-items-center">
                      Facillities :
                      <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                      <i className="isax isax-scissor me-2 text-primary" />
                      <i className="isax isax-profile-2user me-2 text-primary" />
                      <i className="isax isax-wind-2 me-2 text-primary" />
                      <Link
                        to="#"
                        className="fs-14 fw-normal text-default d-inline-block"
                      >
                        +2
                      </Link>
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-top pt-3">
                    <h5 className="text-primary text-nowrap me-2">
                      $300{" "}
                      <span className="fs-14 fw-normal text-default">/ Night</span>
                    </h5>
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-10.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Robert Cogswell</p>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="place-item mb-4 flex-fill">
                <div className="place-img">
                  <div className="img-slider image-slide owl-carousel nav-center">
                    <Slider {...ImageCarousel}>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-03.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-04.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="slide-images">
                        <Link to={routes.hotelDetails}>
                          <ImageWithBasePath
                            src="/assets/img/hotels/hotel-05.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                      </div>
                    </Slider>
                  </div>
                  <div className="fav-item" key={5} onClick={() => handleItemClick(5)}>
                    <span className="badge bg-info d-inline-flex align-items-center">
                      <i className="isax isax-ranking me-1" />
                      Trending
                    </span>
                    <Link to="#" className={`fav-icon ${selectedItems[5] ? 'selected' : ''}`}>
                      <i className="isax isax-heart5" />
                    </Link>
                  </div>
                </div>
                <div className="place-content">
                  <div className="d-flex align-items-center mb-1">
                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                      4.5
                    </span>
                    <p className="fs-14">(500 Reviews)</p>
                  </div>
                  <h5 className="mb-1 text-truncate">
                    <Link to={routes.hotelDetails}>The Urban Retreat</Link>
                  </h5>
                  <p className="d-flex align-items-center mb-2">
                    <i className="isax isax-location5 me-2" />
                    Princes Street, Edinburgh
                  </p>
                  <div className="border-top pt-2 mb-2">
                    <h6 className="d-flex align-items-center">
                      Facillities :
                      <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                      <i className="isax isax-scissor me-2 text-primary" />
                      <i className="isax isax-profile-2user me-2 text-primary" />
                      <i className="isax isax-wind-2 me-2 text-primary" />
                      <Link
                        to="#"
                        className="fs-14 fw-normal text-default d-inline-block"
                      >
                        +2
                      </Link>
                    </h6>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-top pt-3">
                    <h5 className="text-primary text-nowrap me-2">
                      $300{" "}
                      <span className="fs-14 fw-normal text-default">/ Night</span>
                    </h5>
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-10.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Robert Cogswell</p>
                    </Link>
                  </div>
                </div>
              </div>
            </Slider>

          </div>
          <div className="more-companies-logo">
            <div className="owl-carousel client-slider-two">
              <Slider {...clientSliderTwo}>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-01.svg" alt="img" />
                </div>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-02.svg" alt="img" />
                </div>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-03.svg" alt="img" />
                </div>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-04.svg" alt="img" />
                </div>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-05.svg" alt="img" />
                </div>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-06.svg" alt="img" />
                </div>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-07.svg" alt="img" />
                </div>
                <div className="client-img">
                  <ImageWithBasePath src="/assets/img/clients/client-04.svg" alt="img" />
                </div>
              </Slider>

            </div>
          </div>
        </div>
      </section>
      {/* /Benefit Section */}


      <>
        {/* Offer Section */}
        <section className="section offers-section">
          <div className="offer-sec-bg">
            <ImageWithBasePath src="/assets/img/bg/hotel-bg-02.svg" className="bg-1" alt="Img" />
            <ImageWithBasePath src="/assets/img/bg/hotel-bg-04.svg" className="bg-2" alt="Img" />
          </div>
          <div className="container">
            <div className="offer-sec">
              <div className="offer-slider owl-carousel">
                <Slider {...OfferSlider}>
                  <div className="offer-slider-img">
                    <ImageWithBasePath src="/assets/img/hotels/slider-01.jpg" alt="Img" />
                  </div>
                  <div className="offer-slider-img">
                    <ImageWithBasePath src="/assets/img/hotels/slider-01.jpg" alt="Img" />
                  </div>
                  <div className="offer-slider-img">
                    <ImageWithBasePath src="/assets/img/hotels/slider-01.jpg" alt="Img" />
                  </div>
                </Slider>
              </div>
              <div className="offers-content">
                <div className="row align-items-center">
                  <div className="col-md-6 col-10">
                    <div>
                      <h2 className="text-white mb-2">Seasonal Promotions</h2>
                      <p className="text-white mb-3">
                        Save 20% on stays of three nights or more during summer
                        months, including breakfast for two.
                      </p>
                      <Link to={routes.hotelList} className="btn btn-white text-dark">
                        Explore All Offers
                        <i className="isax isax-arrow-right-3 ms-2" />
                      </Link>
                      <div className="owl-nav slide-nav mt-4" />
                    </div>
                  </div>
                  <div className="col-md-6 col-2">
                    <div className="text-center slider-video-btn">
                      <Link
                        className="video-btn video-effect"
                        to="#"
                        onClick={handleOpenModal}
                      >
                        <i className="isax isax-play5" />
                      </Link>
                      <VideoModal show={showModal} handleClose={handleCloseModal} videoUrl={videoUrl} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="offers-counter bg-white rounded p-2">
              <div className="bg-primary rounded offer-counter-inner">
                <div className="row g-4">
                  <div className="col-lg-4">
                    <div>
                      <h6 className="text-white mb-1">Destinations Worldwide</h6>
                      <h3 className="display-6 text-white">
                        <span className="counter">50</span>+
                      </h3>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div>
                      <h6 className="text-white mb-1">Destinations Worldwide</h6>
                      <h3 className="display-6 text-white">
                        <span className="counter">7000</span>+
                      </h3>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div>
                      <h6 className="text-white mb-1">Destinations Worldwide</h6>
                      <h3 className="display-6 text-white">
                        <span className="counter">89</span>+
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="popular-hotels">
              <div className="section-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <div>
                  <p className="mb-2 fw-medium d-flex align-items-center text-white">
                    <span className="text-bar bg-white" />
                    Popular Hotels
                  </p>
                  <h2 className="text-white">
                    Try Relaxing Accomodations<span className="text-primary">.</span>
                  </h2>
                </div>
                <div>
                  <Link to={routes.hotelGrid} className="btn btn-primary">
                    View All Hotels
                    <i className="isax isax-arrow-right-3 ms-2" />
                  </Link>
                </div>
              </div>
              <div className="popular-hotel-slider owl-carousel">
                <Slider {...PopularHotel}>
                  <div className="card mb-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <Link to={routes.hotelDetails} className="flex-shrink-0 me-3">
                          <ImageWithBasePath
                            src="/assets/img/icons/hotel-logo-01.svg"
                            className="rounded-circle"
                            alt="Img"
                          />
                        </Link>
                        <div>
                          <h5 className="mb-2">
                            <Link to={routes.hotelDetails}>Adventure Suites</Link>
                          </h5>
                          <div className="d-flex align-items-center">
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                              4.9
                            </span>
                            <p>(450 Reviews)</p>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center seperate-dot">
                          <span>Boutique</span>
                          <span>Germany</span>
                        </div>
                        <span className="badge bg-outline-success">15 Rooms Left</span>
                      </div>
                    </div>
                  </div>
                  <div className="card mb-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <Link to={routes.hotelDetails} className="flex-shrink-0 me-3">
                          <ImageWithBasePath
                            src="/assets/img/icons/hotel-logo-02.svg"
                            className="rounded-circle"
                            alt="Img"
                          />
                        </Link>
                        <div>
                          <h5 className="mb-2">
                            <Link to={routes.hotelDetails}>Mystery Manor</Link>
                          </h5>
                          <div className="d-flex align-items-center">
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                              5.0
                            </span>
                            <p>(120 Reviews)</p>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center seperate-dot">
                          <span>Resorts</span>
                          <span>Ukraine</span>
                        </div>
                        <span className="badge bg-outline-success">20 Rooms Left</span>
                      </div>
                    </div>
                  </div>
                  <div className="card mb-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <Link to={routes.hotelDetails} className="flex-shrink-0 me-3">
                          <ImageWithBasePath
                            src="/assets/img/icons/hotel-logo-03.svg"
                            className="rounded-circle"
                            alt="Img"
                          />
                        </Link>
                        <div>
                          <h5 className="mb-2">
                            <Link to={routes.hotelDetails}>Harmony Retreat</Link>
                          </h5>
                          <div className="d-flex align-items-center">
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                              4.9
                            </span>
                            <p>(128 Reviews)</p>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center seperate-dot">
                          <span>Resorts</span>
                          <span>London</span>
                        </div>
                        <span className="badge bg-outline-success">05 Rooms Left</span>
                      </div>
                    </div>
                  </div>
                  <div className="card mb-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <Link to={routes.hotelDetails} className="flex-shrink-0 me-3">
                          <ImageWithBasePath
                            src="/assets/img/icons/hotel-logo-04.svg"
                            className="rounded-circle"
                            alt="Img"
                          />
                        </Link>
                        <div>
                          <h5 className="mb-2">
                            <Link to={routes.hotelDetails}>Tranquil Spa</Link>
                          </h5>
                          <div className="d-flex align-items-center">
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                              5.0
                            </span>
                            <p>(69 Reviews)</p>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center seperate-dot">
                          <span>Hotel</span>
                          <span>Japan</span>
                        </div>
                        <span className="badge bg-outline-success">20 Rooms Left</span>
                      </div>
                    </div>
                  </div>
                </Slider>

              </div>
            </div>
          </div>
        </section>
        {/* /Offer Section */}
      </>



      {/* Travelers Section */}
      <section className="section">
        <div className="container">
          <div className="section-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div>
              <p className="mb-2 fw-medium d-flex align-items-center">
                <span className="text-bar" />
                Popular Destinations
              </p>
              <h2>
                Travelers &amp; Preferences<span className="text-primary">.</span>
              </h2>
            </div>
            <div>
              <Link to={routes.hotelGrid} className="btn btn-primary">
                View All
                <i className="isax isax-arrow-right-3 ms-2" />
              </Link>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="location-wrap location-wrap-two">
                <Link to={routes.hotelGrid}>
                  <ImageWithBasePath src="/assets/img/destination/destination-30.jpg" alt="Img" />
                </Link>
                <div className="loc-name-top">
                  <h5 className="text-white mb-1">Ukraine</h5>
                  <span className="text-white">300 Hotels</span>
                </div>
                <Link to={routes.hotelGrid} className="loc-view-bottom">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="location-wrap location-wrap-two">
                <Link to={routes.hotelGrid}>
                  <ImageWithBasePath src="/assets/img/destination/destination-31.jpg" alt="Img" />
                </Link>
                <div className="loc-name-top">
                  <h5 className="text-white mb-1">Russia</h5>
                  <span className="text-white">458 Hotels</span>
                </div>
                <Link to={routes.hotelGrid} className="loc-view-bottom">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="location-wrap location-wrap-two">
                <Link to={routes.hotelGrid}>
                  <ImageWithBasePath src="/assets/img/destination/destination-32.jpg" alt="Img" />
                </Link>
                <div className="loc-name-top">
                  <h5 className="text-white mb-1">Thailand</h5>
                  <span className="text-white">175 Hotels</span>
                </div>
                <Link to={routes.hotelGrid} className="loc-view-bottom">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            <div className="col-md-6">
              <div className="location-wrap location-wrap-two">
                <Link to={routes.hotelGrid}>
                  <ImageWithBasePath src="/assets/img/destination/destination-33.jpg" alt="Img" />
                </Link>
                <div className="loc-name-top">
                  <h5 className="text-white mb-1">Azerbaijan</h5>
                  <span className="text-white">155 Hotels</span>
                </div>
                <Link to={routes.hotelGrid} className="loc-view-bottom">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            <div className="col-md-6">
              <div className="location-wrap location-wrap-two">
                <Link to={routes.hotelGrid}>
                  <ImageWithBasePath src="/assets/img/destination/destination-34.jpg" alt="Img" />
                </Link>
                <div className="loc-name-top">
                  <h5 className="text-white mb-1">Germany</h5>
                  <span className="text-white">265 Hotels</span>
                </div>
                <Link to={routes.hotelGrid} className="loc-view-bottom">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Travelers Section */}


      {/* Experts Section */}
      <section className="section adavantages-sec bg-light-200">
        <div className="adavantages-sec-bg">
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-01.svg" className="bg-1" alt="Img" />
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-05.svg" className="bg-2" alt="Img" />
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-06.svg" className="bg-3" alt="Img" />
        </div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div>
                <h2 className="mb-2">
                  Where comfort meets elegance and every guest is treated like
                  family.
                </h2>
                <p>
                  Our mission is to create memorable experiences for our guests. We
                  believe that every stay should feel special, whether you’re here
                  for business, leisure, or a special occasion.
                </p>
                <div className="row">
                  <div className="col-md-6">
                    <div className="card border-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <span className="avatar rounded-icon-md rounded-circle bg-primary flex-shrink-0">
                            <i className="isax isax-map5 fs-24" />
                          </span>
                          <div className="ms-3">
                            <h6 className="fs-16 mb-2">Exceptional Service</h6>
                            <p className="text-truncate line-clamb-3">
                              Our dedicated team prioritizes your comfort and
                              satisfaction,
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <span className="avatar rounded-icon-md rounded-circle bg-indigo flex-shrink-0">
                            <i className="isax isax-location-tick5 fs-24" />
                          </span>
                          <div className="ms-3">
                            <h6 className="fs-16 mb-2">Prime Locations</h6>
                            <p className="text-truncate line-clamb-3">
                              Enjoy easy access to local attractions, dining,
                              entertainment.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <span className="avatar rounded-icon-md rounded-circle bg-cyan flex-shrink-0">
                            <i className="isax isax-ticket-star5 fs-24" />
                          </span>
                          <div className="ms-3">
                            <h6 className="fs-16 mb-2">Quality Accommodations</h6>
                            <p className="text-truncate line-clamb-3">
                              Our rooms and facilities are designed with your needs
                              in mind, blending{" "}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <span className="avatar rounded-icon-md rounded-circle bg-teal flex-shrink-0">
                            <i className="isax isax-ticket-star5 fs-24" />
                          </span>
                          <div className="ms-3">
                            <h6 className="fs-16 mb-2">Personalized Experience</h6>
                            <p className="text-truncate line-clamb-3">
                              We tailor our services to meet your preferences,
                              making your stay uniquely.{" "}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Link to={routes.hotelGrid} className="btn btn-primary">
                    <i className="isax isax-calendar5 me-2" />
                    Book a Hotel
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div>
                <div className="section-right-img">
                  <ImageWithBasePath src="/assets/img/section-img.png" alt="Img" />
                  <div className="card review-rate-top border-0 mb-0">
                    <div className="card-body d-flex align-items-center">
                      <div className="avatar-list-stacked avatar-group-md me-2">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-01.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-04.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-06.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-07.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                      <div>
                        <div className="d-flex align-items-center fs-12">
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning me-1" />
                          <p className="fs-14 text-gray-9">5.0</p>
                        </div>
                        <p className="fs-14">2K+ Reviews</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Experts Section */}


      {/* How It Work Section */}
      <section className="section work-section">
        <div className="container">
          <div className="row">
            <div className="col-xxl-3 col-lg-4">
              <div className="section-header">
                <div>
                  <p className="mb-2 fw-medium d-flex align-items-center text-white">
                    <span className="text-bar bg-white" />
                    How it Works
                  </p>
                  <h2 className="text-white">
                    Here’s a simple breakdown of how our services work
                  </h2>
                </div>
              </div>
            </div>
            <div className="col-xxl-9 col-lg-8">
              <div className="row">
                <div className="col-md-4 col-sm-6">
                  <div className="card border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="work-avatar">
                          01<small className="text-primary">.</small>
                        </span>
                        <span className="work-icon d-flex">
                          <i className="isax isax-buildings-25" />
                        </span>
                      </div>
                      <div>
                        <h5 className="mb-2 text-truncate">Search hotels</h5>
                        <p className="text-truncate line-clamb-3">
                          Choose your dates, select your room type, and book
                          directly through our website or by contacting us.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-sm-6">
                  <div className="card border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="work-avatar">
                          02<small className="text-primary">.</small>
                        </span>
                        <span className="work-icon d-flex">
                          <i className="isax isax-calendar-edit5" />
                        </span>
                      </div>
                      <div>
                        <h5 className="mb-2 text-truncate">
                          Booking &amp; Confirmation
                        </h5>
                        <p className="text-truncate line-clamb-3">
                          Upon arrival, check in at our reception. Our friendly
                          staff will guide you through
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-sm-6">
                  <div className="card border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="work-avatar">
                          03<small className="text-primary">.</small>
                        </span>
                        <span className="work-icon d-flex">
                          <i className="isax isax-direct-send5" />
                        </span>
                      </div>
                      <div>
                        <h5 className="mb-2">Enjoy Your Stay</h5>
                        <p className="text-truncate line-clamb-3">
                          Explore our amenities, dining options, and local
                          attractions &amp; Many More
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /How It Work Section */}


      {/* Testimonial Section */}
      <section className="section testimonial-section testi-sec-two bg-white">
        <div className="testi-sec-bg">
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-03.svg" className="bg-1" alt="Img" />
        </div>
        <div className="container">
          <div className="section-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div>
              <p className="mb-2 fw-medium d-flex align-items-center">
                <span className="text-bar" />
                What’s Our User Says
              </p>
              <h2>
                Committed to Helping Our Clients Succeed
                <span className="text-primary">.</span>
              </h2>
            </div>
            <div>
              <Link to={routes.Testimonials} className="btn btn-primary">
                View All
                <i className="isax isax-arrow-right-3 ms-2" />
              </Link>
            </div>
          </div>
          <div className="owl-carousel testimonial-slider">
            <Slider  {...TestimonialSider}>
              {/* Testimonial Item*/}
              <div className="card border-white aos" data-aos="fade-up">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center fs-12 mb-3">
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled  text-primary me-1" />
                    <p className="fs-14 text-gray-9">5.0</p>
                  </div>
                  <h6 className="mb-1">Easy to Find your Leisuere Place</h6>
                  <p className="mb-3">
                    Yotrip is the only way to go. We had the time of our life on
                    our trip to the Ark. The customer service was wonderful, and the
                    staff was very helpful.
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="avatar avatar-md  flex-shrink-0"
                    >
                      <ImageWithBasePath
                        src="/assets/img/users/user-01.jpg"
                        className="rounded-circle"
                        alt="img"
                      />
                    </Link>
                    <div className="d-flex align-items-center ms-2">
                      <h6 className="fs-16 fw-medium">
                        <Link to="#">Andrew</Link>
                      </h6>
                      <p className="fs-14 testimonial-divide-dot">
                        Newyork, United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Testimonial Item*/}
              {/* Testimonial Item*/}
              <div className="card border-white aos" data-aos="fade-up">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center fs-12 mb-3">
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled  text-primary me-1" />
                    <p className="fs-14 text-gray-9">5.0</p>
                  </div>
                  <h6 className="mb-1">Easy to Find your Leisuere Place</h6>
                  <p className="mb-3">
                    I went on the Gone with the Wind tour, and it was my first
                    multi-day bus tour. The experience was terrific, thanks to the
                    friendly tour guides. I’ve told many people about it
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="avatar avatar-md  flex-shrink-0"
                    >
                      <ImageWithBasePath
                        src="/assets/img/users/user-02.jpg"
                        className="rounded-circle"
                        alt="img"
                      />
                    </Link>
                    <div className="d-flex align-items-center ms-2">
                      <h6 className="fs-16 fw-medium">
                        <Link to="#">Bryan</Link>
                      </h6>
                      <p className="fs-14 testimonial-divide-dot">South Africa</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Testimonial Item*/}
              {/* Testimonial Item*/}
              <div className="card border-white aos" data-aos="fade-up">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center fs-12 mb-3">
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled  text-primary me-1" />
                    <p className="fs-14 text-gray-9">5.0</p>
                  </div>
                  <h6 className="mb-1">Easy to Find your Leisuere Place</h6>
                  <p className="mb-3">
                    Thanks for arranging a smooth travel experience for us. Our cab
                    driver was polite, timely, and helpful. The team ensured that
                    everything was taken care of, making it a stress-free trip
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="avatar avatar-md  flex-shrink-0"
                    >
                      <ImageWithBasePath
                        src="/assets/img/users/user-03.jpg"
                        className="rounded-circle"
                        alt="img"
                      />
                    </Link>
                    <div className="d-flex align-items-center ms-2">
                      <h6 className="fs-16 fw-medium">
                        <Link to="#">Prajakta</Link>
                      </h6>
                      <p className="fs-14 testimonial-divide-dot">France</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Testimonial Item*/}
              {/* Testimonial Item*/}
              <div className="card border-white aos" data-aos="fade-up">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center fs-12 mb-3">
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled  text-primary me-1" />
                    <p className="fs-14 text-gray-9">5.0</p>
                  </div>
                  <h6 className="mb-1">Easy to Find your Leisuere Place</h6>
                  <p className="mb-3">
                    Yotrip is the only way to go. We had the time of our life on
                    our trip to the Ark. The customer service was wonderful, and the
                    staff was very helpful.
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="avatar avatar-md  flex-shrink-0"
                    >
                      <ImageWithBasePath
                        src="/assets/img/users/user-01.jpg"
                        className="rounded-circle"
                        alt="img"
                      />
                    </Link>
                    <div className="d-flex align-items-center ms-2">
                      <h6 className="fs-16 fw-medium">
                        <Link to="#">Andrew</Link>
                      </h6>
                      <p className="fs-14 testimonial-divide-dot">
                        Newyork, United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Testimonial Item*/}
            </Slider>


          </div>
        </div>
      </section>
      {/* /Testimonial Section */}


      {/* Faq Section */}
      <section className="section faq-sec-two pt-0">
        <div className="faq-sec-bg">
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-05.svg" className="bg-1" alt="Img" />
        </div>
        <div className="container">
          <div className="faq-secpath-two">
            <div className="">
              <ImageWithBasePath src="/assets/img/bg/bg-03.png" className="bg-3" alt="img" />
            </div>
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="faq-five  aos" data-aos="fade-up">
                  <ImageWithBasePath src="/assets/img/faq/faq-02.png" alt="img" />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="section-header">
                  <div>
                    <p className="mb-2 fw-medium d-flex align-items-center">
                      <span className="text-bar" />
                      Frequently Asked Questions
                    </p>
                    <h2>
                      Specializing in dream destinations
                      <span className="text-primary">.</span>
                    </h2>
                  </div>
                </div>
                <div
                  className="accordion accordion-flush faq-accordion-five"
                  id="accordionFaq"
                >
                  <div
                    className="accordion-item show mb-3 aos"
                    data-aos="fade-up"
                    style={{
                      visibility: "visible",
                      animationDelay: "0.2s",
                      animationName: "fadeInUp"
                    }}
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapseOne"

                        aria-controls="faq-collapseOne"
                      >
                        What types of tours do you offer?
                      </button>
                    </h2>
                    <div
                      id="faq-collapseOne"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p className="mb-0">
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                        <p>
                          Popular destinations include Europe, Africa (e.g.,
                          Morocco),{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item mb-3 aos"
                    data-aos="fade-up"
                    style={{
                      visibility: "visible",
                      animationDelay: "0.4s",
                      animationName: "fadeInUp"
                    }}
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsetwo"

                        aria-controls="faq-collapsetwo"
                      >
                        Are the tours customizable?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsetwo"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item mb-3  aos"
                    data-aos="fade-up"
                    style={{
                      visibility: "visible",
                      animationDelay: "0.6s",
                      animationName: "fadeInUp"
                    }}
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsthree"

                        aria-controls="faq-collapsthree"
                      >
                        What safety measures do you follow?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsthree"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item mb-3 aos"
                    data-aos="fade-up"
                    style={{
                      visibility: "visible",
                      animationDelay: "0.8s",
                      animationName: "fadeInUp"
                    }}
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsefour"

                        aria-controls="faq-collapsefour"
                      >
                        How far in advance should I book?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsefour"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item aos"
                    data-aos="fade-up"
                    style={{
                      visibility: "visible",
                      animationDelay: "1s",
                      animationName: "fadeInUp"
                    }}
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsefive"

                        aria-controls="faq-collapsefive"
                      >
                        What is your cancellation policy?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsefive"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Faq Section */}


      {/* Blog Section */}
      <section className="section blog-sec-two pt-0">
        <div className="container">
          <div className="section-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div>
              <p className="mb-2 fw-medium d-flex align-items-center">
                <span className="text-bar" />
                Latest Articles
              </p>
              <h2>
                Stay Updated on the Stories<span className="text-primary">.</span>
              </h2>
            </div>
            <div>
              <Link to={routes.blogGrid} className="btn btn-primary">
                View All
                <i className="isax isax-arrow-right-3 ms-2" />
              </Link>
            </div>
          </div>
          <div className="blog-slider owl-carousel">
            <Slider {...BlogSlider}>
              {/* Blog Item*/}
              <div className="card blog-grid aos" data-aos="fade-up">
                <div className="card-img rounded-top">
                  <Link to={routes.blogDetails} className="blog-img">
                    <ImageWithBasePath
                      src="/assets/img/blog/blog-15.jpg"
                      className="rounded-top"
                      alt="img"
                    />
                  </Link>
                  <div className="blog-date">
                    <h6>
                      15<span className="d-block">Jul</span>
                    </h6>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="mb-3">
                    <Link to={routes.blogDetails} className="two-line-ellipsis">
                      It empowers designers to swiftly created informative landing
                      pages
                    </Link>
                  </h5>
                  <div className="d-flex align-items-center justify-content-between">
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-01.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Beth Williams</p>
                    </Link>
                    <Link to={routes.blogDetails} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* /Blog Item*/}
              {/* Blog Item*/}
              <div className="card blog-grid aos" data-aos="fade-up">
                <div className="card-img rounded-top">
                  <Link to={routes.blogDetails} className="blog-img">
                    <ImageWithBasePath
                      src="/assets/img/blog/blog-16.jpg"
                      className="rounded-top"
                      alt="img"
                    />
                  </Link>
                  <div className="blog-date">
                    <h6>
                      14<span className="d-block">Jul</span>
                    </h6>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="mb-3">
                    <Link to={routes.blogDetails} className="two-line-ellipsis">
                      Want to be notified about new post and news from our Portal ?
                    </Link>
                  </h5>
                  <div className="d-flex align-items-center justify-content-between">
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-02.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Merkel James</p>
                    </Link>
                    <Link to={routes.blogDetails} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* /Blog Item*/}
              {/* Blog Item*/}
              <div className="card blog-grid aos" data-aos="fade-up">
                <div className="card-img rounded-top">
                  <Link to={routes.blogDetails} className="blog-img">
                    <ImageWithBasePath
                      src="/assets/img/blog/blog-17.jpg"
                      className="rounded-top"
                      alt="img"
                    />
                  </Link>
                  <div className="blog-date">
                    <h6>
                      18<span className="d-block">Jul</span>
                    </h6>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="mb-3">
                    <Link to={routes.blogDetails} className="two-line-ellipsis">
                      It empowers designers to swiftly created informative landing
                      pages
                    </Link>
                  </h5>
                  <div className="d-flex align-items-center justify-content-between">
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-03.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Tom Andrews</p>
                    </Link>
                    <Link to={routes.blogDetails} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* /Blog Item*/}
              {/* Blog Item*/}
              <div className="card blog-grid aos" data-aos="fade-up">
                <div className="card-img rounded-top">
                  <Link to={routes.blogDetails} className="blog-img">
                    <ImageWithBasePath
                      src="/assets/img/blog/blog-16.jpg"
                      className="rounded-top"
                      alt="img"
                    />
                  </Link>
                  <div className="blog-date">
                    <h6>
                      18<span className="d-block">Jul</span>
                    </h6>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="mb-3">
                    <Link to={routes.blogDetails} className="two-line-ellipsis">
                      It empowers designers to swiftly created informative landing
                      pages
                    </Link>
                  </h5>
                  <div className="d-flex align-items-center justify-content-between">
                    <Link
                      to="#"
                      className="d-flex align-items-center overflow-hidden"
                    >
                      <span className="avatar avatar-md flex-shrink-0 me-2">
                        <ImageWithBasePath
                          src="/assets/img/users/user-03.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </span>
                      <p className="fs-14 text-truncate">Tom Andrews</p>
                    </Link>
                    <Link to={routes.blogDetails} className="rounded-arrow-next">
                      <i className="isax isax-arrow-right-3" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* /Blog Item*/}
            </Slider>

          </div>
        </div>
      </section>
      {/* /Blog Section */}


      <section className="news-letter-sec">
        <div className="news-sec-bg">
          <ImageWithBasePath src="/assets/img/bg/hotel-bg-04.svg" className="bg-1" alt="Img" />
        </div>
        <div className="container">
          <div className="update-sec news-letter">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="section-header">
                  <h2 className="mb-1 text-white">Subscribe to our Newsletter</h2>
                  <p className="sub-title text-white">
                    Just sign up and we'll send you a notification by email.
                  </p>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="input-group justify-content-center">
                  <span className="input-group-text px-1">
                    <i className="isax isax-message-favorite5" />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email Address"
                  />
                  <button type="submit" className="btn btn-primary">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterTwo />

    </>

  )
}

export default HomeTwo