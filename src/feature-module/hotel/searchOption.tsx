import  { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../core/common/imageWithBasePath'
import { DatePicker } from 'antd'
import dayjs from 'dayjs';
import BannerCounter from '../../core/common/banner-counter/counter';
import { all_routes } from '../router/all_routes';

const SearchOption = () => {
    const routes = all_routes
      const [defaultDate] = useState(dayjs());
  return (
    <>
                {/* Hotel Search */}
                <div className="card">
                <div className="card-body">
                    <div className="banner-form">
                        <form className="d-lg-flex">
                            <div className="d-flex  form-info">
                                <div className="form-item dropdown">
                                    <div data-bs-toggle="dropdown" data-bs-auto-close="outside"  role="menu">
                                        <label className="form-label fs-14 text-default mb-1">City, Property name or Location</label>
                                        <input type="text" className="form-control" value="Newyork" />
                                        <p className="fs-12 mb-0">USA</p>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
                                        <div className="input-search p-3 border-bottom">
                                            <div className="input-group">
                                                <input type="email" className="form-control" placeholder="Search for City, Property name or Location" />
                                                <span className="input-group-text px-2 border-start-0"><i className="isax isax-search-normal"></i></span>
                                            </div>
                                        </div>
                                        <ul>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">USA</h6>
                                                    <p>2000 Properties</p>
                                                </Link>
                                            </li>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">Japan</h6>
                                                    <p>3000 Properties</p>
                                                </Link>
                                            </li>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">Singapore</h6>
                                                    <p>8000 Properties</p>
                                                </Link>
                                            </li>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">Russia</h6>
                                                    <p>8000 Properties</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">Germany</h6>
                                                    <p>2000 Properties</p>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">Check In</label>
                                    <DatePicker
                                                className="form-control datetimepicker"
                                                placeholder="dd/mm/yyyy"
                                                defaultValue={defaultDate}
                                                format="DD-MM-YYYY"
                                            />
                                    <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">Check Out</label>
                                    <DatePicker
                                                className="form-control datetimepicker"
                                                placeholder="dd/mm/yyyy"
                                                defaultValue={defaultDate}
                                                format="DD-MM-YYYY"
                                            />
                                    <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item dropdown">
                                    <div data-bs-toggle="dropdown" data-bs-auto-close="outside"  role="menu">
                                        <label className="form-label fs-14 text-default mb-1">Guests</label>
                                        <h5>4 <span className="fw-normal fs-14">Persons</span></h5>
                                        <p className="fs-12 mb-0">4 Adult, 2 Rooms</p>
                                    </div>
                                    <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                        <h5 className="mb-3">Select Travelers &  Class</h5>
                                        <div className="mb-3 border br-10 info-item pb-1">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">Rooms</label>
                                                        <BannerCounter/>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">Adults</label>
                                                        <BannerCounter/>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">Children <span className="text-default fw-normal">( 2-12 Yrs )</span></label>
                                                        <BannerCounter/>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">Infants <span className="text-default fw-normal">( 0-12 Yrs )</span></label>
                                                        <BannerCounter/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3 border br-10 info-item pb-1">
                                            <h6 className="fs-16 fw-medium mb-2">Travellers</h6>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <div className="form-check me-3 mb-3">
                                                    <input className="form-check-input" type="radio" name="room" id="room1" checked />
                                                    <label className="form-check-label" htmlFor="room1">
                                                        Single
                                                    </label>
                                                </div>
                                                <div className="form-check me-3 mb-3">
                                                    <input className="form-check-input" type="radio" name="room" id="room2" />
                                                    <label className="form-check-label" htmlFor="room2">
                                                        Double
                                                    </label>
                                                </div>
                                                <div className="form-check me-3 mb-3">
                                                    <input className="form-check-input" type="radio" name="room" id="room3" />
                                                    <label className="form-check-label" htmlFor="room3">
                                                        Delux
                                                    </label>
                                                </div>
                                                <div className="form-check mb-3">
                                                    <input className="form-check-input" type="radio" name="room" id="room4" />
                                                    <label className="form-check-label" htmlFor="room4">
                                                        Suite
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3 border br-10 info-item pb-1">
                                            <h6 className="fs-16 fw-medium mb-2">Property Type</h6>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <div className="form-check me-3 mb-3">
                                                    <input className="form-check-input" type="radio" name="property" id="property1" checked />
                                                    <label className="form-check-label" htmlFor="property1">
                                                        Villa
                                                    </label>
                                                </div>
                                                <div className="form-check me-3 mb-3">
                                                    <input className="form-check-input" type="radio" name="property" id="property2" />
                                                    <label className="form-check-label" htmlFor="property2">
                                                        Condo
                                                    </label>
                                                </div>
                                                <div className="form-check me-3 mb-3">
                                                    <input className="form-check-input" type="radio" name="property" id="property3" />
                                                    <label className="form-check-label" htmlFor="property3">
                                                        Cabin
                                                    </label>
                                                </div>
                                                <div className="form-check mb-3">
                                                    <input className="form-check-input" type="radio" name="property" id="property4" />
                                                    <label className="form-check-label" htmlFor="property4">
                                                        Apartments
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end">
                                            <Link to="#" className="btn btn-light btn-sm me-2">Cancel</Link>
                                            <button type="submit" className="btn btn-primary btn-sm">Apply</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-item dropdown">
                                    <div data-bs-toggle="dropdown" data-bs-auto-close="outside"  role="menu">
                                        <label className="form-label fs-14 text-default mb-1">Price per Night</label>
                                        <input type="text" className="form-control" value="$1000 - $15000" />
                                        <p className="fs-12 mb-0">20 Offers Available</p>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
                                        <ul>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">$500 - $2000</h6>
                                                    <p>Upto 65% offers</p>
                                                </Link>
                                            </li>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">Upto 65% offers</h6>
                                                    <p>Upto 40% offers</p>
                                                </Link>
                                            </li>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">$5000 - $8000</h6>
                                                    <p>Upto 35% offers</p>
                                                </Link>
                                            </li>
                                            <li className="border-bottom">
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">$9000 - $11000</h6>
                                                    <p>Upto 20% offers</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="#">
                                                    <h6 className="fs-16 fw-medium">$11000 - $15000</h6>
                                                    <p>Upto 10% offers</p>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary search-btn rounded">Search</button>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Hotel Search */}

            {/* Hotel Types */}
            <div className="mb-2">
                <div className="mb-3">
                    <h5 className="mb-2">Choose type of Hotels you are interested</h5>
                </div>
                <div className="row">
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className="d-flex align-items-center hotel-type-item mb-3">
                            <Link to={routes.hotelGrid} className="avatar avatar-lg">
                                <ImageWithBasePath src="/assets/img/hotels/hotel-model-01.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2">
                                <h6 className="fs-16 fw-medium"><Link to={routes.hotelGrid}>Condos</Link></h6>
                                <p className="fs-14">216 Hotels</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className="d-flex align-items-center hotel-type-item mb-3">
                            <Link to={routes.hotelGrid} className="avatar avatar-lg">
                                <ImageWithBasePath src="/assets/img/hotels/hotel-model-02.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2">
                                <h6 className="fs-16 fw-medium"><Link to={routes.hotelGrid}>Apartments</Link></h6>
                                <p className="fs-14">569 Hotels</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className="d-flex align-items-center hotel-type-item mb-3">
                            <Link to={routes.hotelGrid} className="avatar avatar-lg">
                                <ImageWithBasePath src="/assets/img/hotels/hotel-model-03.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2">
                                <h6 className="fs-16 fw-medium"><Link to={routes.hotelGrid}>Villas</Link></h6>
                                <p className="fs-14">129 Hotels</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className="d-flex align-items-center hotel-type-item mb-3">
                            <Link to={routes.hotelGrid} className="avatar avatar-lg">
                                <ImageWithBasePath src="/assets/img/hotels/hotel-model-04.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2">
                                <h6 className="fs-16 fw-medium"><Link to={routes.hotelGrid}>5 Star Hotels</Link></h6>
                                <p className="fs-14">600 Hotels</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className="d-flex align-items-center hotel-type-item mb-3">
                            <Link to={routes.hotelGrid} className="avatar avatar-lg">
                                <ImageWithBasePath src="/assets/img/hotels/hotel-model-01.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2">
                                <h6 className="fs-16 fw-medium"><Link to={routes.hotelGrid}>3 Start Hotels</Link></h6>
                                <p className="fs-14">200 Hotels</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className="d-flex align-items-center hotel-type-item mb-3">
                            <Link to={routes.hotelGrid} className="avatar avatar-lg">
                                <ImageWithBasePath src="/assets/img/hotels/hotel-model-06.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2">
                                <h6 className="fs-16 fw-medium"><Link to={routes.hotelGrid}>2 Start Hotels</Link></h6>
                                <p className="fs-14">180 Hotels</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Hotel Types */}
    </>
  )
}

export default SearchOption