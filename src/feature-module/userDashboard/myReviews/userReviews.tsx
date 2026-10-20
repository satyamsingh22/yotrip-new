
import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import Sidebar from '../../../core/common/sidebar/sidebar';
import { Link } from 'react-router-dom';

const UserReviews = () => {

  const routes = all_routes;

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: 'My Reviews',
      link: routes.home1,
      active: false,
    },
    {
      label: 'My Reviews',
      active: true,
    },
  ];

  // Reviews are not captured anywhere yet — there is no reviews API or model,
  // so this page stays empty rather than showing template reviews written by
  // people who don't exist.
  const reviews: unknown[] = [];

  return (
    <div>
      <Breadcrumb
        title="My Reviews"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
      />

      {/* Page Wrapper */}
      <div className="content">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-xl-3 col-lg-4">
              <Sidebar />
            </div>
            {/* /Sidebar */}
            <div className="col-xl-9 col-lg-8">
              {/* Review Title */}
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3">
                    <div>
                      <h6>My Reviews</h6>
                      <p className="fs-14 text-gray-6 mb-0">
                        {reviews.length} review(s)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Review Title */}
              {/* Reviews */}
              <div className="card shadow-none">
                <div className="card-body">
                  <p className="p-4 text-center text-gray-6 mb-0">
                    You haven&apos;t written any reviews yet.{" "}
                    <Link to={routes.userDashboard}>Go to dashboard</Link>
                  </p>
                </div>
              </div>
              {/* /Reviews */}
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </div>
  )
}

export default UserReviews
