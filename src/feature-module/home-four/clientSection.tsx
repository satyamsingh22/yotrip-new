
import ImageWithBasePath from '../../core/common/imageWithBasePath'
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ClientSection = () => {

    const clientSectionSlick = {
        dots: false,
        infinite: true,
        autoplay: true,
        speed: 2000,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false, // Set to true if you want to show navigation arrows
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 7,
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

    return (
        <>
            {/* Client Section */}
            <section
                className="section client-section-four aos" 
               data-aos="fade-up"
            >
                <div className="container">
                    <div className="client-sec">
                        <div className="section-header text-center  aos" data-aos="fade-up">
                            <h6 className="text-white">We are working with 50+ Clients</h6>
                        </div>
                        <div className="owl-carousel client-slider">
                            <Slider  {...clientSectionSlick}>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-08.svg" alt="img" />
                                </div>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-09.svg" alt="img" />
                                </div>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-10.svg" alt="img" />
                                </div>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-11.svg" alt="img" />
                                </div>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-12.svg" alt="img" />
                                </div>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-13.svg" alt="img" />
                                </div>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-14.svg" alt="img" />
                                </div>
                                <div className="client-img">
                                    <ImageWithBasePath src="/assets/img/clients/client-10.svg" alt="img" />
                                </div>
                            </Slider>

                        </div>
                    </div>
                </div>
            </section>
            {/* /Client Section */}
        </>

    )
}

export default ClientSection
