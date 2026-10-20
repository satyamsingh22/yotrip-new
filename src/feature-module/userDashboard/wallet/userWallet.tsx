import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import Sidebar from '../../../core/common/sidebar/sidebar';

const UserWallet = () => {

  const routes = all_routes;

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: 'Wallet',
      link: routes.home1,
      active: false,
    },
    {
      label: 'Wallet',
      active: true,
    },
  ];

  // There is no wallet backend — no balance, credit, debit or transaction
  // source anywhere in the API. The template's figures ($4596 balance, 60
  // transactions) were the same for every user, and its "Add Payment" form
  // collected card number / expiry / CVV with no submit handler behind it.
  // Both are gone until a real wallet exists.
  const transactions: unknown[] = [];

  return (
    <div>
      <Breadcrumb
        title="Wallet"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-04"
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
            {/* Wallet */}
            <div className="col-xl-9 col-lg-8">
              <div className="card shadow-none mb-4">
                <div className="card-header">
                  <h6>Wallet</h6>
                </div>
                <div className="card-body">
                  <p className="p-4 text-center text-gray-6 mb-0">
                    Wallet isn&apos;t available yet.
                  </p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="card hotel-list mb-0">
                <div className="card-body p-0">
                  <div className="list-header d-flex align-items-center justify-content-between flex-wrap">
                    <h6>Transactions</h6>
                  </div>
                  {transactions.length === 0 ? (
                    <p className="p-4 text-center text-gray-6 mb-0">
                      No transactions yet.
                    </p>
                  ) : null}
                </div>
              </div>
              {/* /Transactions List */}
            </div>
            {/* /Wallet */}
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </div>
  )
}

export default UserWallet
