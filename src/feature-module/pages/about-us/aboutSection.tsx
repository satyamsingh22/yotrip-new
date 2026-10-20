
import ImageWithBasePath from '../../../core/common/imageWithBasePath'

const AboutSection = () => {

    return (
        <>
            {/* About Section */}
            <section className="section about">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="about-image mb-4 mb-lg-0">
                                <div className="about-listing">
                                    <i className="isax isax-calendar-add text-white mb-2" />
                                    <h6 className="fs-16 mb-3 text-white">All Listings</h6>
                                    <div className="listing-img">
                                        <div>
                                            <ImageWithBasePath src="/assets/img/icons/listing.svg" alt="icon" />
                                        </div>
                                    </div>
                                </div>
                                <div className="about-img">
                                    <ImageWithBasePath src="/assets/img/about.png" alt="about" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-content mb-4">
                                <h6 className="text-primary fs-14 fw-medium mb-2">
                                    About Yotrip
                                </h6>
                                <h2 className="display-6 mb-2">
                                    All-in-one platform for unforgettable travel experiences!
                                </h2>
                                <p className="mb-4">
                                    At Yotrip, we believe that travel should be simple, seamless,
                                    and tailored to your needs. Whether you're dreaming of an exotic
                                    beach getaway, a cultural city tour, or a luxury cruise, we are
                                    here to turn your travel dreams into reality.
                                </p>
                                <div className="d-flex align-items-center mb-4">
                                    <span className="avatar avatar-xl bg-primary rounded-circle flex-shrink-0 me-3">
                                        <i className="isax isax-map5 fs-24" />
                                    </span>
                                    <p>
                                        Clients navigate their journeys, whether for travel or
                                        educational purposes, primarily in Canada, the U.S., and the U.K
                                    </p>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="avatar avatar-xl bg-secondary rounded-circle flex-shrink-0 me-3">
                                        <i className="isax isax-trade5 fs-24 text-gray-9" />
                                    </span>
                                    <p>
                                        Provides a range of services from immigration advice to
                                        study-abroad support and vacation planning.
                                    </p>
                                </div>
                            </div>
                            <div className="about-mission">
                                <h6 className="text-primary fs-14 fw-medium mb-3">Our Mission</h6>
                                <p className="fs-16 text-gray-6">
                                    Our mission is to make travel more accessible, enjoyable, and
                                    hassle-free for everyone. With our range of services
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="about-bg d-none d-md-block">
                        <ImageWithBasePath
                            src="/assets/img/bg/about-bg.png"
                            alt="img"
                            className="about-bg-01"
                        />
                    </div>
                    <div className="about-bg-1 d-none d-md-block">
                        <ImageWithBasePath
                            src="/assets/img/bg/about-arrow.png"
                            alt="img"
                            className="about-bg-01"
                        />
                    </div>
                </div>
            </section>
            {/* /About Section */}
        </>

    )
}

export default AboutSection
