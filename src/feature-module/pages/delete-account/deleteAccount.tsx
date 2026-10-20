import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";

const DeleteAccountPage = () => {
  const routes = all_routes;
  const breadcrumbs = [
    {
      label: "Delete Account",
      active: false,
      link: routes.home1,
    },
    {
      label: "Pages",
      active: false,
    },
    {
      label: "Delete Account",
      active: true,
    },
  ];

  return (
    <div>
      <Breadcrumb
        title="Delete Account"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-02"
      />

      <div className="content">
        <div className="container">
          <p>
            You can permanently delete your YoTrip account from the YoTrip
            mobile app or from the website. Deletion takes effect immediately
            when you confirm it while signed in.
          </p>

          <h6 className="mb-2">1. How to delete your account from the mobile app</h6>
          <div className="mb-4">
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Sign in to the YoTrip app.
            </p>
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Open Profile / Settings.
            </p>
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Open Security Settings.
            </p>
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Tap Delete Account.
            </p>
            <p>
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Confirm deletion in the dialog.
            </p>
          </div>

          <h6 className="mb-2">2. How to delete your account on the website</h6>
          <div className="mb-4">
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Sign in at yotrip.com.
            </p>
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Go to Settings → Security.
            </p>
            <p>
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Choose Delete Account and confirm.
            </p>
          </div>

          <h6 className="mb-2">3. What happens after deletion</h6>
          <div className="mb-4">
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Your account is deleted immediately.
            </p>
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              You are logged out on that device.
            </p>
            <p>
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              You will no longer be able to sign in with that account.
            </p>
          </div>

          <h6 className="mb-2">4. Account data that is deleted</h6>
          <div className="mb-4">
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Your profile (name, email, phone, address, password, and profile
              photo).
            </p>
            <p className="mb-1">
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Saved travelers stored on your account.
            </p>
            <p>
              <i className="ti ti-square-rotated-filled text-primary me-2" />{" "}
              Sign-in session and password-reset codes for that account.
            </p>
          </div>

          <h6 className="mb-2">5. Information that may be retained</h6>
          <div className="mb-4">
            <p className="mb-3">
              Booking, payment, and related travel records may be kept where
              required to fulfill a reservation, meet legal, tax, or accounting
              obligations, or resolve disputes with suppliers. Those records
              are not used to keep your YoTrip login active.
            </p>
            <p>
              If you later create a new account with the same email, it is a
              new account and does not restore the deleted one.
            </p>
          </div>

          <h6 className="mb-2">6. Processing time</h6>
          <p className="mb-4">
            Account deletion is processed immediately when you confirm it while
            signed in. There is no additional waiting period in the app or on
            the website.
          </p>

          <h6 className="mb-2">7. If you cannot access your account</h6>
          <p className="mb-1">
            If you cannot sign in to complete deletion yourself, contact YoTrip
            support from the{" "}
            <Link to={routes.contactUs}>Contact Us</Link> page, or email{" "}
            <a href="mailto:bookings@yotrip.com">bookings@yotrip.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
