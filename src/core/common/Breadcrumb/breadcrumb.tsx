import React from 'react';
import { all_routes } from '../../../feature-module/router/all_routes';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    link?: string;
    active?: boolean;
}
interface BreadcrumbProps {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    backgroundClass?: string;
    /** Text-only breadcrumb — no hero image or page title. */
    compact?: boolean;
    /** Shorter hero band for listing pages (image + title + crumbs). */
    slimHero?: boolean;
}


const Breadcrumb: React.FC<BreadcrumbProps> = ({
    title,
    breadcrumbs,
    backgroundClass,
    compact = false,
    slimHero = false,
}) => {


    const location = useLocation();

    const breadCrumbPages =
        location.pathname === "/user/customer-flight-booking" ||
        location.pathname === "/user/customer-car-booking" ||
        location.pathname === "/user/customer-hotel-booking" ||
        location.pathname === "/user/customer-tour-booking";

    return (
        <div
            className={`breadcrumb-bar ${backgroundClass ?? ""} ${compact ? "yt-breadcrumb--compact" : ""} ${slimHero ? "yt-breadcrumb--slim-hero" : ""} ${compact || slimHero ? "text-start" : "text-center"}`}
        >
            <div className="container">
                <div className="row">
                    <div className="col-md-12 col-12">
                        {!compact && (
                            <h2
                                className={`breadcrumb-title fw-bold ${slimHero ? "yt-breadcrumb__title--slim mb-1" : "mb-2"}`}
                            >
                                {title}
                            </h2>
                        )}
                        <nav aria-label="breadcrumb">
                            <ol
                                className={`breadcrumb mb-0 ${compact || slimHero ? "justify-content-start" : "justify-content-center"}`}
                            >
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <li
                                        key={index}
                                        className={`fw-normal breadcrumb-item ${breadcrumb.active ? 'active' : ''}`}
                                        aria-current={breadcrumb.active ? 'page' : undefined}
                                    >
                                        {breadcrumb.link ? (
                                            <Link to={all_routes.home1}>
                                                {
                                                    breadCrumbPages ? (<i className="isax isax-grid-55"></i>) : (<i className="isax isax-home5"></i>)
                                                }
                                            </Link>
                                        ) : (
                                            breadcrumb.label
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;
