import Breadcrumb from "../Breadcrumb/breadcrumb";
import { all_routes } from "../../../feature-module/router/all_routes";
import { useEffect, useState } from "react";
import axios from "axios";
import AddFaqModal from "./addFaqModal";
import EditFaqModal from "./editFaqModal";
import DeleteFaqModal from "./deleteFaqModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface FAQType {
  _id: string;
  question: string;
  answer: string;
}

const FAQ1 = () => {
  const routes = all_routes;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ question: "", answer: "" });

  const fetchFaqs = async () => {
    const res = await axios.get(`${BASE_URL}/api/auth/faqs`);
    setFaqs(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddFaq = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/faqs`, formData, {
        withCredentials: true,
      });

      fetchFaqs();
      setFormData({ question: "", answer: "" });

      setTimeout(() => {
        const modal = (window as any).bootstrap.Modal.getInstance(
          document.getElementById("add_faq_modal")
        );
        modal?.hide();
      }, 200);
    } catch (error) {
      console.log("Add FAQ failed:", error);
    }
  };

  const handleEditFaq = async () => {
    if (!editingId) return;
    await axios.put(`${BASE_URL}/api/auth/faqs/${editingId}`, formData, {
      withCredentials: true,
    });

    fetchFaqs();

    setTimeout(() => {
      const modal = (window as any).bootstrap.Modal.getInstance(
        document.getElementById("edit_faq_modal")
      );
      modal?.hide();
    }, 200);
  };

  const handleDeleteFaq = async () => {
    if (!deleteId) return;
    await axios.delete(`${BASE_URL}/api/auth/faqs/${deleteId}`
      ,{ withCredentials: true }
    );
    fetchFaqs();

    setTimeout(() => {
      const modal = (window as any).bootstrap.Modal.getInstance(
        document.getElementById("delete_faq_modal")
      );
      modal?.hide();
    }, 200);
  };

  return (
    <>
      <Breadcrumb
        title="Manage FAQ"
        breadcrumbs={[
          { label: "FAQ", link: routes.home1, active: false },
          { label: "Pages", active: false },
          { label: "FAQ", active: true },
        ]}
      />

      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="card p-4">
                <div className="d-flex justify-content-between mb-3">
                  <h4>FAQ List</h4>
                 <button
                   className="btn btn-primary"
                   data-bs-toggle="modal"
                   data-bs-target="#add_faq_modal"
                   onClick={() => {
                   setEditingId(null);   
                   setFormData({ question: "", answer: "" });  
                     }}
                       >
                    + Add FAQ
                     </button>
                </div>

                  {loading ? (

                  <div className="faq-table-wrapper">
                    <table className="table table-striped table-bordered faq-table">
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Answer</th>
                          <th style={{ width: "150px" }}>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {[...Array(5)].map((_, index) => (
                          <tr key={index}>
                            <td><Skeleton height={20} /></td>
                            <td><Skeleton height={20} /></td>
                            <td>
                              <Skeleton width={50} height={25} inline />
                              <Skeleton width={60} height={25} className="ms-2" inline />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                ) : (
               <div className="faq-table-wrapper">
                <table className="table table-striped table-bordered faq-table">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Answer</th>
                        <th style={{ width: "150px" }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {faqs.map((faq) => (
                        <tr key={faq._id}>
                          <td>{faq.question}</td>
                          <td>{faq.answer}</td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_faq_modal"
                              onClick={() => {
                                setEditingId(faq._id);
                                setFormData({
                                  question: faq.question,
                                  answer: faq.answer,
                                });
                              }}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_faq_modal"
                              onClick={() => setDeleteId(faq._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddFaqModal
        formData={formData}
        onChange={handleChange}
        onSubmit={handleAddFaq}
      />
      <EditFaqModal
        formData={formData}
        onChange={handleChange}
        onSubmit={handleEditFaq}
      />
      <DeleteFaqModal onConfirm={handleDeleteFaq} />
    </>
  );
};

export default FAQ1;