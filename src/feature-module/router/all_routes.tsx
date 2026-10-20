import LoginModal from "@/core/common/modal/loginModal";

export const all_routes = {
  //Home

  home1: "/index",
  home2: "/index-2",
  home3: "/index-3",
  home4: "/index-4",
  home5: "/index-5",
  home6: "/index-6",

  // auth routes routes
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  changepassword: "/change-password",

  //Flight
  flightGrid: "/flight/flight-grid",
  flightList: "/flight/flight-list",
  flightDetails: "/flight/flight-details",
  flightBooking: "/flight/flight-booking",
  flightCheckoutLink: "/flight/flight-booking/:checkoutId",
  flightBookingConfirmation: "/flight/flight-booking-confirmation",
  flightMyBookings: "/flight/my-bookings",
  yourBookings: "/your-bookings",
  paymentStatus: "/payment-status",

  //Hotel
  hotelGrid: "/hotel/hotel-grid",
  hotelList: "/hotel/hotel-list",
  hotelMap: "/hotel/hotel-map",
  hotelDetails: "/hotel/hotel-details/:hotelId",
  hotelBooking: "/hotel/hotel-booking",
  hotelCheckoutLink: "/hotel/hotel-booking/:checkoutId",
  hotelBookingConfirmation: "/hotel/hotel-booking-confirmation",

  //Package (HostNSell PackageB2C)
  packageGrid: "/package/package-grid",
  packageDetails: "/package/package-details/:packageId",

  //Car
  carGrid: "/car/car-grid",
  carList: "/car/car-list",
  carMap: "/car/car-map",
  carDetails: "/car/car-details",
  carBooking: "/car/car-booking",
  carCheckoutLink: "/car/car-booking/:checkoutId",
  carBookingConfirmation: "/car/car-booking-confirmation",

  //cruise
  cruiseGrid: "/cruise/cruise-grid",
  cruiseList: "/cruise/cruise-list",
  cruiseDetails: "/cruise/cruise-details",
  cruiseBookingConfirmation: "/cruise/cruise-booking-confirmation",
  cruiseBooking: "/cruise/cruise-booking",
  cruiseMap: "/cruise/cruise-map",
  //tour
  tourGrid: "/tour/tour-grid",
  tourList: "/tour/tour-list",
  tourMap: "/tour/tour-map",
  tourBooking: "/tour/tour-booking",
  tourBookingConfirmation: "/tour/tour-booking-confirmation",
  tourDetails: "/tour/tour-details",

  //User DashBoard
  userDashboard: "/user/dashboard",

  payment: "/user/payment",
  customerHotelBooking: "/user/customer-hotel-booking",
  userMyProfile: "/user/my-profile",
  userProfileSettings: "/user/profile-settings",
  chat: "/user/chat",

  userFlightBooking: "/user/customer-flight-booking",
  userCarBooking: "/user/customer-car-booking",
  userCruiseBooking: "/user/customer-cruise-booking",
  userHotlesBooking: "/user/customer-hotel-booking",
  userTourBooking: "/user/customer-tour-booking",
  userReviews: "/user/review",
  userChat: "/user/chat",
  userWishlist: "/user/wishlist",
  userWallet: "/user/wallet",
  myProfile: "/user/my-profile",
  profileSettings: "/user/profile-settings",
  notification: "/user/notifications",
  securitySettings: "/user/security-settings",
  notificationSettings: "/user/notification-settings",
  integrationSettings: "/user/integration-settings",

  //Pages

  wishlist: "/wishlist",
  becomeAnExpert: "/become-an-expert",
  privacyPolicy: "/pages/privacy-policy",
  deleteAccount: "/pages/delete-account",
  termsConditions: "/terms-conditions",
  contactUs: "/pages/contact-us",
  blogList: "/blog/blog-list",
  blogGrid: "blog/blog-grid",
  blogDetails: "blog/blog-details",
  destination: "/pages/destination",
  about_us: "/pages/about-us",
  halal: "/halal",
  teams: "/pages/team",
  invoices: "/pages/invoices",
  Gallery: "/pages/gallery",
  Testimonials: "/pages/testimonials",
  FAQ: "/pages/faq",
  Error404: "/pages/error-404",
  Error500: "/pages/error-500",
  underMaintenance: "/pages/under-maintenance",
  homeOneRtl: "/pages/rtl",
  comingSoon: "/pages/coming-soon",

  adminDashboard: "/admin/dashboard",
  AddFaqModal: "/addfaqmodal",
  EditFaqModal: "/EditFaqModal",
  FAQ1: "/faq1",
  DeleteFaqModal: "/deletefaqmodal",

  LoginModal: "/loginmodal",

  careers: "/pages/careers",

  // ── Admin Panel (new) ─────────────────────────────────
  adminLogin: "/admin",
  adminOverview: "/admin/overview",
  adminBookings: "/admin/bookings",
  adminPayments: "/admin/payments",
  adminCoupons: "/admin/coupons",
  adminOffers: "/admin/offers",
  adminCruiseReview: "/admin/cruise-review",
  adminReports: "/admin/reports",
  adminPricing: "/admin/pricing",
  adminConfig: "/admin/config",
  adminAuditLogs: "/admin/audit-logs",
  adminStaff: "/admin/staff",
  adminChangePassword: "/admin/change-password",
  adminProfile: "/admin/profile",
  adminUsers: "/admin/users",
  adminVendors: "/admin/vendors",
  adminFaqs: "/admin/faqs",
  adminGallery: "/admin/gallery",
  adminCareers: "/admin/careers",
  adminTestimonials: "/admin/testimonials-manage",
  adminRefundRequests: "/admin/refund-requests",
  adminPayouts: "/admin/payouts",
};
