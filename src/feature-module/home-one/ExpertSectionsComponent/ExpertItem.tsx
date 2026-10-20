import React from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';

type Expert = {
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

interface ExpertItemProps {
  expert: Expert;
}

const ExpertItem: React.FC<ExpertItemProps> = React.memo(({ expert }) => (
  <div className="expert-item mb-4">
    <Link to="#" className="expert-img">
      <div className={`${expert.bgColor} position-relative`}>
        <ImageWithBasePath src={expert.image} alt={expert.name}/>
        <span className={`${expert.circleColor} circle-shape`}></span>
      </div>
    </Link>
    <div className="expert-content">
      <div className="d-flex align-items-center mb-1">
        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">{expert.rating}</span>
        <p>({expert.reviews} Reviews)</p>
      </div>
      <h5 className="mb-1"><Link to="#">{expert.name}</Link></h5>
      <p className="d-flex align-items-center">
        <ImageWithBasePath src={expert.flag} alt="flag" className="me-2" />{expert.location}
      </p>
      <div className="d-flex border-top mt-3 pt-3">
        <div className="flex-fill">
          <p className="mb-1">Total Listings</p>
          <h6>{expert.listings}</h6>
        </div>
        <div className="flex-fill">
          <p className="mb-1">Starts From</p>
          <h6>${expert.price}</h6>
        </div>
      </div>
    </div>
  </div>
));

export default ExpertItem;
