import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { all_routes } from "../../../feature-module/router/all_routes";
import { useEffect, useState } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Career = () => {

  const routes = all_routes;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const breadcrumbs = [
    { label: "Careers", active: false, link: routes.home1 },
    { label: "Pages", active: false },
    { label: "Careers", active: true },
  ];

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<any>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    resume: null
  });

  const [error, setError] = useState<any>({});

  // 🔹 Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
  try {
    setLoading(true);

    const res = await axios.get(`${BASE_URL}/api/career/admin/jobs`);

    const activeJobs = res.data.data.filter(
      (job: any) => job.status === "active"
    );

    setJobs(activeJobs);

  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  // 🔹 Handle change
  const handlechange = (e: any) => {
    const { name, value, files } = e.target;

    if (name === "resume") {
      setData({ ...data, resume: files[0] });
    } else {
      setData({ ...data, [name]: value });
    }

    setError({ ...error, [name]: "" });
  };

  // 🔹 Validation
  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!data.firstname) newErrors.firstname = "First Name is required";
    if (!data.lastname) newErrors.lastname = "Last Name is required";
    if (!data.phone) newErrors.phone = "Phone is required";
    if (!data.resume) newErrors.resume = "Resume is required";

    if (!data.email) {
      newErrors.email = "Email is required";
      valid = false;
    }

    setError(newErrors);
    return valid;
  };

  // 🔹 Submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const formData = new FormData();

      formData.append("firstName", data.firstname);
      formData.append("lastName", data.lastname);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("resume", data.resume);

      await axios.post(`${BASE_URL}/api/careers/apply`, formData);

      alert("Application submitted successfully!");

      // reset form
      setData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        resume: null
      });

      setSelectedJob(null);

      // 🔹 Proper modal close (FIXED)
      const modalElement = document.getElementById("apply_modal");

      if (modalElement) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.hide();
      }

    } catch (err) {
      console.log(err);
      alert("Failed to submit");
    }
  };

  return (
    <div>
      <Breadcrumb title="Careers" breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-02" />

      <div className="content">
        <div className="container">

          {/* 🔹 Job List */}
          <div className="row mb-4">
            <h3 className="mb-3">Current Openings</h3>

            {/* 🔹 Skeleton */}
            {loading && (
                [...Array(4)].map((_, index) => (
                <div className="col-md-6 mb-3" key={index}>
                    <div className="card p-3 shadow-sm">

                    <Skeleton height={20} width="60%" className="mb-2" />

                    <Skeleton height={15} count={2} className="mb-2" />

                    <Skeleton height={35} width={120} />

                    </div>
                </div>
                ))
            )}

            {/* 🔹 No jobs */}
            {!loading && jobs.length === 0 && (
                <p>No openings available</p>
            )}

            {/* 🔹 Jobs */}
            {!loading && jobs.map((job) => (
                <div className="col-md-6 mb-3" key={job._id}>
                <div className="card p-3 shadow-sm">

                    <h5>{job.title}</h5>
                    <p>{job.description}</p>

                    <button
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#apply_modal"
                    onClick={() => setSelectedJob(job)}
                    >
                    Apply Now
                    </button>

                </div>
                </div>
            ))}
            </div>

        </div>
      </div>

      {/* 🔹 Apply Modal */}
      <div className="modal fade" id="apply_modal">
        <div className="modal-dialog">
          <div className="modal-content p-4">

            <h5>Apply for: {selectedJob?.title}</h5>

            <form onSubmit={handleSubmit}>

              <input
                className="form-control mb-2"
                placeholder="First Name"
                name="firstname"
                value={data.firstname}
                onChange={handlechange}
              />
              {error.firstname && <p className="text-danger">{error.firstname}</p>}

              <input
                className="form-control mb-2"
                placeholder="Last Name"
                name="lastname"
                value={data.lastname}
                onChange={handlechange}
              />
              {error.lastname && <p className="text-danger">{error.lastname}</p>}

              <input
                className="form-control mb-2"
                placeholder="Email"
                name="email"
                value={data.email}
                onChange={handlechange}
              />
              {error.email && <p className="text-danger">{error.email}</p>}

              <input
                className="form-control mb-2"
                placeholder="Phone"
                name="phone"
                value={data.phone}
                onChange={handlechange}
              />
              {error.phone && <p className="text-danger">{error.phone}</p>}

              <input
                type="file"
                className="form-control mb-2"
                name="resume"
                onChange={handlechange}
              />
              {error.resume && <p className="text-danger">{error.resume}</p>}

              <button className="btn btn-primary mt-2">
                Submit
              </button>

            </form>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Career;