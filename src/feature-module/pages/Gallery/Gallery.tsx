import React, { useEffect, useState } from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import axios from "axios";

const Gallery = () => {
  const routes = all_routes;
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<{ url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [index, setIndex] = useState(0);
 
 const fetchImages = async () => {
  try {
    setLoading(true);   
    const res = await axios.get(`${BASE_URL}/api/gallery`);
    setImages(res.data);
  } catch (error) {
    console.error("Error fetching images:", error);
  } finally {
    setLoading(false);  
  }
};

  useEffect(() => {
    fetchImages();
  }, []);

  const breadcrumbs = [
    { label: "Gallery", link: routes.home1, active: false },
    { label: "Pages", active: false },
    { label: "Gallery", active: true },
  ];

 
  const SkeletonCard = () => (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="gallery-card">
        <div className="gallery-body">
          <div
            className="img-wrap skeleton-box"
            style={{
              height: "220px",
              width: "100%",
              borderRadius: "8px",
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Breadcrumb
        title="Gallery"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
      />

      <div className="content">
        <div className="container">

      
          <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            slides={images.map((img) => ({
            src: `${BASE_URL}${img.url}`,
            }))}
          />

        
          <div className="row row-gap-4">

            {loading &&
              [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            {!loading &&
              images.map((img, index) => (
                <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={index}>
                  <div className="gallery-card">
                    <div className="gallery-body">
                      <div className="img-wrap">
                        <img
                          src={`${BASE_URL}${img.url}`}
                          alt="gallery-img"
                          className="img-fluid"
                          style={{
                            height: "220px",
                            width: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />

                        <div className="img-overlay-1">
                          <button
                            className="gallery-img"
                             onClick={() => {
                              setIndex(index);
                              setOpen(true);
                            }}
                            style={{ background: "none", border: "none" }}
                            title="View Image"
                          >
                            <span className="gallery-eye-icon rounded-circle bg-primary d-flex align-items-center justify-content-center">
                              <i className="ti ti-eye text-white"></i>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

          </div>

        </div>
      </div>

     
      
         
          
        
    </>
  );
};

export default Gallery;