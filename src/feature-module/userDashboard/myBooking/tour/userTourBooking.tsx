
import { all_routes } from '../../../router/all_routes';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import Sidebar from '../../../../core/common/sidebar/sidebar';

const UserTourBooking = () => {

  const routes = all_routes;

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: 'My Bookings',
      link: routes.home1,
      active: false,
    },
    {
      label: 'My Bookings',
      active: true,
    },
    {
      label: 'Tour',
      active: true,
    },
  ];

  // Tours aren't a bookable product yet — there is no tour booking model or
  // /my-bookings endpoint. The page used to render the UserTourBookingData
  // fixture, showing every user the same invented tours.
  const data: unknown[] = [];

  return (
    <div>
      <Breadcrumb
        title="My Bookings"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-04"
      />

      {/* Page Wrapper */}
      <div className="content">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-xl-3 col-lg-3">
              <Sidebar />
            </div>
            {/* /Sidebar */}
            {/* Tour Booking */}
            <div className="col-xl-9 col-lg-9 theiaStickySidebar">
              <div className="card booking-header">
                <div className="card-body header-content d-flex align-items-center justify-content-between flex-wrap ">
                  <div>
                    <h6>Tour</h6>
                    <p className="fs-14 text-gray-6 fw-normal mb-0">
                      {data.length} booking(s)
                    </p>
                  </div>
                </div>
              </div>
              <div className="card hotel-list">
                <div className="card-body p-0">
                  <p className="p-4 text-center text-gray-6 mb-0">
                    No tour bookings yet.
                  </p>
                </div>
              </div>
            </div>
            {/* /Tour Booking */}
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </div>
  )
}

export default UserTourBooking
