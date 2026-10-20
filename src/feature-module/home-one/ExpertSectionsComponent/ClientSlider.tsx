import Slider from 'react-slick';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';

const clients = [
  '/assets/img/clients/client-01.svg',
  '/assets/img/clients/client-02.svg',
  '/assets/img/clients/client-03.svg',
  '/assets/img/clients/client-04.svg',
  '/assets/img/clients/client-05.svg',
  '/assets/img/clients/client-06.svg',
  '/assets/img/clients/client-07.svg',
];

const ClientsSlider = () => {
  const settings = {
    infinite: true,
    speed: 2000,
    autoplay: true,
    dots: false,
    arrows: false,
    slidesToShow: 7,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 7 } },
      { breakpoint: 1200, settings: { slidesToShow: 5 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 576, settings: { slidesToShow: 3 } },
      { breakpoint: 0, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <Slider {...settings}>
      {clients.map((client, index) => (
        <div className="client-img" key={index}>
          <ImageWithBasePath src={client} alt={`client-${index}`} />
        </div>
      ))}
    </Slider>
  );
};

export default ClientsSlider;
