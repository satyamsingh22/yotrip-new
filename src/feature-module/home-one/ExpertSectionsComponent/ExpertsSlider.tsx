import React from 'react';
import Slider, { type Settings } from 'react-slick';
import ExpertItem from './ExpertItem';

// Type for an expert
export type Expert = {
  name: string;
  rating: number;
  reviews: number;
  location: string;
  flag: string;
  listings: number;
  price: number;
  image: string;
  bgColor: string;
  circleColor: string;
};

// Sample expert data
const experts: Expert[] = [
  {
    name: 'Damien Martien',
    rating: 5.0,
    reviews: 499,
    location: 'Brazil, Rio',
    flag: '/assets/img/flags/brazil.svg',
    listings: 14,
    price: 452,
    image: '/assets/img/expert/expert-01.png',
    bgColor: 'bg-purple-100',
    circleColor: 'bg-info',
  },
  // Add other experts here
];

// Type for custom arrow props from react-slick
interface SlickArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  currentSlide?: number;
  slideCount?: number;
}

const CustomNextArrow: React.FC<SlickArrowProps> = ({ onClick }) => (
  <div className="owl-nav">
    <button
      type="button"
      className="owl-next"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }}
    >
      <i className="fa-solid fa-chevron-right" />
    </button>
  </div>
);

const CustomPrevArrow: React.FC<SlickArrowProps> = ({ onClick }) => (
  <div className="owl-nav">
    <button
      type="button"
      className="owl-prev"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }}
    >
      <i className="fa-solid fa-chevron-left" />
    </button>
  </div>
);

const ExpertsSlider: React.FC = () => {
  const settings: Settings = {
    dots: false,
    infinite: false,
    speed: 2000,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 4 } },
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 550, settings: { slidesToShow: 1 } },
      { breakpoint: 0, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Slider {...settings}>
      {experts.map((expert, index) => (
        <ExpertItem key={index} expert={expert} />
      ))}
    </Slider>
  );
};

export default ExpertsSlider;
