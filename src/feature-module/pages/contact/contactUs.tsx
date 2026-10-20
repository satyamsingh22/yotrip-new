import { useState } from 'react';
import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import axios from "axios";

const ContactUs = () => {

    const routes = all_routes
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Contact Us',
            active: false,
            link: routes.home1
        },
        {
            label: 'Pages',
            active: false,
        },
        {
            label: 'Contact Us',
            active: true,
        },
    ];
     const [data,setData]=useState({
        firstname:"",
        lastname:"",
        email:"",
        phone:"",
        msg:""

     })
     const [error,seterror]=useState<any>({})
    const handlechange=(e:any)=>{
        const {name,value}=e.target;
        setData({
            ...data,[name]:value
        }); 
        seterror({
            ...error,[name]:""
        });
    }
    const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!data.firstname){
        newErrors.firstname="First Name is required";
    }
    if (!data.lastname){
        newErrors.lastname="Last Name is required";
    }
    if (!data.phone){
        newErrors.phone="phone number is required";
    }
    if (!data.msg){
        newErrors.msg="Message is required";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }
    seterror(newErrors)
    return valid
    }


  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    await axios.post(`${BASE_URL}/api/auth/mail`, data);

    alert("Message sent successfully!");
    console.log(data)

    setData({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      msg: ""
    });

  } catch (error) {
    alert("Failed to send message");
  }
};



    return (
        <div>
            <Breadcrumb title="Contact Us" breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-02" />


            {/* Page Wrapper */}
            <div className="content">
                <div className="container">
                    <div className="row align-items-center row-gap-4">
                        <div className="col-xl-7 col-lg-7">
                            <div className="mb-4 mb-lg-0">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h2 className="mb-3">
                                            Reach Out to Our Dedicated Support Team
                                        </h2>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h6 className="mb-2">
                                        Our team is ready to help. Your satisfaction is our priority
                                    </h6>
                                    <p>
                                        Got a question, need advice, or looking for help? Our
                                        knowledgeable team is here to assist you every step of the way.
                                        We’re just a message or call away, ready to provide the guidance
                                        you need.
                                    </p>
                                </div>
                                <div className="border-bottom mb-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <span className="avatar avatar-lg rounded-circle bg-light  text-gray-6 me-2">
                                            <i className="isax isax-sms5 fs-24" />
                                        </span>
                                        <div>
                                            <p className="fs-14 mb-0">Email Address</p>
                                            <h6 className="text-gray-6">bookings@yotrip.com</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-bottom mb-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <span className="avatar avatar-lg rounded-circle bg-light  text-gray-6 me-2">
                                            <i className="isax isax-call-calling5 fs-24" />
                                        </span>
                                        <div>
                                            <p className="fs-14 mb-0">Phone Number</p>
                                            <h6 className="text-gray-6">+966536669295</h6>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="d-flex align-items-center">
                                        <span className="avatar avatar-lg rounded-circle bg-light  text-gray-6 me-2">
                                            <i className="isax isax-map-15 fs-24" />
                                        </span>
                                        <div>
                                            <p className="fs-14 mb-0">Our Location</p>
                                            <h6 className="text-gray-6">
                                                Riyadh, KSA
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-5 col-lg-5">
                            <div className="card bg-light-200 shadow-none mb-0">
                                <div className="card-body">
                                    <div className="mb-3">
                                        <h2 className="mb-1">Get in Touch</h2>
                                        <p className="text-gray-6 mb-1">
                                            How we can help you? Please write down your query
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit} >
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        First Name <span className="text-danger">*</span>
                                                    </label>
                                                    <input type="text" className="form-control" name='firstname' value={data.firstname} onChange={handlechange}/>
                                                </div>
                                                {error.firstname && <p className="text-danger">{error.firstname}</p>}
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Last Name <span className="text-danger">*</span>
                                                    </label>
                                                    <input type="text" className="form-control" name='lastname' value={data.lastname} onChange={handlechange} />
                                                </div>
                                                 {error.lastname && <p className="text-danger">{error.lastname}</p>}
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Email <span className="text-danger">*</span>
                                                    </label>
                                                    <input type="email" className="form-control" name='email' value={data.email} onChange={handlechange}/>
                                                </div>
                                                {error.email && <p className="text-danger">{error.email}</p>}
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Phone <span className="text-danger">*</span>
                                                    </label>
                                                    <input type="tel" className="form-control" name='phone' value={data.phone} onChange={handlechange}/>
                                                </div>
                                                {error.phone && <p className="text-danger">{error.phone}</p>}
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Message <span className="text-danger">*</span>
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={3}
                                                        
                                                        name='msg'
                                                        value={data.msg}
                                                        onChange={handlechange}
                                                    />
                                                </div>
                                                {error.msg && <p className="text-danger">{error.msg}</p>}
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="map-grid">
                        <iframe
                            className="w-100"
                            height={300}
                            src="https://maps.google.com/maps?q=Olaya%2C%20Riyadh%2C%20Saudi%20Arabia&z=14&output=embed"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
            {/* /Page Wrapper */}



        </div>
    )
}

export default ContactUs
