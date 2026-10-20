

import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { Link } from 'react-router-dom';

const CruiseBookingConfirmation = () => {
      const routes = all_routes
          //Breadcrumb Data
          const breadcrumbs = [
            {
                label: 'Cruise',
                link: routes.home1,
                active: false,
            },
            {
                label: 'Cruise',
                active: true,
            },
            {
                label: 'Cruise Booking Confirmation',
                active: true,
            },
        ];
  return (
    <>
    <Breadcrumb
        title="Cruise"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-06"
    />
    <div className="content">
		<div className="container">

			{/* Booking Confirmation */}
			<div className="row justify-content-center">
				<div className="col-lg-10">
					<div className="card booking-confirmation mb-0">
						<div className="card-body">
							<div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
								<div className="d-flex flex-wrap align-items-center justify-content-between ">
									<div className="d-flex flex-wrap align-items-center booking-hotels">
										<Link to={routes.cruiseDetails} className="avatar avatar-lg me-2">
											<ImageWithBasePath src="/assets/img/cruise/cruise-15.jpg" alt="image" className="img-fluid  rounded-circle"/>
										</Link>
										<div className="booking-details">
											<h6 className="mb-1"><Link to={routes.cruiseDetails}>Carnival Cruise Line</Link></h6>
											<div className="d-flex flex-wrap align-items-center booking-items">
												<p className="fs-14 text-gray-6 pe-2 border-end border-light d-flex align-items-center me-2 ">
													<i className="isax isax-ship me-2"></i>Luxury Cruise
												</p>
												<p className="fs-14 text-gray-6 pe-2 border-end border-light d-flex align-items-center me-2 ">
													<i className="isax isax-location5 me-1"></i>15/C Prince Dareen Road, New
													York
												</p>
												<p className="fs-14 text-gray-6 pe-2 border-end border-light d-flex align-items-center me-2 ">
													<span className="badge badge-warning text-gray-9 me-1">5.0</span>(400
													Reviews)
												</p>
											</div>
										</div>
									</div>
									<div>
										<span className="badge badge-info status rounded-pill p-2 fs-10 d-flex align-items-center">Upcoming</span>
									</div>
								</div>
							</div>
							<div className="pb-4 border-bottom mb-4">
								<h6 className="mb-2">Cabin Details</h6>
								<div className="row g-3">
									<div className="col-lg-3">
										<h6 className="fs-14">Cabin Type</h6>
										<p className="text-gray-6 fs-16 ">Suite</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">No of Rooms</h6>
										<p className="text-gray-6 fs-16 ">1</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">Room Price </h6>
										<p className="text-gray-6 fs-16 ">$400</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">Guests</h6>
										<p className="text-gray-6 fs-16 ">4 Adults, 2 Child</p>
									</div>
								</div>
							</div>
							<div className="pb-4 border-bottom mb-4">
								<h6 className="mb-2">Booking Info</h6>
								<div className="row g-3">
									<div className="col-lg-3">
										<h6 className="fs-14">From</h6>
										<p className="text-gray-6 fs-16 ">Las Vegas</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">To </h6>
										<p className="text-gray-6 fs-16 ">Newyork</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">No of Days</h6>
										<p className="text-gray-6 fs-16 ">4 Days, 5 Nights</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">Departure Date & Time</h6>
										<p className="text-gray-6 fs-16 ">20 May 2024, 10:50 AM</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">Checkout Date & Time</h6>
										<p className="text-gray-6 fs-16 ">25 May 2024, 10:50 AM</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14">Booked On</h6>
										<p className="text-gray-6 fs-16 ">15 May 2024</p>
									</div>
								</div>
							</div>
							<div className="pb-4 border-bottom mb-4">
								<h6 className="mb-2">Extra Service Info</h6>
								<div className="d-flex flex-wrap align-items-center service-info gap-3">
									<span className="badge badge-light rounded-pill">Custom Service</span>
									<span className="badge badge-light rounded-pill">Pickup & Drop</span>
									<span className="badge badge-light rounded-pill">Breakfast</span>
								</div>
							</div>
							<div className="pb-4 border-bottom mb-4">
								<h6 className="mb-2">Billing Info</h6>
								<div className="row g-3">
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Name</h6>
										<p className="fs-16 text-gray-6">Chris Foxy</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Email</h6>
										<p className="fs-16 text-gray-6">chrfo2356@example.com</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Phone</h6>
										<p className="fs-16 text-gray-6">+966536669295</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Address</h6>
										<p className="fs-16 text-gray-6">15/C Prince Road, New York</p>
									</div>
								</div>
							</div>
							<div>
								<h6 className="mb-2">Order Info</h6>
								<div className="row g-3">
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Order Id</h6>
										<p className="fs-16 text-primary">#45669</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Payment Method</h6>
										<p className="fs-16 text-gray-6">Credit Card (Visa)</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Payment Status</h6>
										<p className="fs-16 text-success">Paid</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Date of Payment</h6>
										<p className="fs-16 text-gray-6">20 May 2024, 10:50 AM</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Tax</h6>
										<p className="fs-16 text-gray-6">15% ($60)</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Discount</h6>
										<p className="fs-16 text-gray-6">20% ($15)</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Booking Fees</h6>
										<p className="fs-16 text-gray-6">$25</p>
									</div>
									<div className="col-lg-3">
										<h6 className="fs-14 mb-1">Total Paid</h6>
										<p className="fs-16 text-gray-6">$6569</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* / Booking Confirmation */}

		</div>
	</div>
    </>
  )
}

export default CruiseBookingConfirmation