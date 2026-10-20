// // import  { useState } from 'react'
// // import ImageWithBasePath from '../../core/common/imageWithBasePath'
// // import { Link } from 'react-router-dom'
// // import Slider from 'react-slick';
// // import VideoModal from '../home-Two/videoModal';
// // import { all_routes } from '../router/all_routes';
// // const ExpertSection = () => {


// //     const routes = all_routes

// //       const [showModal, setShowModal] = useState(false);
// //       const videoUrl = 'https://youtu.be/NSAOrGb9orM';
    
// //       const handleOpenModal = () => setShowModal(true);
// //       const handleCloseModal = () => setShowModal(false);
// //       const CustomNextArrow = ({  onClick }: any) => (
// //         <div className="owl-nav">
// //         <button type="button" role="presentation" className="owl-next"  onClick={onClick}>
// //             <i className="fa-solid fa-chevron-right" />
// //         </button>
// //         </div>
    
// //       );
      
// //       const CustomPrevArrow = ({  onClick }: any) => (
// //         <div className="owl-nav">
// //         <button type="button" role="presentation" className="owl-prev" onClick={onClick}>
// //             <i className="fa-solid fa-chevron-left" />
// //         </button>
// //         </div>
// //       );
// //     const placeSectionSlick = {
// //         dots: false,
// //         infinite: false, // Loop disabled
// //         speed: 2000, // Smart speed
// //         slidesToShow: 4, // Default items to show
// //         slidesToScroll: 1,
// //         autoplay: false, // Autoplay disabled
// //         arrows: true, // Show navigation arrows
// //         nextArrow: <CustomNextArrow />,
// //         prevArrow: <CustomPrevArrow />,
// //         responsive: [
// //             {
// //                 breakpoint: 1400,
// //                 settings: {
// //                     slidesToShow: 4,
// //                 },
// //             },
// //             {
// //                 breakpoint: 1200,
// //                 settings: {
// //                     slidesToShow: 3,
// //                 },
// //             },
// //             {
// //                 breakpoint: 992,
// //                 settings: {
// //                     slidesToShow: 3,
// //                 },
// //             },
// //             {
// //                 breakpoint: 768,
// //                 settings: {
// //                     slidesToShow: 2,
// //                 },
// //             },
// //             {
// //                 breakpoint: 550,
// //                 settings: {
// //                     slidesToShow: 1,
// //                 },
// //             },
// //             {
// //                 breakpoint: 0,
// //                 settings: {
// //                     slidesToShow: 1,
// //                 },
// //             },
// //         ],
// //     };
// //       // Client Slider
// //   const clientSliderTwo = {
// //     infinite: true, // Loop enabled
// //     speed: 2000, // Matches smartSpeed
// //     autoplay: true,
// //     dots: false,
// //     arrows: false,
// //     slidesToShow: 7,
// //     slidesToScroll: 1,
// //     responsive: [
// //       {
// //         breakpoint: 1400,
// //         settings: {
// //           slidesToShow: 7,
// //         },
// //       },
// //       {
// //         breakpoint: 1200,
// //         settings: {
// //           slidesToShow: 5,
// //         },
// //       },
// //       {
// //         breakpoint: 992,
// //         settings: {
// //           slidesToShow: 4,
// //         },
// //       },
// //       {
// //         breakpoint: 576,
// //         settings: {
// //           slidesToShow: 3,
// //         },
// //       },
// //       {
// //         breakpoint: 0,
// //         settings: {
// //           slidesToShow: 2,
// //         },
// //       },
// //     ],
// //   };
// //   return (
// //     <>
// //     <section className="section experts-section">
// //     <div className="container">
// //         <div className="row justify-content-center">
// //             <div className="col-xl-6 col-lg-10 text-center aos fadeInUp" data-aos="fade-up">
// //                 <div className="section-header text-center">
// //                     <h2 className="mb-2">Our <span className="text-primary  ">Popular</span> Experts</h2>
// //                     <p className="sub-title">Here are some famous tourist places around the world that are known for their historical significance,natural beauty, or cultural impact:</p>
// //                 </div>
// //             </div>
// //         </div>
// //         <div className="owl-carousel place-slider nav-center">
// //         <Slider {...placeSectionSlick}>
// //             {/* Expert Item*/}
// //             <div className="expert-item mb-4">
// //                 <Link to="#" className="expert-img">
// //                     <div className="bg-purple-100 position-relative">
// //                         <ImageWithBasePath src="/assets/img/expert/expert-01.png" alt="img" />
// //                         <span className="bg-info circle-shape"></span>
// //                     </div>
// //                 </Link>
// //                 <div className="expert-content">
// //                     <div className="d-flex align-items-center mb-1">
// //                         <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
// //                         <p>(499 Reviews)</p>
// //                     </div>
// //                     <h5 className="mb-1"><Link to="#">Damien Martien</Link></h5>
// //                     <p className="d-flex align-items-center"><ImageWithBasePath src="/assets/img/flags/brazil.svg" alt="img" className="me-2" />Brazil, Rio</p>
// //                     <div className="d-flex border-top mt-3 pt-3">
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Total Listings</p>
// //                             <h6>14</h6>
// //                         </div>
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Starts From</p>
// //                             <h6>$452</h6>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //             {/* /Expert Item*/}

// //             {/* Expert Item*/}
// //             <div className="expert-item mb-4">
// //                 <Link to="#" className="expert-img">
// //                     <div className="bg-orange-100 position-relative">
// //                         <ImageWithBasePath src="/assets/img/expert/expert-02.png" alt="img" />
// //                         <span className="bg-orange circle-shape"></span>
// //                     </div>
// //                 </Link>
// //                 <div className="expert-content">
// //                     <div className="d-flex align-items-center mb-1">
// //                         <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.9</span>
// //                         <p>(315 Reviews)</p>
// //                     </div>
// //                     <h5 className="mb-1"><Link to="#">Connie Allen</Link></h5>
// //                     <p className="d-flex align-items-center"><ImageWithBasePath src="/assets/img/flags/japan.svg" alt="img" className="me-2" />Tokyo, Japan</p>
// //                     <div className="d-flex border-top mt-3 pt-3">
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Total Listings</p>
// //                             <h6>21</h6>
// //                         </div>
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Starts From</p>
// //                             <h6>$689</h6>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //             {/* /Expert Item*/}

// //             {/* Expert Item*/}
// //             <div className="expert-item mb-4">
// //                 <Link to="#" className="expert-img">
// //                     <div className="bg-pink-100 position-relative">
// //                         <ImageWithBasePath src="/assets/img/expert/expert-03.png" alt="img" />
// //                         <span className="bg-pink circle-shape"></span>
// //                     </div>
// //                 </Link>
// //                 <div className="expert-content">
// //                     <div className="d-flex align-items-center mb-1">
// //                         <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.7</span>
// //                         <p>(220 Reviews)</p>
// //                     </div>
// //                     <h5 className="mb-1"><Link to="#">Ida Olsen</Link></h5>
// //                     <p className="d-flex align-items-center"><ImageWithBasePath src="/assets/img/flags/africa.svg" alt="img" className="me-2" />Cape Town, South Africa</p>
// //                     <div className="d-flex border-top mt-3 pt-3">
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Total Listings</p>
// //                             <h6>15</h6>
// //                         </div>
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Starts From</p>
// //                             <h6>$230</h6>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //             {/* /Expert Item*/}

// //             {/* Expert Item*/}
// //             <div className="expert-item mb-4">
// //                 <Link to="#" className="expert-img">
// //                     <div className="bg-teal-100 position-relative">
// //                         <ImageWithBasePath src="/assets/img/expert/expert-04.png" alt="img" />
// //                         <span className="bg-teal circle-shape"></span>
// //                     </div>
// //                 </Link>
// //                 <div className="expert-content">
// //                     <div className="d-flex align-items-center mb-1">
// //                         <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
// //                         <p>(180 Reviews)</p>
// //                     </div>
// //                     <h5 className="mb-1"><Link to="#">Damien Martien</Link></h5>
// //                     <p className="d-flex align-items-center"><ImageWithBasePath src="/assets/img/flags/australia.svg" alt="img" className="me-2" />Sydney, Australia</p>
// //                     <div className="d-flex border-top mt-3 pt-3">
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Total Listings</p>
// //                             <h6>15</h6>
// //                         </div>
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Starts From</p>
// //                             <h6>$563</h6>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //             {/* /Expert Item*/}

// //             {/* Expert Item*/}
// //             <div className="expert-item mb-4">
// //                 <Link to="#" className="expert-img">
// //                     <div className="bg-purple-100 position-relative">
// //                         <ImageWithBasePath src="/assets/img/expert/expert-05.png" alt="img" />
// //                         <span className="bg-purple circle-shape"></span>
// //                     </div>
// //                 </Link>
// //                 <div className="expert-content">
// //                     <div className="d-flex align-items-center mb-1">
// //                         <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.9</span>
// //                         <p>(160 Reviews)</p>
// //                     </div>
// //                     <h5 className="mb-1"><Link to="#">Catalina Schmeling</Link></h5>
// //                     <p className="d-flex align-items-center"><ImageWithBasePath src="/assets/img/flags/norway.svg" alt="img" className="me-2" />Oslo, Norway</p>
// //                     <div className="d-flex border-top mt-3 pt-3">
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Total Listings</p>
// //                             <h6>17</h6>
// //                         </div>
// //                         <div className="flex-fill">
// //                             <p className="mb-1">Starts From</p>
// //                             <h6>$550</h6>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //             {/* /Expert Item*/}
// //         </Slider>
// //         </div>
// //         <div className="text-center view-all aos fadeInUp">
// //             <Link to={routes.teams} className="btn btn-dark">View All Experts<i className="isax isax-arrow-right-3 ms-2"></i></Link>
// //         </div>
// //     </div>
// // </section>
// // <div className="video-wrap">
// //         <Link className="video-btn video-effect"  to="#" onClick={handleOpenModal}><i className="isax isax-play5"></i></Link>
// //     </div>
// //     <VideoModal show={showModal} handleClose={handleCloseModal} videoUrl={videoUrl} />
// //     <section className="section client-section">
// //         <div className="container">
// //             <div className="row">
// //                 <div className="col-xl-12 text-center aos fadeInUp" data-aos="fade-up">
// //                     <h6 className="fs-16 fw-medium mb-4">Trusted By 40+ Clients Around the Globe</h6>
// //                 </div>
// //             </div>
// //             <div className="owl-carousel client-slider">
// //             <Slider {...clientSliderTwo}>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-01.svg" alt="img" />
// //                 </div>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-02.svg" alt="img" />
// //                 </div>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-03.svg" alt="img" />
// //                 </div>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-04.svg" alt="img" />
// //                 </div>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-05.svg" alt="img" />
// //                 </div>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-06.svg" alt="img" />
// //                 </div>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-07.svg" alt="img" />
// //                 </div>
// //                 <div className="client-img">
// //                     <ImageWithBasePath src="/assets/img/clients/client-04.svg" alt="img" />
// //                 </div>
// //                 </Slider>
// //             </div>
// //         </div>
// //     </section>
// // </>
// //   )
// // }

// // export default ExpertSection


// import React, { useState, lazy, Suspense } from 'react';
// import { Link } from 'react-router-dom';
// import VideoModal from '../home-Two/videoModal';
// import { all_routes } from '../router/all_routes';

// const ExpertsSlider = lazy(() => import('./ExpertsSlider'));
// const ClientsSlider = lazy(() => import('./ClientsSlider'));

// const ExpertSection = () => {
//   const routes = all_routes;
//   const [showModal, setShowModal] = useState(false);
//   const videoUrl = 'https://youtu.be/NSAOrGb9orM';

//   return (
//     <>
//       <section className="section experts-section">
//         <div className="container">
//           <div className="row justify-content-center">
//             <div className="col-xl-6 col-lg-10 text-center aos fadeInUp" data-aos="fade-up">
//               <div className="section-header text-center">
//                 <h2 className="mb-2">Our <span className="text-primary ">Popular</span> Experts</h2>
//                 <p className="sub-title">Here are some famous tourist places around the world that are known for their historical significance, natural beauty, or cultural impact:</p>
//               </div>
//             </div>
//           </div>
//           <div className="owl-carousel place-slider nav-center">
//             <Suspense fallback={<div>Loading Experts...</div>}>
//               <ExpertsSlider />
//             </Suspense>
//           </div>
//           <div className="text-center view-all aos fadeInUp">
//             <Link to={routes.teams} className="btn btn-dark">View All Experts<i className="isax isax-arrow-right-3 ms-2"></i></Link>
//           </div>
//         </div>
//       </section>

//       <div className="video-wrap">
//         <Link className="video-btn video-effect" to="#" onClick={() => setShowModal(true)}>
//           <i className="isax isax-play5"></i>
//         </Link>
//       </div>
//       <VideoModal show={showModal} handleClose={() => setShowModal(false)} videoUrl={videoUrl} />

//       <section className="section client-section">
//         <div className="container">
//           <div className="row">
//             <div className="col-xl-12 text-center aos fadeInUp" data-aos="fade-up">
//               <h6 className="fs-16 fw-medium mb-4">Trusted By 40+ Clients Around the Globe</h6>
//             </div>
//           </div>
//           <div className="owl-carousel client-slider">
//             <Suspense fallback={<div>Loading Clients...</div>}>
//               <ClientsSlider />
//             </Suspense>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default ExpertSection;

import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../router/all_routes';

const ExpertsSlider = lazy(() => import('./ExpertSectionsComponent/ExpertsSlider'));
const ClientsSlider = lazy(() => import('./ExpertSectionsComponent/ClientSlider'));

const ExpertSection = () => {
  const routes = all_routes;

  return (
    <>
      <section className="section experts-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-10 text-center aos fadeInUp" data-aos="fade-up">
              <div className="section-header text-center">
                <h2 className="mb-2">Our <span className="text-primary ">Popular</span> Experts</h2>
                <p className="sub-title">Here are some famous tourist places around the world that are known for their historical significance, natural beauty, or cultural impact:</p>
              </div>
            </div>
          </div>
          <div className="owl-carousel place-slider nav-center">
            <Suspense fallback={<div>Loading Experts...</div>}>
              <ExpertsSlider />
            </Suspense>
          </div>
          <div className="text-center view-all aos fadeInUp">
            <Link to={routes.teams} className="btn btn-dark">View All Experts<i className="isax isax-arrow-right-3 ms-2"></i></Link>
          </div>
        </div>
      </section>

      <div className="video-wrap">
        <video
          className="video-bg"
          src="/assets/video/yotrip.mp4"
          poster="/assets/img/video.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      <section className="section client-section">
        <div className="container">
          <div className="row">
            <div className="col-xl-12 text-center aos fadeInUp" data-aos="fade-up">
              <h6 className="fs-16 fw-medium mb-4">Trusted By 40+ Clients Around the Globe</h6>
            </div>
          </div>
          <div className="owl-carousel client-slider">
            <Suspense fallback={<div>Loading Clients...</div>}>
              <ClientsSlider />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
};

export default ExpertSection;
