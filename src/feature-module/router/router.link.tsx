import { Navigate, Route } from "react-router-dom";
import { all_routes } from "./all_routes";
import Login from "../auth/login/login";
import HomeOne from "../home-one/homeOne";
import Payment from "../userDashboard/payment/payment";
import { REGISTER_MODAL_URL } from "../../core/common/header/authModalParam";
import { yourBookingsPath } from "../../utils/yourBookings";
import ForgotPassword from "../auth/forgot-password/forgotPassword";
import ChangePassword from "../auth/change-password/changePassword";
import HomeTwo from "../home-Two/homeTwo";
import HomeThree from "../home-three/homeThree";
import HomeFour from "../home-four/homeFour";
import HomeFive from "../home-five/homeFive";
import HomeSix from "../home-six/homeSix";
import TourGrid from "../tour/tour-grid/tourGrid";
import HotelMap from "../hotel/hotel-map/hotelMap";
import HotelDetails from "../hotel/hotel-details/hotelDetails";
import TourList from "../tour/tour-list/tourList";
import TourMap from "../tour/tour-map/tourMap";
import TourBooking from "../tour/tour-booking/tourBooking";
import TourBookingConfirmation from "../tour/tour-bookingConfirmation/tourBookingConfirmation";
import CuriseGrid from "../curise/curise-grid/curiseGrid";
import BlogList from "../blog/blog-list/blogList";
import BlogGrid from "../blog/blog-grid/blogGrid";
import BlogDetails from "../blog/blog-details/blogDetails";
import Destination from "../pages/Destination/destination";
import AboutUs from "../pages/about-us/about_us";
import HalalPage from "../halal/HalalPage";
import Teams from "../pages/teams/teams";
import CarList from "../car/car-list/carList";
import FlightList from "../flight/flight-list/flightList";
import CruiseList from "../curise/cruise-list/cruiseList";
import HotelList from "../hotel/hotel-list/hotelList";
import HotelGrid from "../hotel/hotel-grid/hotelGrid";
import FlightGrid from "../flight/flight-grid/flightGrid";
import Invoices from "../pages/invoices/invoices";
import Notification from "../userDashboard/notification/notification";
import UserChat from "../userDashboard/message/userChat";
import UserWallet from "../userDashboard/wallet/userWallet";
import MyProfile from "../userDashboard/myProfile/myProfile";
import ProfileSettings from "../userDashboard/settings/profileSettings";
import UserCruiseBooking from "../userDashboard/myBooking/cruise/userCruiseBooking";
import HotelBooking from "../hotel/hotel-booking/hotelBooking";
import HotelCheckoutLink from "../hotel/hotel-booking/hotelCheckoutLink";
import HotelBookingConfirmation from "../hotel/hotel-booking-confirmation/hotelBookingConfirmation";
import PrivacyPolicy from "../pages/privacy-policy/privacyPolicy";
import DeleteAccountPage from "../pages/delete-account/deleteAccount";
import ContactUs from "../pages/contact/contactUs";
import Career from "../pages/careers/career";
import CarGrid from "../car/car-grid/carGrid";
import PackageGrid from "../package/package-grid/packageGrid";
import PackageDetails from "../package/package-details/packageDetails";
import Error404 from "../pages/error/Error404";
import Error500 from "../pages/error/Error500";
import FAQ from "../pages/Faq/FAQ";
import Gallery from "../pages/Gallery/Gallery";
import Testimonials from "../pages/Testimonials/Testimonials";
import UnderMaintenance from "../pages/under-maintenance/UnderMaintenance";
import CarMap from "../car/car-map/carMap";
import TourDetails from "../tour/tour-details/tourDetails";
import CarDetails from "../car/car-details/carDetails";
import CruiseBooking from "../curise/cruise-booking/cruiseBooking";
import CruiseDetails from "../curise/curise-details/curiseDetails";
import CruiseBookingConfirmation from "../curise/cruise-booking-confirmation/cruiseBookingConfirmation";
import CruiseMap from "../curise/cruise-map/cruiseMap";
import FlightDetails from "../flight/flight-details/flightDetails";
import FlightBooking from "../flight/flight-booking/flightBooking";
import FlightCheckoutLink from "../flight/flight-booking/flightCheckoutLink";
import FlightBookingConfirmation from "../flight/flight-booking-confirmation/flightBookingConfirmation";
import MyBookings from "../flight/my-bookings/myBookings";
import PaymentStatusPage from "../payment/paymentStatus";
import CarBooking from "../car/car-booking/carBooking";
import CarCheckoutLink from "../car/car-booking/carCheckoutLink";
import CarBookingConfirmation from "../car/car-booking-confirmation/carBookingConfirmation";
import Dashboard from "../userDashboard/dashboard/dashboard";
import UserTourBooking from "../userDashboard/myBooking/tour/userTourBooking";
import UserReviews from "../userDashboard/myReviews/userReviews";
import NotificationSettings from "../userDashboard/settings/notificationSettings";
import IntegrationSettings from "../userDashboard/settings/integrationSettings";
import SecuritySettings from "../userDashboard/settings/securitySettings";
import HomeOneRTL from "../pages/rtl/home-one/homeOne";
import ComingSoon from "../pages/coming-soon/comingSoon";
import TermsConditions from "../pages/terms-conditions/termsConditions";
import EditFaqModal from "../../core/common/modal/editFaqModal";
import AddFaqModal from "../../core/common/modal/addFaqModal";
import DeleteFaqModal from "../..//core/common/modal/deleteFaqModal";
import FAQ1 from "../../core/common/modal/FAQmodal";
import ProtectedRoute from "./ProtectedRouter";
import LoginModal from "../../core/common/modal/loginModal";

// ── Admin Panel (new) ───────────────────────────────────
import AdminLogin from "../admin-panel/pages/AdminLogin";
import AdminDashboard from "../admin-panel/pages/AdminDashboard";
import AdminBookings from "../admin-panel/pages/AdminBookings";
import AdminPayments from "../admin-panel/pages/AdminPayments";
import AdminCoupons from "../admin-panel/pages/AdminCoupons";
import AdminOffers from "../admin-panel/pages/AdminOffers";
import AdminCruiseReview from "../admin-panel/pages/AdminCruiseReview";
import AdminReports from "../admin-panel/pages/AdminReports";
import AdminPricing from "../admin-panel/pages/AdminPricing";
import AdminConfig from "../admin-panel/pages/AdminConfig";
import AdminAuditLogs from "../admin-panel/pages/AdminAuditLogs";
import AdminStaff from "../admin-panel/pages/AdminStaff";
import AdminChangePassword from "../admin-panel/pages/AdminChangePassword";
import AdminProfile from "../admin-panel/pages/AdminProfile";
import AdminUsers from "../admin-panel/pages/AdminUsers";
import AdminVendors from "../admin-panel/pages/AdminVendors";
import AdminFaqs from "../admin-panel/pages/AdminFaqs";
import AdminGallery from "../admin-panel/pages/AdminGallery";
import AdminCareers from "../admin-panel/pages/AdminCareers";
import AdminTestimonialsManage from "../admin-panel/pages/AdminTestimonials";
import AdminRefundRequests from "../admin-panel/pages/AdminRefundRequests";
import AdminPayouts from "../admin-panel/pages/AdminPayouts";

const routes = all_routes;

export const publicRoutes = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to="/index" />,
    route: Route,
  },
  {
    path: routes.home1,
    element: <HomeOne />,
    route: Route,
  },
  {
    path: routes.home2,
    element: <HomeTwo />,
    route: Route,
  },
  {
    path: routes.home3,
    element: <HomeThree />,
    route: Route,
  },
  {
    path: routes.home4,
    element: <HomeFour />,
    route: Route,
  },
  {
    path: routes.home5,
    element: <HomeFive />,
    route: Route,
  },
  {
    path: routes.home6,
    element: <HomeSix />,
    route: Route,
  },
  {
    path: routes.payment,
    element: <Payment />,
    route: Route,
  },
  {
    path: routes.tourGrid,
    element: <TourGrid />,
    route: Route,
  },
  {
    path: routes.tourList,
    element: <TourList />,
    route: Route,
  },
  {
    path: routes.hotelList,
    element: <HotelList />,
    route: Route,
  },
  {
    path: routes.hotelGrid,
    element: <HotelGrid />,
    route: Route,
  },
  {
    path: routes.packageGrid,
    element: <PackageGrid />,
    route: Route,
  },
  {
    path: routes.packageDetails,
    element: <PackageDetails />,
    route: Route,
  },
  {
    path: routes.carGrid,
    element: <CarGrid />,
    route: Route,
  },
  {
    path: routes.carList,
    element: <CarList />,
    route: Route,
  },
  {
    path: routes.flightList,
    element: <FlightList />,
    route: Route,
  },
  {
    path: routes.flightGrid,
    element: <FlightGrid />,
    route: Route,
  },
  {
    path: routes.cruiseList,
    element: <CruiseList />,
    route: Route,
  },
  {
    path: routes.tourMap,
    element: <TourMap />,
    route: Route,
  },
  {
    path: routes.tourBooking,
    element: <TourBooking />,
    route: Route,
  },
  {
    path: routes.tourBookingConfirmation,
    element: <TourBookingConfirmation />,
    route: Route,
  },
  {
    path: routes.hotelMap,
    element: <HotelMap />,
    route: Route,
  },
  {
    path: routes.hotelDetails,
    element: <HotelDetails />,
    route: Route,
  },
  {
    path: routes.cruiseGrid,
    element: <CuriseGrid />,
    route: Route,
  },
  {
    path: routes.blogList,
    element: <BlogList />,
    route: Route,
  },
  {
    path: routes.blogGrid,
    element: <BlogGrid />,
    route: Route,
  },
  {
    path: routes.blogDetails,
    element: <BlogDetails />,
    route: Route,
  },
  {
    path: routes.destination,
    element: <Destination />,
    route: Route,
  },
  {
    path: routes.about_us,
    element: <AboutUs />,
    route: Route,
  },
  {
    path: routes.halal,
    element: <HalalPage />,
    route: Route,
  },
  {
    path: routes.careers,
    element: <Career />,
    route: Route,
  },
  {
    path: routes.teams,
    element: <Teams />,
    route: Route,
  },
  {
    path: routes.invoices,
    element: <Invoices />,
    route: Route,
  },

  {
    path: routes.hotelBooking,
    element: <HotelBooking />,
    route: Route,
  },
  {
    // Chat assistant hand-off: a room it picked, ready for guest details + payment.
    path: routes.hotelCheckoutLink,
    element: <HotelCheckoutLink />,
    route: Route,
  },
  {
    path: routes.hotelBookingConfirmation,
    element: <HotelBookingConfirmation />,
    route: Route,
  },
  {
    path: routes.privacyPolicy,
    element: <PrivacyPolicy />,
    route: Route,
  },
  {
    path: "/delete-account",
    element: <Navigate to={routes.deleteAccount} replace />,
    route: Route,
  },
  {
    path: routes.deleteAccount,
    element: <DeleteAccountPage />,
    route: Route,
  },
  {
    path: routes.contactUs,
    element: <ContactUs />,
    route: Route,
  },
  {
    path: routes.FAQ1,
    element: <FAQ1 />,
    route: Route,
  },
  {
    path: routes.Gallery,
    element: <Gallery />,
    route: Route,
  },
  {
    path: routes.Testimonials,
    element: <Testimonials />,
    route: Route,
  },
  {
    path: routes.underMaintenance,
    element: <UnderMaintenance />,
    route: Route,
  },
  {
    path: routes.carMap,
    element: <CarMap />,
    route: Route,
  },
  {
    path: routes.tourDetails,
    element: <TourDetails />,
    route: Route,
  },
  {
    path: routes.cruiseMap,
    element: <CruiseMap />,
    route: Route,
  },
  {
    path: routes.flightDetails,
    element: <FlightDetails />,
    route: Route,
  },
  {
    path: routes.EditFaqModal,
    element: (
      <EditFaqModal
        formData={{
          question: "",
          answer: "",
        }}
        onChange={function (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ): void {
          throw new Error("Function not implemented.");
        }}
        onSubmit={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    ),
    route: Route,
  },
  {
    path: routes.FAQ,
    element: <FAQ />,
    route: Route,
  },
  {
    path: routes.DeleteFaqModal,
    Element: (
      <DeleteFaqModal
        onConfirm={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    ),
    route: Route,
  },

  {
    path: routes.AddFaqModal,
    element: (
      <AddFaqModal
        formData={{
          question: "",
          answer: "",
        }}
        onChange={function (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ): void {
          throw new Error("Function not implemented.");
        }}
        onSubmit={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    ),
    route: Route,
  },
  {
    path: routes.flightBooking,
    element: <FlightBooking />,
    route: Route,
  },
  {
    // Chat assistant hand-off: a flight it picked, ready for traveller details + payment.
    path: routes.flightCheckoutLink,
    element: <FlightCheckoutLink />,
    route: Route,
  },
  {
    path: routes.flightBookingConfirmation,
    element: <FlightBookingConfirmation />,
    route: Route,
  },
  {
    path: routes.flightMyBookings,
    element: <MyBookings />,
    route: Route,
  },
  {
    path: routes.yourBookings,
    element: <MyBookings />,
    route: Route,
  },
  {
    path: routes.paymentStatus,
    element: <PaymentStatusPage />,
    route: Route,
  },
  {
    path: routes.carDetails,
    element: <CarDetails />,
    route: Route,
  },
  {
    path: routes.cruiseBooking,
    element: <CruiseBooking />,
    route: Route,
  },
  {
    path: routes.cruiseDetails,
    element: <CruiseDetails />,
    route: Route,
  },
  {
    path: routes.cruiseBookingConfirmation,
    element: <CruiseBookingConfirmation />,
    route: Route,
  },
  {
    path: routes.carBooking,
    element: <CarBooking />,
    route: Route,
  },
  {
    // Chat assistant hand-off: a car it picked, ready for driver details + payment.
    path: routes.carCheckoutLink,
    element: <CarCheckoutLink />,
    route: Route,
  },
  {
    path: routes.carBookingConfirmation,
    element: <CarBookingConfirmation />,
    route: Route,
  },

  // The agent dashboard was theme demo data with no backend; staff work lives
  // in the admin panel. Redirect rather than 404 so old bookmarks still land.
  { path: "/agent/*", element: <Navigate to={routes.adminLogin} replace />, route: Route },
  {
    path: routes.homeOneRtl,
    element: <HomeOneRTL />,
    route: Route,
  },
  {
    path: routes.termsConditions,
    element: <TermsConditions />,
    route: Route,
  },
  {
    path: routes.LoginModal,
    element: <LoginModal closeHandler={() => {}} setOpenModal={() => {}} />,
    route: Route,
  },
];

export const authRoutes = [
  {
    path: routes.login,
    element: <Login />,
    route: Route,
  },
  // {
  //   path: routes.admin,
  //   element: <Admin />,
  //   route: Route,
  // },
  {
    // The standalone sign-up page was template scaffolding: it POSTed to
    // /api/auth/adminregister, which the backend never registered, so it could
    // never create an account. Bookmarks and old links now land on the home
    // page with the working OTP signup modal open.
    path: routes.register,
    element: <Navigate to={REGISTER_MODAL_URL} replace />,
    route: Route,
  },
  {
    path: routes.forgotPassword,
    element: <ForgotPassword />,
    route: Route,
  },
  {
    path: routes.changepassword,
    element: <ChangePassword />,
    route: Route,
  },

  {
    path: routes.Error404,
    element: <Error404 />,
    route: Route,
  },
  {
    path: routes.Error500,
    element: <Error500 />,
    route: Route,
  },
  {
    path: routes.underMaintenance,
    element: <UnderMaintenance />,
    route: Route,
  },
  {
    path: routes.comingSoon,
    element: <ComingSoon />,
    route: Route,
  },
];

export const protectedRoutes = [
  { path: routes.userDashboard, element: <Dashboard /> },

  { path: routes.userFlightBooking, element: <Navigate to={yourBookingsPath("flight")} replace /> },
  { path: routes.userCarBooking, element: <Navigate to={yourBookingsPath("car")} replace /> },
  { path: routes.userHotlesBooking, element: <Navigate to={yourBookingsPath("hotel")} replace /> },
  { path: routes.userCruiseBooking, element: <UserCruiseBooking /> },
  { path: routes.userTourBooking, element: <UserTourBooking /> },

  { path: routes.userReviews, element: <UserReviews /> },
  { path: routes.userChat, element: <UserChat /> },

  // Wishlist is disabled until the save/wishlist feature ships (feat/wishlist).
  { path: routes.userWallet, element: <UserWallet /> },

  { path: routes.myProfile, element: <MyProfile /> },
  { path: routes.profileSettings, element: <ProfileSettings /> },

  { path: routes.securitySettings, element: <SecuritySettings /> },
  { path: routes.notificationSettings, element: <NotificationSettings /> },
  { path: routes.integrationSettings, element: <IntegrationSettings /> },

  { path: routes.payment, element: <Payment /> },
  { path: routes.notification, element: <Notification /> },
];

// ── Admin Panel — dedicated area (no storefront header/footer) ──────────
export const adminRoutes = [
  { path: routes.adminLogin, element: <AdminLogin /> },
  { path: routes.adminOverview, element: <AdminDashboard /> },
  { path: routes.adminBookings, element: <AdminBookings /> },
  { path: routes.adminPayments, element: <AdminPayments /> },
  { path: routes.adminCoupons, element: <AdminCoupons /> },
  { path: routes.adminOffers, element: <AdminOffers /> },
  { path: routes.adminCruiseReview, element: <AdminCruiseReview /> },
  { path: routes.adminReports, element: <AdminReports /> },
  { path: routes.adminPricing, element: <AdminPricing /> },
  { path: routes.adminConfig, element: <AdminConfig /> },
  { path: routes.adminAuditLogs, element: <AdminAuditLogs /> },
  { path: routes.adminStaff, element: <AdminStaff /> },
  { path: routes.adminChangePassword, element: <AdminChangePassword /> },
  { path: routes.adminProfile, element: <AdminProfile /> },
  { path: routes.adminUsers, element: <AdminUsers /> },
  { path: routes.adminVendors, element: <AdminVendors /> },
  { path: routes.adminFaqs, element: <AdminFaqs /> },
  { path: routes.adminGallery, element: <AdminGallery /> },
  { path: routes.adminCareers, element: <AdminCareers /> },
  { path: routes.adminTestimonials, element: <AdminTestimonialsManage /> },
  { path: routes.adminRefundRequests, element: <AdminRefundRequests /> },
  { path: routes.adminPayouts, element: <AdminPayouts /> },
];
