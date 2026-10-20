import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { all_routes } from '../../router/all_routes';

import { useEffect, useState } from "react";
import axios from "axios";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Teams = () => {

  const routes = all_routes;

  const breadcrumbs = [
    { label: 'Team', link: routes.home1, active: false },
    { label: 'Pages', active: true },
    { label: 'Team', active: true },
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [team, setTeam] = useState<
    { _id: string; name: string; designation: string; profileImage: string }[]
  >([]);

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
    <div>

      <Breadcrumb
        title="Team"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-02"
      />

      <div className="content">
        <div className="container">

          <div className="row justify-content-center row-gap-5">

            <div className="row">

              {/* Skeleton Loader */}

              {loading &&
                [...Array(8)].map((_, index) => (
                  <div className="col-lg-4 col-md-6" key={index}>
                    <div className="card p-3">

                      <Skeleton height={220} />

                      <Skeleton height={20} className="mt-3" />

                      <Skeleton height={18} width={120} />

                    </div>
                  </div>
                ))}

              {/* Team Members */}

              {!loading && team.length > 0 &&
                team.map((member) => (

                  <div className="col-lg-4 col-md-6" key={member._id}>
                  <div className="team-item wow fadeInUp">

                    <div className="card p-3 position-relative">

                      <ImageWithBasePath
                        src={`${BASE_URL}${member.profileImage}`}
                        alt={member.name}
                        className="img-fluid rounded"
                      />

                      <div className="team-overlay text-center">
                        <div className="team-info  py-2 px-4 rounded-pill shadow">
                          <h5 className="mb-1">{member.name}</h5>
                          <p className="fs-16  mb-0">
                            {member.designation}
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
                ))}


              {!loading && team.length === 0 && (
                <p className="text-center">No team members found</p>
              )}

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Teams;