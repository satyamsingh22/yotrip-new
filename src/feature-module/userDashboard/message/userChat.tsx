import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';

const UserChat = () => {

  const routes = all_routes;

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: 'Message',
      link: routes.home1,
      active: false,
    },
    {
      label: 'Message',
      active: true,
    },
  ];

  // There is no messaging backend — no model, route or socket anywhere in the
  // app. The page keeps its shell and shows an honest empty state instead of
  // the template's preloaded conversations.
  const conversations: unknown[] = [];

  return (
    <div>
      <Breadcrumb
        title="Message"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-04"
      />
      {/* Page Wrapper */}
      <div className="content">
        <div className="container">
          <div className="customer-chat">
            <div className="header-navigation">
              <Link to={routes.userDashboard} className="d-inline-flex align-items-center">
                <i className="isax isax-arrow-left me-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="card shadow-none mt-3">
              <div className="card-header">
                <h6>Messages</h6>
              </div>
              <div className="card-body">
                {conversations.length === 0 ? (
                  <p className="p-4 text-center text-gray-6 mb-0">
                    You have no messages.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </div>
  )
}

export default UserChat
