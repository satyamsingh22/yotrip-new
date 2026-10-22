import { useEffect, useState } from 'react'
import { all_routes } from '../../../feature-module/router/all_routes'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import UserAvatar from '../userAvatar/UserAvatar'
import { parseBookingTab, yourBookingsPath } from '@/utils/yourBookings'
import './yt-sidebar.scss'

/** Account sidebar for the user dashboard pages (mock: avatar card + menu). */
const Sidebar = () => {
    const routes = all_routes
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    const location = useLocation()
    const { logout } = useAuth()
    const bookingTab = parseBookingTab(new URLSearchParams(location.search).get('tab'))
    const onYourBookings =
        location.pathname.includes('your-bookings') ||
        location.pathname.includes('my-bookings')
    const onBookings = onYourBookings || location.pathname.includes('customer')
    const [bookingsOpen, setBookingsOpen] = useState(onBookings)

    useEffect(() => {
        setBookingsOpen(onBookings)
    }, [onBookings])

    const name = localStorage.getItem('name') || 'User'
    const image = localStorage.getItem('profileImage')

    const item = (to: string, icon: string, label: string, active: boolean) => (
        <li>
            <Link to={to} className={`ysb__link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                <i className={`isax ${icon}`} aria-hidden />
                <span>{label}</span>
            </Link>
        </li>
    )

    return (
        <aside className="ysb theiaStickySidebar" aria-label="Account">
            <div className="ysb__profile">
                <UserAvatar
                    src={image ? `${BASE_URL}${image}` : null}
                    name={name}
                    alt="User"
                    className="ysb__avatar"
                />
                <h2 className="ysb__name">{name}</h2>
                <span className="ysb__role">Travel Explorer</span>
            </div>

            <ul className="ysb__menu">
                {item(routes.userDashboard, 'isax-home-2', 'Dashboard', location.pathname === routes.userDashboard)}
                <li>
                    <button
                        type="button"
                        className={`ysb__link${onBookings ? ' is-active' : ''}`}
                        aria-expanded={bookingsOpen}
                        onClick={() => setBookingsOpen((v) => !v)}
                    >
                        <i className="isax isax-calendar-1" aria-hidden />
                        <span>Your Bookings</span>
                        <i className={`isax isax-arrow-right-3 ysb__chevron${bookingsOpen ? ' is-open' : ''}`} aria-hidden />
                    </button>
                    {bookingsOpen && (
                        <ul className="ysb__sub">
                            {(['flight', 'hotel', 'car'] as const).map((tab) => (
                                <li key={tab}>
                                    <Link
                                        to={yourBookingsPath(tab)}
                                        className={onYourBookings && bookingTab === tab ? 'is-active' : ''}
                                    >
                                        {{ flight: 'Flights', hotel: 'Hotels', car: 'Cars' }[tab]}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
                {item(routes.userReviews, 'isax-star-1', 'My Reviews', location.pathname.includes('review'))}
                {item(routes.myProfile, 'isax-user', 'My Profile', location.pathname.includes('my-profile'))}
                {item(routes.profileSettings, 'isax-setting-2', 'Settings', location.pathname.includes('settings'))}
                <li>
                    <button type="button" className="ysb__link" onClick={logout}>
                        <i className="isax isax-logout" aria-hidden />
                        <span>Logout</span>
                    </button>
                </li>
            </ul>
        </aside>
    )
}

export default Sidebar
