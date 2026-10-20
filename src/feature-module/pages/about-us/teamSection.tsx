import { useEffect, useState } from "react";
import axios from "axios";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TeamSection = () => {

  const routes = all_routes;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [team, setTeam] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
  

  useEffect(() => {
  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/admins`);

      const validAdmins = res.data.admins.filter(
        (member: any) =>
          member.name &&
          member.designation &&
          member.profileImage &&
          member.profileImage !== ""
      );

      setTeam(validAdmins);

    } catch (err) {
      console.log("TEAM FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTeam();
}, []);

  return (
    <>
      <section className="section team-section">
        <div className="container">

          {/* Heading */}
          <div className="row justify-content-center">
            <div className="col-md-7 d-flex justify-content-center">
              <div className="header-section text-center">
                <h2 className="mb-2">
                  Our <span className="text-primary">Team</span>
                </h2>
                <p className="fs-16 text-gray-6">
                  We’re a team of explorers, innovators, and customer-focused
                  professionals who are passionate about making travel easy
                  and accessible for everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Team Members */}
         <div className="row">

            {loading && (
              [...Array(4)].map((_, index) => (
                <div className="col-xl-3 col-md-6" key={index}>
                  <Skeleton height={220} />
                  <Skeleton height={20} className="mt-2" />
                </div>
              ))
            )}

            {!loading && team.length > 0 &&
  team.map((member) => (
    <div className="col-xl-3 col-md-6" key={member._id}>

      <div className="team-item wow fadeInUp" data-wow-delay="0.2s">
        <div className="card">

          <div className="card-body">
            <ImageWithBasePath
              src={`${BASE_URL}${member.profileImage}`}
              alt={member.name}
              className="img-fluid"
            />
          </div>

          <div className="team-overlay">
            <div className="bg-white py-2 px-3 rounded-pill text-center">
              <h5>{member.name}</h5>
              <p className="fs-16 text-gray-6">{member.designation}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  ))
}

            
          </div>

                    {/* View All */}
                    <div className="text-center view-all wow fadeInUp">
                      <Link to={routes.teams} className="btn btn-dark">
                        View All Experts
                        <i className="isax isax-arrow-right-3 ms-2" />
                      </Link>
                    </div>

          {/* Counter Section */}
          <div className="col-md-12">
            <div className="counter-wrap">
              <div className="row">

                <div className="col-lg-3 col-md-6">
                  <div className="counter-item mb-4">
                    <h6 className="mb-1 d-flex align-items-center justify-content-center text-teal">
                      <i className="isax isax-global5 me-2" />
                      Destinations Worldwide
                    </h6>
                    <h3 className="display-6">
                      <span className="counter">50</span>+
                    </h3>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="counter-item mb-4">
                    <h6 className="mb-1 d-flex align-items-center justify-content-center text-purple">
                      <i className="isax isax-calendar-2 me-2" />
                      Booking Completed
                    </h6>
                    <h3 className="display-6">
                      <span className="counter">7000</span>+
                    </h3>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="counter-item mb-4">
                    <h6 className="mb-1 d-flex align-items-center justify-content-center text-pink">
                      <i className="isax isax-tag-user5 me-2" />
                      Client Globally
                    </h6>
                    <h3 className="display-6">
                      <span className="counter">100</span>+
                    </h3>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="counter-item mb-4">
                    <h6 className="mb-1 d-flex align-items-center justify-content-center text-info">
                      <i className="isax isax-status-up5 me-2" />
                      Providers Registered
                    </h6>
                    <h3 className="display-6">
                      <span className="counter">89</span>+
                    </h3>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Background */}
          <div className="about-bg">
            <ImageWithBasePath
              src="/assets/img/bg/about-bg-01.svg"
              alt="img"
              className="about-bg-02"
            />
          </div>

        </div>
      </section>
    </>
  );
};

export default TeamSection;