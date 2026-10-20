
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { Link } from 'react-router-dom';
import BookingForm from '../../../core/common/booking/bookingForm';
import { all_routes } from '../../router/all_routes';


const CruiseBooking = () => {

    const routes = all_routes;

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Cruise',
            link: routes.home1,
            active: false,
        },
        {
            label: 'Cruise Booking',
            active: true,
        },
    ];

    return (
        <div>
            <Breadcrumb
                title="Cruise Booking"
                breadcrumbs={breadcrumbs}
                backgroundClass="breadcrumb-bg-06"
            />

            <>
                {/* Page Wrapper */}
                <div className="content content-two">
                    <div className="container">
                        <div className="row">
                            {/* Checkout */}
                            <div className="col-lg-8">
                               <BookingForm/>
                            </div>
                            {/* Checkout */}
                            {/* Review Order Details */}
                            <div className="col-lg-4 ">
                                <div className="card order-details theiaStickySidebar">
                                    <div className="card-header">
                                        <div className="d-flex align-items-center justify-content-between header-content">
                                            <h5>Review Order Details</h5>
                                            <Link to={routes.cruiseDetails} className="rounded-circle p-2 btn btn-light d-flex align-items-center justify-content-center"><span className="fs-16 d-flex align-items-center justify-content-center"><i className="isax isax-edit-2"></i></span></Link>
                                        </div>
                                    </div>
                                    <div className="card-body">                            
                                        <div className="pb-3 border-bottom">
                                            <div className="mb-3 review-img">
                                                <ImageWithBasePath src="/assets/img/cruise/cruise-large-03.jpg" alt="Img" className="img-fluid" />
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <h6 className="mb-2">Coral Cruiser - Balcony</h6>
                                                    <p className="fs-14 "><span className="badge badge-warning text-gray-9 fs-13 fw-medium me-2">5.0</span>(400 Reviews)</p>
                                                </div>
                                                <h6 className="fs-14 fw-normal text-gray-9">$2000</h6>
                                            </div>
                                        </div>
                                        <div className="mt-3 pb-3 border-bottom">
                                            <h6 className="text-primary mb-3">Order Info</h6>
                                            <div className="d-flex align-items-center details-info">
                                                <h6 className="fs-16">Check In</h6>
                                                <p className="fs-16">15 Sep 2025 at 10:10 AM</p>
                                            </div>
                                            <div className="d-flex align-items-center details-info">
                                                <h6 className="fs-16">Check Out</h6>
                                                <p className="fs-16">21 Sep 2025 at 09:15 AM</p>
                                            </div>
                                            <div className="d-flex align-items-center  details-info">
                                                <h6 className="fs-16">Adults</h6>
                                                <p className="fs-16">2</p>
                                            </div>
                                            <div className="d-flex align-items-center  details-info">
                                                <h6 className="fs-16">Children</h6>
                                                <p className="fs-16">2</p>
                                            </div>
                                            <div className="d-flex align-items-center details-info">
                                                <h6 className="fs-16">No of Days</h6>
                                                <p className="fs-16">5 Days, 4 Night</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 border-bottom">
                                            <h6 className="text-primary mb-3">Payment Info</h6>
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <h6 className="fs-16">Sub Total</h6>
                                                <p className="fs-16">$8565</p>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <h6 className="fs-16">Tax <span className="text-gray-6"> (10%)</span></h6>
                                                <p className="fs-16">$85</p>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <h6 className="fs-16">Booking Fees</h6>
                                                <p className="fs-16">$89</p>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <h6 className="fs-16">Discount <span className="text-gray-6"> (10%)</span></h6>
                                                <p className="fs-16">-$20</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <h6>Amount to Pay</h6>
                                                <h6 className="text-primary">$9569</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* /Review Order Details */}
                        </div>
                    </div>
                </div>
                {/* /Page Wrapper */}
                
            </>


        </div>
    )
}

export default CruiseBooking
