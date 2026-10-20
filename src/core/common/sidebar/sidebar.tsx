import  { useEffect, useState } from 'react'
import ImageWithBasePath from '../imageWithBasePath'
import { all_routes } from '../../../feature-module/router/all_routes'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FaqFive from '@/feature-module/home-five/faqFive'
import axios from 'axios'
import { Button } from 'antd'
import { useAuth } from '@/context/AuthContext'
import UserAvatar from '../userAvatar/UserAvatar'
import { parseBookingTab, yourBookingsPath } from '@/utils/yourBookings'

const Sidebar = () => {

    const routes = all_routes
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    const location = useLocation();
    const bookingTab = parseBookingTab(
        new URLSearchParams(location.search).get("tab"),
    );
    const onYourBookings =
        location.pathname.includes("your-bookings") ||
        location.pathname.includes("my-bookings");
    const [subdroptoggle, setsubdroptoggle] = useState(false);
    const navigate = useNavigate()
    const {logout} = useAuth()

    useEffect(() => {
        const onBookings =
            location.pathname.includes("customer") ||
            location.pathname.includes("your-bookings") ||
            location.pathname.includes("my-bookings");
        setsubdroptoggle(onBookings);
    }, [location.pathname]);


  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Only render a join date we can actually parse — an unparseable/absent
  // createdAt used to render the literal string "Joined on Invalid Date".
  const joinedDate = user?.createdAt ? new Date(user.createdAt) : null;
  const joinedOn =
    joinedDate && !Number.isNaN(joinedDate.getTime())
      ? joinedDate.toDateString()
      : null;


  


    return (
        <div>
            {/* Sidebar */}
            <div className="card user-sidebar mb-4 mb-lg-0 theiaStickySidebar">
                <div className="card-header user-sidebar-header">
                    <div className="profile-content rounded-pill">
                        <div className="d-flex align-items-center justify-content-between ">
                            <div className=" d-flex align-items-center justify-content-center ">
                            <UserAvatar
                                src={
                                    localStorage.getItem("profileImage")
                                        ? `${BASE_URL}${localStorage.getItem("profileImage")}`
                                        : null
                                }
                                name={localStorage.getItem("name")}
                                alt="User"
                                className="avatar avatar-xl rounded-circle me-2"
                            />
                                <div>
                                    <h6 className="fs-16">{localStorage.getItem("name") || "User"}</h6>
                                    {joinedOn && (
                                        <span className="fs-14 text-gray-6">Joined on {joinedOn}</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="d-flex align-items-center justify-content-center">
                                    <Link
                                        to={routes.profileSettings}
                                        className="p-1 rounded-circle btn btn-light d-flex align-items-center justify-content-center"
                                    >
                                        <i className="isax isax-edit-2 fs-14" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body user-sidebar-body">
                    <ul>
                        <li>
                            <span className="fs-14 text-gray-3 fw-medium mb-2">Main</span>
                        </li>
                        <li>
                            <Link
                                to={routes.userDashboard}
                                className={`d-flex align-items-center text-decoration-none ${location.pathname === routes.userDashboard && 'active'}`}
                            >
                                <i className="isax isax-grid-55" />
                                Dashboard
                            </Link>
                        </li>
                        <li className="submenu ">
                            <Link   to="#" onClick={() => setsubdroptoggle(!subdroptoggle)}
                                className={`d-block ${subdroptoggle ? 'subdrop' : ''} text-decoration-none ${location.pathname.includes('customer') || onYourBookings ? 'active' : ''}`}>
                                <i className="isax isax-calendar-tick5" />
                                <span>Your Bookings</span>
                                <span className="menu-arrow" />
                            </Link>
                            <ul className={` ${subdroptoggle && 'd-block'}`}>
                                <li>
                                    <Link
                                        to={yourBookingsPath("flight")}
                                        className={`fs-14 d-inline-flex text-decoration-none align-items-center ${onYourBookings && bookingTab === "flight" ? "active" : ""}`}
                                    >
                                        Flights
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to={yourBookingsPath("hotel")}
                                        className={`fs-14 d-inline-flex text-decoration-none align-items-center ${onYourBookings && bookingTab === "hotel" ? "active" : ""}`}
                                    >
                                        Hotels
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to={yourBookingsPath("car")}
                                        className={`fs-14 d-inline-flex text-decoration-none align-items-center ${onYourBookings && bookingTab === "car" ? "active" : ""}`}
                                    >
                                        Cars
                                    </Link>
                                </li>
                                {/* Temporarily hidden — re-enable when Tours & Cruise ship
                                <li>
                                    <Link
                                        to={routes.userCruiseBooking}
                                        className={`fs-14 d-inline-flex text-decoration-none align-items-center ${location.pathname.includes('customer-cruise-booking') ? 'active' : ''}`}
                                    >
                                        Cruise
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to={routes.userTourBooking}
                                        className={`fs-14 d-inline-flex text-decoration-none align-items-center ${location.pathname.includes('customer-tour-booking') ? 'active' : ''}`}
                                    >
                                        Tour
                                    </Link>
                                </li>
                                */}
                            </ul>
                        </li>
                        <li>
                            <Link to={routes.userReviews} className={`d-flex text-decoration-none align-items-center ${location.pathname.includes('review') ? 'active' : ''}`}>
                                <i className="isax isax-magic-star5" /> My Reviews
                            </Link>
                        </li>
                        {/* Messages hidden for now.
                        <li className="mb-2">
                            <div className="message-content">
                                <Link to={routes.userChat} className={`d-flex text-decoration-none align-items-center ${location.pathname.includes('chat') ? 'active' : ''}`}>
                                    <i className="isax isax-message-square5" /> Messages
                                </Link>
                            </div>
                        </li>
                        */}
                        {/* Wishlist is hidden until the save/wishlist feature ships (feat/wishlist). */}
                        {/* Finance section hidden for now.
                        <li>
                            <span className="fs-14 text-gray-3 fw-medium mb-2">Finance</span>
                        </li>
                        <li>
                            <Link to={routes.userWallet} className={`d-flex text-decoration-none align-items-center ${location.pathname.includes('wallet') ? 'active' : ''}`}>
                                <i className="isax isax-wallet-add-15" /> Wallet
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link to={routes.payment} className={`d-flex text-decoration-none align-items-center ${location.pathname.includes('payment') ? 'active' : ''}`}>
                                <i className="isax isax-money-recive5" /> Payments
                            </Link>
                        </li>
                        */}
                        <li>
                            <span className="fs-14  text-gray-3 fw-medium mb-2">Account</span>
                        </li>
                        <li>
                            <Link to={routes.myProfile} className={`d-flex text-decoration-none align-items-center ${location.pathname.includes('my-profile') ? 'active' : ''}`}>
                                <i className="isax isax-profile-tick5" /> My Profile
                            </Link>
                        </li>
                        {/* Notifications hidden for now.
                        <li>
                            <div className="message-content">
                                <Link
                                    to={routes.notification}
                                    className={`d-flex text-decoration-none align-items-center ${location.pathname.includes('notifications') ? 'active' : ''}`}
                                >
                                    <i className="isax isax-notification-bing5" /> Notifications
                                </Link>
                            </div>
                        </li>
                        */}
                        <li>
                            <Link
                                to={routes.profileSettings}
                                className={`d-flex text-decoration-none align-items-center ${location.pathname.includes('settings') ? 'active' : ''}`}
                            >
                                <i className="isax isax-setting-25" /> Settings
                            </Link>
                        </li>
                       
                        <li>
                            <Link to={""} onClick={logout}  className="d-flex text-decoration-none align-items-center pb-0">
                                <i className="isax isax-logout-15" /> Logout
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            {/* /Sidebar */}

        </div>
    )
}

export default Sidebar
