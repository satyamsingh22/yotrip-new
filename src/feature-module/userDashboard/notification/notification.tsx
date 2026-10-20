
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import Sidebar from '../../../core/common/sidebar/sidebar';
import { all_routes } from '../../router/all_routes';

const Notification = () => {

  const routes=all_routes

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: 'Notifications',
      link: routes.home1,
      active: false,
    },
    {
      label: 'Notifications',
      active: true,
    },
  ];

  // Nothing emits user notifications yet — no model, no route, no delivery.
  // Until something does, this page shows an empty state rather than the
  // template's four invented bookings. The "Mark all as Read" / "Delete All"
  // controls went with them: they never did anything.
  const notifications: unknown[] = [];

  return (
    <div>
      <Breadcrumb
        title="Notifications"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
      />

      {/* Page Wrapper */}
      <div className="content">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-xl-3 col-lg-4 theiaStickySidebar">
              <Sidebar />
            </div>

            {/* /Sidebar */}
            {/* Notifications */}
            <div className="col-xl-9 col-lg-8">
              <div className="card shadow-none mb-0">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3">
                    <h6>Notifications</h6>
                  </div>
                </div>
                <div className="card-body">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-gray-6 mb-0">
                      You have no notifications.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            {/* /Notifications */}
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </div>
  )
}

export default Notification
