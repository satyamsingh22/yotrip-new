import dayjs from 'dayjs';
import  { useState } from 'react'
import { DatePicker } from 'antd';
import BannerCounter from '../../../core/common/banner-counter/counter';


const StickyContent = () => {

    const [defaultDate] = useState(dayjs());

    return (
        <div className=''>
            <div className="card bg-light-200">
                <div className="card-body">
                    <h5 className="d-flex align-items-center fs-18 mb-3">
                        <span className="avatar avatar-md rounded-circle bg-primary me-2">
                            <i className="isax isax-signpost5" />
                        </span>
                        Tour Details
                    </h5>
                    <div>
                        <div className="d-flex align-items-center justify-content-between details-info">
                            <h6 className="fw-medium">Date</h6>
                            <p className="flex-fill">25 May 2025 - 31 May 2025</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between details-info">
                            <h6 className="fw-medium">Destination</h6>
                            <p className="flex-fill">Eidnesburg</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between details-info">
                            <h6 className="fw-medium">Duration</h6>
                            <p className="flex-fill">4 Day, 3 Night</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between details-info">
                            <h6 className="fw-medium">Departure</h6>
                            <p className="flex-fill">25 May 2025, 04:45 AM</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between details-info">
                            <h6 className="fw-medium">Return</h6>
                            <p className="flex-fill">31 May 2025, 10:00 PM</p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between details-info">
                            <h6 className="fw-medium">Total Peoples</h6>
                            <p className="flex-fill">28</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card shadow-none">
                <div className="card-body">
                    <div className="mb-3">
                        <p className="fs-13 fw-medium mb-1">Starts From</p>
                        <h5 className="text-primary mb-1">
                            $500{" "}
                            <span className="fs-14 text-default fw-normal">/ Night</span>
                        </h5>
                    </div>
                    <div className="banner-form">
                        <form >
                            <div className="form-info border-0">
                                <div className="form-item border rounded p-3 mb-3 w-100">
                                    <label className="form-label fs-14 text-default mb-0">
                                        From
                                    </label>
                                    <DatePicker
                                        className="form-control datetimepicker"
                                        placeholder="dd/mm/yyyy"
                                        defaultValue={defaultDate}
                                        format="DD-MM-YYYY"
                                    />
                                    <p className="fs-12">Monday</p>
                                </div>
                                <div className="form-item border rounded p-3 mb-3 w-100">
                                    <label className="form-label fs-14 text-default mb-0">
                                        To
                                    </label>
                                    <DatePicker
                                        className="form-control datetimepicker"
                                        placeholder="dd/mm/yyyy"
                                        defaultValue={defaultDate}
                                        format="DD-MM-YYYY"
                                    />
                                    <p className="fs-12">Monday</p>
                                </div>
                                <div className="card shadow-none mb-3">
                                    <div className="card-body p-3 pb-0">
                                        <div className="border-bottom pb-2 mb-2">
                                            <h6>Details</h6>
                                        </div>
                                        <div className="custom-increment">
                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                <label className="form-label text-gray-9 mb-0">
                                                    Adults
                                                </label>
                                                <BannerCounter />
                                            </div>
                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                <label className="form-label text-gray-9 mb-0">
                                                    Infants{" "}
                                                    <span className="text-default fw-normal">
                                                        ( 0-12 Yrs )
                                                    </span>
                                                </label>
                                                <BannerCounter />
                                            </div>
                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                <label className="form-label text-gray-9 mb-0">
                                                    Children{" "}
                                                    <span className="text-default fw-normal">
                                                        ( 2-12 Yrs )
                                                    </span>
                                                </label>
                                                <BannerCounter />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg search-btn ms-0 w-100 fs-14 d-flex justify-content-center"
                            >
                                Book Now
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default StickyContent
