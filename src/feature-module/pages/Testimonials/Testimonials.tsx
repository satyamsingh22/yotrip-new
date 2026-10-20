import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface TestimonialType {
  _id: string;
  name: string;
  message: string;
  rating: number;
  image: string;
  address:string;
  heading:string;
}

const Testimonials = () => {

  const routes = all_routes;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbs = [
    { label: 'Testimonials', link: routes.home1, active: false },
    { label: 'Pages', active: false },
    { label: 'Testimonials', active: true },
  ];

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/`);
      setTestimonials(res.data);
    } catch (error) {
      console.log("Error fetching testimonials", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <>
      <Breadcrumb
        title="Testimonials"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
      />

      <div className="content">
        <div className="container">

          <div className="row row-gap-4">

            {loading ? (

              [...Array(6)].map((_, i) => (

                <div className="col-lg-4 d-flex" key={i}>

                  <div className="card border-white flex-fill">
                    <div className="card-body">

                      <Skeleton width={120} height={20} />

                      <p className="mt-3">
                        <Skeleton count={3} />
                      </p>

                      <div className="border-top pt-4 d-flex align-items-center justify-content-between">

                        <div className="d-flex align-items-center">

                          <Skeleton circle width={40} height={40} />

                          <div className="ms-2">
                            <Skeleton width={100} />
                            <Skeleton width={80} />
                          </div>

                        </div>

                        <Skeleton width={30} />

                      </div>

                    </div>
                  </div>

                </div>

              ))

            ) : (

              testimonials.map((item) => (

                <div className="col-lg-4 d-flex" key={item._id}>

                  <div className="card border-white mb-0 wow fadeInUp flex-fill">

                    <div className="card-body d-flex flex-column">

                      <h6 className="mb-3 fw-bold">{item.heading}</h6>

                      <p className="mb-4 flex-grow-1">
                        {item.message}
                      </p>

                      <div className="border-top pt-4 d-flex align-items-center justify-content-between mt-auto">

                        <div className="d-flex align-items-center">

                          <Link to="#" className="avatar avatar-md flex-shrink-0">

                            <img
                              src={`${BASE_URL}/uploads/profile/${item.image}`}
                              className="rounded-circle"
                              alt="user"
                            />

                          </Link>

                          <div className="ms-2">

                            <h6 className="fs-16 fw-bold mb-2">
                              {item.name}
                            </h6>

                            <p>{item.address}</p>

                          </div>

                        </div>

                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                          {item.rating}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>
      </div>
    </>
  );
};

export default Testimonials;