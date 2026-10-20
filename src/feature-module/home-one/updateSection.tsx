import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";
import { useState, useEffect } from "react";
import axios from "axios";

const UpdateSection = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const routes = all_routes;
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${BASE_URL}/api/auth/faqs`)
      .then((res) => {
        const faqData = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        setFaqs(faqData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching FAQs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Update Section */}
      <section className="update-section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="update-sec">
                <div className="section-header text-center">
                  <h2 className="mb-1">Stay Updated</h2>
                  <p className="sub-title">
                    Signup for New Offers & Updates from Yotrip{" "}
                  </p>
                </div>
                <div className="input-group justify-content-center mx-auto">
                  <span className="input-group-text px-1">
                    <i className="isax isax-message-favorite5"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email Address"
                  />
                  <button type="submit" className="btn btn-primary">
                    Subscribe
                  </button>
                </div>
                <div className="update-bg">
                  <ImageWithBasePath
                    src="/assets/img/bg/update-bg.png"
                    alt="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Update Section */}

      {/* FAQ Section */}
      <section className="faq-section section">
        <div className="container">
          <div className="faq-sec">
            <div className="row justify-content-center">
              <div
                className="col-xl-6 col-lg-10 text-center aos"
                data-aos="fade-up"
              >
                <div className="section-header text-center">
                  <h2 className="mb-2">
                    Frequently Asked{" "}
                    <span className="text-primary ">Questions</span>
                  </h2>
                  <p className="sub-title">
                    Yotrip, a tour operator specializing in dream
                    destinations, offers a variety of benefits for travelers.
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-8 mx-auto">
                {loading ? (
                  <div>
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="faq-skeleton mb-3"></div>
                    ))}
                  </div>
                ) : (
                  <div className="accordion accordion-flush" id="accordionFaq">
                    {faqs.map((faq, index) => {
                      const isOpen = openIndex === index;
                      return (
                        <div
                          key={faq._id}
                          className="accordion-item mb-3 pb-3 aos"
                          data-aos="fade-up"
                        >
                          <h6 className="accordion-header">
                            <button
                              className={`accordion-button faq-btn ${!isOpen ? "collapsed" : ""}`}
                              type="button"
                              onClick={() => toggleFAQ(index)}
                            >
                              <span>
                                <h4>{faq.question}</h4>
                              </span>

                              <span className="faq-icon">
                                <i
                                  className={`isax ${isOpen ? "isax-minus" : "isax-add"}`}
                                ></i>
                              </span>
                            </button>
                          </h6>

                          <div
                            id={`faq-collapse${index}`}
                            className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                            data-bs-parent="#accordionFaq"
                          >
                            <div className="accordion-body">
                              <p className="mb-0">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /FAQ Section */}

      {/* Blog Section */}
      {/* <section className="section blog-section pt-0">
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-xl-6 col-lg-10 text-center aos" data-aos="fade-up">
                    <div className="section-header text-center">
                        <h2 className="mb-2">Recent <span className="text-primary ">Articles</span></h2>
                        <p className="sub-title">Yotrip offers various blog resources that cater to travel enthusiasts, with a focus on adventure, gear reviews, and travel tips.</p>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center">

                <div className="col-lg-4 col-md-6">
                    <div className="blog-item mb-4 aos"data-aos="fade-up">
                        <Link to={routes.blogDetails} className="blog-img">
                            <ImageWithBasePath src="/assets/img/blog/blog-01.jpg" alt="img" />
                        </Link>
                        <span className="badge bg-primary fs-13 fw-medium">Travel</span>
                        <div className="blog-info text-center">
                            <div className="d-inline-flex align-items-center justify-content-center">
                                <div className="d-inline-flex align-items-center border-end pe-3 me-3 mb-2">
                                    <Link to="#" className="d-flex align-items-center">
                                        <span className="avatar avatar-sm flex-shrink-0 me-2">
											<ImageWithBasePath src="/assets/img/users/user-01.jpg" className="rounded-circle border border-white" alt="img" />
										</span>
                                        <p>Bryan Bradfield</p>
                                    </Link>
                                </div>
                                <p className="d-inline-flex align-items-center text-white mb-2"><i className="isax isax-calendar-2 me-2"></i>14 May 2025</p>
                            </div>
                            <h5><Link to={routes.blogDetails}>Top 10 Hidden Gems places in Central Europe in 2025</Link></h5>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6">
                    <div className="blog-item mb-4 aos" data-aos="fade-up">
                        <Link to={routes.blogDetails} className="blog-img">
                            <ImageWithBasePath src="/assets/img/blog/blog-02.jpg" alt="img" />
                        </Link>
                        <span className="badge bg-primary fs-13 fw-medium">Guide</span>
                        <div className="blog-info text-center">
                            <div className="d-inline-flex align-items-center justify-content-center">
                                <div className="d-inline-flex align-items-center border-end pe-3 me-3 mb-2">
                                    <Link to="#" className="d-flex align-items-center">
                                        <span className="avatar avatar-sm flex-shrink-0 me-2">
											<ImageWithBasePath src="/assets/img/users/user-02.jpg" className="rounded-circle border border-white" alt="img" />
										</span>
                                        <p>Michell West</p>
                                    </Link>
                                </div>
                                <p className="d-inline-flex align-items-center text-white mb-2"><i className="isax isax-calendar-2 me-2"></i>12 May 2025</p>
                            </div>
                            <h5><Link to={routes.blogDetails}>Exploring the World: Your Ultimate Yotrip Itinerary</Link></h5>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6">
                    <div className="blog-item mb-4 aos" data-aos="fade-up">
                        <Link to={routes.blogDetails} className="blog-img">
                            <ImageWithBasePath src="/assets/img/blog/blog-03.jpg" alt="img" />
                        </Link>
                        <span className="badge bg-primary fs-13 fw-medium">Rental</span>
                        <div className="blog-info text-center">
                            <div className="d-inline-flex align-items-center justify-content-center">
                                <div className="d-inline-flex align-items-center border-end pe-3 me-3 mb-2">
                                    <Link to="#" className="d-flex align-items-center">
                                        <span className="avatar avatar-sm flex-shrink-0 me-2">
											<ImageWithBasePath src="/assets/img/users/user-03.jpg" className="rounded-circle border border-white" alt="img" />
										</span>
                                        <p>Patricia Hasbro</p>
                                    </Link>
                                </div>
                                <p className="d-inline-flex align-items-center text-white mb-2"><i className="isax isax-calendar-2 me-2"></i>14 May 2025</p>
                            </div>
                            <h5><Link to={routes.blogDetails}>New York City, USA - The City That  Never Sleeps</Link></h5>
                        </div>
                    </div>
                </div>

            </div>
            <div className="text-center view-all aos"data-aos="fade-up">
                <Link to={routes.blogGrid} className="btn btn-dark d-inline-flex align-items-center">View All Articles<i className="isax isax-arrow-right-3 ms-2"></i></Link>
            </div>
        </div>
    </section> */}
      {/* /Blog Section */}

      {/* Support Section */}
      <section className="support-section bg-primary">
        <div
          className="horizontal-slide d-flex"
          data-direction="left"
          data-speed="slow"
        >
          <div className="slide-list d-flex">
            <div className="support-item">
              <h5>Personalized Itineraries</h5>
            </div>
            <div className="support-item">
              <h5>Comprehensive Planning</h5>
            </div>
            <div className="support-item">
              <h5>Expert Guidance</h5>
            </div>
            <div className="support-item">
              <h5>Local Experience</h5>
            </div>
            <div className="support-item">
              <h5>Customer Support</h5>
            </div>
            <div className="support-item">
              <h5>Sustainability Efforts</h5>
            </div>
            <div className="support-item">
              <h5>Multiple Regions</h5>
            </div>
          </div>
        </div>
      </section>
      {/* /Support Section */}
    </>
  );
};

export default UpdateSection;
