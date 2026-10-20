import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FAQ = () => {

  const routes = all_routes;
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'FAQ', link: routes.home1, active: false },
    { label: 'Pages', active: false },
    { label: 'FAQ', active: true },
  ];

  interface FAQItem {
    _id: string;
    question: string;
    answer: string;
  }

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    
    fetchFaqs();

  }, []);

    const fetchFaqs = async () => {

      try {

        const res = await axios.get(`${BASE_URL}/api/auth/faqs`);
        setFaqs(res.data.data || []);

      } catch (err) {

        console.error("Error fetching FAQs:", err);

      } finally {

        setLoading(false);

      }

    };


  return (
    <>
      <Breadcrumb
        title="FAQ"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
      />

      <div className="content">
        <div className="container">

          <div className="faq">
            <div className="faq-sec p-0">
              <div className="row">
                <div className="col-lg-10 mx-auto">

                  {loading ? (

                    <div className="accordion">

                      {[...Array(5)].map((_, index) => (

                        <div className="accordion-item mb-3" key={index}>

                          <h2 className="accordion-header">
                            <button className="accordion-button">

                              <Skeleton height={24} width={'70%'} />

                            </button>
                          </h2>

                          <div className="accordion-body">

                            <Skeleton count={2} />

                          </div>

                        </div>

                      ))}

                    </div>

                  ) : faqs.length === 0 ? (

                    <div className="text-center py-5">
                      <p>No FAQs available.</p>
                    </div>

                  ) : (

                    <div className="accordion" id="accordionFaq">

                      {faqs.map((faq, index) => {

                        const isOpen = openIndex === index;

                        return (

                          <div className="accordion-item mb-3" key={faq._id}>

                            <h6 className="accordion-header">

                              <button
                                className={`accordion-button faq-btn ${!isOpen ? "collapsed" : ""}`}
                                type="button"
                                onClick={() => toggleFAQ(index)}
                              >
                                <span><h4>{faq.question}</h4></span>

                                <span className="faq-icon">
                                  <i className={`isax ${isOpen ? "isax-minus" : "isax-add"}`}></i>
                                </span>
                              </button>

                            </h6>

                            <div
                              className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                            >

                              <div className="accordion-body">

                                <p>{faq.answer}</p>

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

          {/* Contact section */}

          <div className="row justify-content-center mt-4">

            <div className="col-lg-6">

              <div className="que-sec text-center">

                <h4 className="mb-3">Have Any Other Questions?</h4>

                <p className="mb-3">
                  If you cannot find answer to your question in our FAQ,
                  you can always contact us. We will answer you shortly!
                </p>

                <div className="d-flex justify-content-center">

                  <button
                    onClick={() => navigate(routes.contactUs)}
                    className="btn btn-primary d-flex align-items-center justify-content-center"
                  >
                    Contact Us
                    <i className="isax isax-arrow-right-3 ms-1"></i>
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default FAQ;