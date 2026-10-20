import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import StickyContent from './stickyContent';
import { DatePicker } from 'antd'
import dayjs from "dayjs";
import BannerCounter from '../../../core/common/banner-counter/counter'
import RoomTypeCard from "./RoomTypeCard";
import { all_routes } from "../../router/all_routes";
import axios from "axios";
import { useHotelSearch } from "@/context/HotelSearchContext";
import { getBrowserTimezone } from "@/context/GeoDefaultsContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { getSymbolFromCurrency } from "country-data-list";
import { formatAmount } from "@/utils/formatMoney";
import {
    applyHotelCheckInChange,
    applyHotelCheckOutChange,
    disableBeforeToday,
    disableHotelCheckOutDate,
} from "@/utils/dateValidation";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
    dedupeAmenitiesForDisplay,
    displayHotelName,
} from "@/utils/displayLabels";
import { displayCityName } from "@/utils/displayCityName";
import HotelDistanceFromCenter from "../components/HotelDistanceFromCenter";

const HOTEL_IMAGE_FALLBACK = "/assets/img/hotels/hotel-large-01.jpg";

const resolveHotelImages = (
    apiImages?: string[],
    searchThumbnail?: string | null,
) => {
    const cleaned = (apiImages || []).filter(Boolean);
    if (cleaned.length > 0) return cleaned;
    if (searchThumbnail) return [searchThumbnail];
    return [HOTEL_IMAGE_FALLBACK];
};

const logHotelImageDebug = (stage: string, payload: Record<string, unknown>) => {
    console.log(`[HotelDetails][images] ${stage}`, payload);
};

const HotelDetailsSkeleton = () => {
    const shimmer = {
        background: "linear-gradient(90deg,#eeeeee 25%,#f5f5f5 50%,#eeeeee 75%)",
        backgroundSize: "800px 100%",
        animation: "shimmer 1.5s infinite linear"
    };

    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
    @keyframes shimmer {
      0% { background-position: -400px 0 }
      100% { background-position: 400px 0 }
    }
  `;
        document.head.appendChild(style);
    }, []);

    return (
        <div className="container">
            <div className="row">

                {/* LEFT SECTION */}
                <div className="mt-5 col-xl-8">

                    {/* Title */}
                    <div
                        style={{
                            width: "60%",
                            height: 30,
                            borderRadius: 6,
                            marginBottom: 10,
                            ...shimmer
                        }}
                    />

                    {/* Subtitle */}
                    <div
                        style={{
                            width: "40%",
                            height: 18,
                            borderRadius: 6,
                            marginBottom: 20,
                            ...shimmer
                        }}
                    />

                    {/* Main Image */}
                    <div
                        style={{
                            width: "100%",
                            height: 400,
                            borderRadius: 10,
                            marginBottom: 15,
                            ...shimmer
                        }}
                    />

                    {/* Thumbnails */}
                    <div style={{ display: "flex", gap: 10 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: 90,
                                    height: 70,
                                    borderRadius: 6,
                                    ...shimmer
                                }}
                            />
                        ))}
                    </div>

                    {/* Amenities */}
                    <div style={{ marginTop: 30, paddingBottom: 20 }} >
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: "100%",
                                    height: 14,
                                    borderRadius: 6,
                                    marginBottom: 10,
                                    ...shimmer
                                }}
                            />
                        ))}
                    </div>

                </div>

                {/* RIGHT SIDEBAR */}
                <div className="col-xl-4">
                    <div
                        style={{
                            width: "100%",
                            height: 300,
                            borderRadius: 10,
                            marginTop: 60,
                            ...shimmer
                        }}
                    />
                </div>

            </div>
        </div>
    );
};


const HotelDetails = () => {
    const { t, i18n } = useTranslation();
    const routes = all_routes
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [galleryIndex, setGalleryIndex] = React.useState(0);
    const [defaultDate] = useState(dayjs());
    const [isPolicy, setIsPolicy] = useState(true);
    const [isPolicy2, setIsPolicy2] = useState(false);
    const [isPolicy3, setIsPolicy3] = useState(false);
    const [isPolicy4, setIsPolicy4] = useState(false);
    const { hotelId } = useParams();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true)

    const rateKey = searchParams.get("rateKey");
    const urlCorrelationId = searchParams.get("correlationId");
    const hotelCode = hotelId;

    const { city, checkIn, checkOut, guests, hotels, userCurrency, correlationId, nationality, setCheckIn, setCheckOut, setGuests,  setSelectedRoom, setBookingKey, setPriceInfo } = useHotelSearch();
    const selectedHotel = hotels.find(h => h.id === hotelCode);
    const provider = searchParams.get("provider") || selectedHotel?.provider || "sabre";
    const [reviewHash, setReviewHash] = useState<string | null>(null);
    const [Rooms, setRooms] = useState<any[]>([]);

    const handleHotelImageError = (
        event: React.SyntheticEvent<HTMLImageElement>,
        imageIndex = 0,
    ) => {
        const target = event.currentTarget;
        const fallback =
            selectedHotel?.thumbnail ||
            hotel?.images?.[0] ||
            HOTEL_IMAGE_FALLBACK;

        if (target.src !== fallback && !target.src.endsWith(HOTEL_IMAGE_FALLBACK)) {
            logHotelImageDebug("img-onerror", {
                failedSrc: target.src,
                fallback,
                imageIndex,
            });
            target.src = fallback;
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        const url = window.location.href;
        const title = hotel?.name || "Hotel";
        const text = `Check out ${title} on YoTrip`;

        try {
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share({ title, text, url });
                return;
            }
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
                return;
            }
            toast.error("Sharing is not supported on this browser");
        } catch (err: any) {
            if (err?.name === "AbortError") return;
            toast.error("Unable to share right now");
        }
    };

    const [hotel, setHotel] = useState({
        "name": "",
        "description": "",
        'rating': "",
        "address": {
            "line1": "",
            "city": {
                "CityCode": "",
                "value": ""
            },
            "country": {
                "Code": "",
                "value": ""
            },
            "postalCode": "",
            "latitude": 0o0,
            "longitude": 0o0
        },
        "amenities": [
        ],
        "contact": {
            phone: "",
            fax: ""
        },
        "images": [],
        "totalRooms": 0,
        "checkinTime": "-",
        "checkoutTime": "-",
        "guaranteePolicy": {
            "type": "GUAR",
            "acceptedCards": []
        },
        "rates": [
            {
                "currency": "",
                "totalPrice": "",
                "avgNight": "",
                "amountBeforeTax": "",
                "paymentCards": []
            },
        ]
    });

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Hotel Details',
            active: false,
            link: routes.home1
        },
        {
            label: 'Hotel',
            active: false,
        },
        {
            label: 'Hotel Details',
            active: true,
        },
    ];

    const sliderForRef = useRef<any>(null);
    const sliderNavRef = useRef<any>(null);
    // const [navSync, setNavSync] = useState<any>({ sliderFor: null, sliderNav: null });

    const [nav1, setNav1] = useState<any>(null);
    const [nav2, setNav2] = useState<any>(null);
    
    useEffect(() => {
        setNav1(sliderForRef.current);
        setNav2(sliderNavRef.current);
    }, []);

    const navigate = useNavigate();

    const handleSelectRoom = async (room) => {
  try {

    setSelectedRoom(room);
    const resolvedCorrelationId = urlCorrelationId || correlationId;

    if (provider === "tripjack") {
      const resolvedReviewHash = reviewHash || room.reviewHash;
      if (!resolvedReviewHash) {
        alert("Pricing session expired. Please refresh the hotel page and try again.");
        return;
      }
      if (!resolvedCorrelationId) {
        alert("Search session expired. Please search again.");
        return;
      }
    }
    if (provider === "hostnsell" && !resolvedCorrelationId) {
      alert("Search session expired. Please search again.");
      return;
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/checkPrice`,
      {
        rateKey: room.rateKey || room.optionId,
        optionId: room.optionId || room.rateKey,
        checkIn: checkIn?.format("YYYY-MM-DD"),
        checkOut: checkOut?.format("YYYY-MM-DD"),
        guests,
        provider,
        hotelId: hotelCode,
        hid: hotelCode,
        reviewHash: reviewHash || room.reviewHash,
        ...(resolvedCorrelationId ? { correlationId: resolvedCorrelationId } : {}),
        userCurrency,
        city,
      }
    );

    const priceData = response.data.data;
    sessionStorage.setItem("priceData", JSON.stringify(priceData, null, 2))


    console.log("[hotel-details] price check response", {
      provider: priceData?.provider,
      currency: priceData?.price?.currency || priceData?.currency,
      total: priceData?.price?.total,
      expectedTripjackINR: priceData?.expectedTripjackINR ?? null,
      bookingKey: priceData?.bookingKey,
      tripjackBookingId: priceData?.tripjackBookingId ?? null,
    });

    if(priceData){
        setBookingKey(priceData.bookingKey);
        setPriceInfo(priceData);
        const bookingParams = new URLSearchParams({
          bookingKey: priceData.bookingKey,
          provider: priceData.provider || provider,
        });
        if (priceData.correlationId || resolvedCorrelationId) {
          bookingParams.set(
            "correlationId",
            priceData.correlationId || resolvedCorrelationId || "",
          );
        }
        navigate(`${all_routes.hotelBooking}/?${bookingParams.toString()}`);
    }

    // Navigate to booking page

  } catch (error) {
    console.error("Price check failed:", error);
    const msg =
      error?.response?.data?.errorCode === "OPTION_SOLD_OUT" ||
      error?.response?.data?.error?.status?.message?.includes("SOLD_OUT")
        ? "This room is no longer available. Please select another option."
        : "Room price changed or no longer available.";
    alert(msg);
  }
};

    const CustomNextArrow = ({ onClick }: any) => (
        <div className="owl-nav">
            <button type="button" role="presentation" className="owl-next" onClick={onClick}>
                <i className="fa-solid fa-chevron-right" />
            </button>
        </div>
    );

    const CustomPrevArrow = ({ onClick }: any) => (
        <div className="owl-nav">
            <button type="button" role="presentation" className="owl-prev" onClick={onClick}>
                <i className="fa-solid fa-chevron-left" />
            </button>
        </div>
    );
    // useEffect(() => {
    //     setNavSync({
    //         sliderFor: sliderNavRef.current,
    //         sliderNav: sliderForRef.current,
    //     });
    // }, []);


    const imgslideroption = {
        dots: true,
        arrows: true,
        infinite: true,
        speed: 2000,
        autoplay: false,
        swipe: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 1,
                },
            },
            {
                breakpoint: 1300,
                settings: {
                    slidesToShow: 1,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                },
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                },
            },
            {
                breakpoint: 0,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    const imageCount = hotel?.images?.length || 0;

    const sliderForSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: imageCount > 1,
        arrows: imageCount > 1,
        fade: true,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        asNavFor: nav2,
        variableWidth: false,
        adaptiveHeight: true,
    };

    //     const sliderNavSettings = {
    //         slidesToShow: Math.min(5, imageCount),
    //         slidesToScroll: 1,
    //         dots: false,
    //         variableWidth: false,
    //         adaptiveHeight: false,
    //         arrows: imageCount > 5,
    //         infinite: imageCount > 5,
    //         focusOnSelect: true,
    //         asNavFor: nav1,
    //         centerMode: false,
    //         responsive: [
    //             {
    //                 breakpoint: 992,
    //                 settings: {
    //                     slidesToShow: Math.min(4, imageCount),
    //                 },
    //             },
    //             {
    //                 breakpoint: 768,
    //                 settings: {
    //                     slidesToShow: Math.min(3, imageCount),
    //                 },
    //             },
    //             {
    //                 breakpoint: 576,
    //                 settings: {
    //                     slidesToShow: Math.min(2, imageCount),
    //                 },
    //             },
    //   ],
    //     };


    const sliderNavSettings = {
        slidesToShow: Math.min(5, imageCount),
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        infinite: imageCount > 5,
        focusOnSelect: true,
        swipeToSlide: true,
        speed: 800,
        cssEase: "ease-in-out",
        asNavFor: nav1,
        centerMode: false,
        centerPadding: "0px",
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: Math.min(4, imageCount),
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: Math.min(3, imageCount),
                },
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: Math.min(2, imageCount),
                },
            },
        ],
    };

    const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
    const handleItemClick = (index: number) => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = [...prevSelectedItems];
            updatedSelectedItems[index] = !updatedSelectedItems[index];
            return updatedSelectedItems;
        });
    };

    // useEffect(() => {
    //     const getHotelDetails = async () => {
    //         try {
    //             const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/getHotelDetails`, {
    //                 RateKeyRef: rateKey
    //             });
    //             const hotelDetails = response.data;
    //             setHotel(hotelDetails)
    //             setLoading(false)

    //         } catch (error) {
    //             console.error("Error fetching hotel details:", error);
    //         }
    //     };

    //     const getHotelAvailability = async () => {
    //         if (!selectedHotel || !checkIn || !checkOut) return;

    //         const response = await axios.post(
    //             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/getHotelAvailabilityByCode`,
    //             {
    //                 hotelCode: selectedHotel.id,
    //                 checkIn: checkIn.format("YYYY-MM-DD"),
    //                 checkOut: checkOut.format("YYYY-MM-DD"),
    //                 guests,
    //                 city
    //             }
    //         );
    //         setLoading(false)
    //         setRooms(response.data.rooms);
    //     };

    //     getHotelDetails()
    //     getHotelAvailability()
    // }, [rateKey]);

    useEffect(() => {
        const fetchData = async () => {
            const searchThumbnail = selectedHotel?.thumbnail || null;

            logHotelImageDebug("init", {
                hotelCode,
                rateKey,
                searchThumbnail,
                checkIn: checkIn?.format("YYYY-MM-DD"),
                checkOut: checkOut?.format("YYYY-MM-DD"),
            });

            const isTripjack = provider === "tripjack";
            const hasRequiredIds = isTripjack ? Boolean(hotelCode) : Boolean(rateKey);

            if (!hasRequiredIds) {
                console.warn("[HotelDetails] Missing required hotel identifiers — cannot load rooms", {
                    provider,
                    hotelCode,
                    rateKey,
                });
                setRooms([]);
                setHotel((prev) => ({
                    ...prev,
                    name: selectedHotel?.name || prev.name,
                    images: resolveHotelImages([], searchThumbnail),
                }));
                setLoading(false);
                return;
            }

            if (!checkIn || !checkOut) {
                console.warn("[HotelDetails] Missing checkIn/checkOut — using search thumbnail only");
                setRooms([]);
                setHotel((prev) => ({
                    ...prev,
                    name: selectedHotel?.name || prev.name,
                    images: resolveHotelImages([], searchThumbnail),
                }));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const requestHeaders = getBrowserTimezone()
                    ? { "X-Timezone": getBrowserTimezone() }
                    : undefined;

                const detailsPayload = {
                    ...(rateKey ? { RateKeyRef: rateKey, rateKey } : {}),
                    checkIn: checkIn.format("YYYY-MM-DD"),
                    checkOut: checkOut.format("YYYY-MM-DD"),
                    guests,
                    userCurrency,
                    city,
                    provider,
                    lang: (i18n.resolvedLanguage || i18n.language || "en").split("-")[0],
                    hotelId: hotelCode,
                    ...(urlCorrelationId || correlationId
                        ? { correlationId: urlCorrelationId || correlationId }
                        : {}),
                    ...(nationality ? { nationality } : {}),
                };

                logHotelImageDebug("api-request", detailsPayload);

                const [hotelDetailsRes, availabilityRes] = await Promise.all([
                    axios.post(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/getHotelDetails`,
                        detailsPayload,
                        { headers: requestHeaders },
                    ),
                    provider === "sabre" && hotelCode
                        ? axios.post(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/getHotelAvailabilityByCode`,
                            {
                                hotelCode,
                                checkIn: checkIn.format("YYYY-MM-DD"),
                                checkOut: checkOut.format("YYYY-MM-DD"),
                                guests,
                                userCurrency,
                                city,
                            },
                            { headers: requestHeaders },
                        )
                        : Promise.resolve(null),
                ]);

                if (hotelDetailsRes?.data) {
                    const resolvedImages = resolveHotelImages(
                        hotelDetailsRes.data.images,
                        searchThumbnail,
                    );

                    logHotelImageDebug("api-response", {
                        apiImageCount: hotelDetailsRes.data.images?.length ?? 0,
                        apiImages: hotelDetailsRes.data.images,
                        resolvedImages,
                        searchThumbnail,
                    });

                    setHotel({
                        ...hotelDetailsRes.data,
                        images: resolvedImages,
                    });
                    if (hotelDetailsRes.data?.reviewHash) {
                        setReviewHash(hotelDetailsRes.data.reviewHash);
                    }
                } else {
                    logHotelImageDebug("api-empty", { searchThumbnail });
                    setHotel((prev) => ({
                        ...prev,
                        name: selectedHotel?.name || prev.name,
                        images: resolveHotelImages([], searchThumbnail),
                    }));
                }

                const detailRooms = hotelDetailsRes?.data?.rooms;
                const availabilityRooms = availabilityRes?.data?.rooms;
                const nextRooms =
                    Array.isArray(detailRooms) && detailRooms.length
                        ? detailRooms
                        : Array.isArray(availabilityRooms)
                            ? availabilityRooms
                            : [];

                console.log("[hotel-details] rooms loaded", {
                    provider,
                    count: nextRooms.length,
                    currency: hotelDetailsRes?.data?.currency || userCurrency,
                    sample: nextRooms[0]
                        ? {
                              name: nextRooms[0].name,
                              price: nextRooms[0].price,
                              totalPrice: nextRooms[0].totalPrice,
                              currency: nextRooms[0].currency,
                              rateKey: nextRooms[0].rateKey || nextRooms[0].optionId,
                          }
                        : null,
                });

                setRooms(nextRooms);

                if (availabilityRes?.data) {
                    setHotel((prev) => ({
                        ...prev,
                        contact: {
                            phone: availabilityRes.data?.phone || "",
                            fax: availabilityRes.data?.fax || "",
                        },
                    }));
                }
            } catch (error: any) {
                console.error("[HotelDetails] Error fetching hotel data:", error);
                console.error(
                    "[HotelDetails] API error body:",
                    error?.response?.data,
                );
                logHotelImageDebug("api-error-fallback", {
                    searchThumbnail,
                    message: error?.message,
                });
                setRooms([]);
                setHotel((prev) => ({
                    ...prev,
                    name: selectedHotel?.name || prev.name,
                    images: resolveHotelImages([], searchThumbnail),
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [rateKey, hotelCode, checkIn, checkOut, guests, city, provider, urlCorrelationId, correlationId, selectedHotel?.thumbnail, selectedHotel?.name, userCurrency]);

    const amenityIconMap: Record<string, string> = {
        "Wireless internet connection in public areas": "isax-wifi",
        "High speed internet access": "isax-wifi",
        "High speed wireless": "isax-wifi",
        "Free WiFi": "isax-wifi",
        "Parking": "isax-car",
        "Free Parking": "isax-car",

        "Air conditioning": "isax-airdrop", // safer than airpod
        "Health club": "isax-activity",
        "Outdoor pool": "isax-wind-2",
        "Pool": "isax-wind-2",

        "Restaurant": "isax-shop",
        "Dining Room": "isax-shop",
        "Lounges/bars": "isax-cup",
        "24-hour room service": "isax-broom",
        "Room service": "isax-broom",

        "Business center": "isax-briefcase",
        "Meeting rooms": "isax-buildings",

        "Concierge desk": "isax-user",
        "Transportation services - local area": "isax-bus",

        "Minibar": "isax-cup",
        "In Room Safe": "isax-lock",
        "Smoking rooms available": "isax-wind",
        "Extra Person": "isax-people",
        "Onsite laundry": "isax-broom",
    };


    const getAmenityIcon = (amenity: string) => {
        return amenityIconMap[amenity] || "isax-star";
    };


    // One row per distinct label — Sabre lists variants ("Parking" +
    // "Free Parking") that read as the same amenity once localised.
    const amenities = dedupeAmenitiesForDisplay(
        hotel.amenities || [],
        hotel.amenitiesTranslated,
        t,
    );

    const midpoint = Math.ceil(amenities.length / 2);

    const firstHalf = amenities.slice(0, midpoint);
    const secondHalf = amenities.slice(midpoint);

    const address_ = `${hotel.name}, ${hotel.address.line1},  ${hotel.address.city.value}`;

    let roomImage;

    useEffect(() => {
        setNav1(sliderForRef.current);
        setNav2(sliderNavRef.current);
    }, []);


    return (
        <>
            <Breadcrumb title="Hotel Details" breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-01" />
            <div className="content bg-details-luxe">
                {loading ? (
                    <HotelDetailsSkeleton />
                ) : (
                <div className="container">
                    <div className="row">
                            {/* Hotel Details */}
                            <div className="col-xl-8">

                                {/* Slider */}
                                <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                                    <div className="mb-2">
                                        <h4 className="mb-1 d-flex align-items-center flex-wrap">{displayHotelName(hotel?.name, t)}<span className="badge badge-xs bg-success rounded-pill ms-2"><i className="isax isax-ticket-star me-1"></i>Verified</span></h4>
                                        <div className="d-flex align-items-center flex-wrap">
                                            <p className="fs-14 mb-2 me-3 pe-3 border-end"><i className="isax isax-buildings me-2"></i>Hotel</p>
                                            <p className="fs-14 mb-2 me-3 pe-3 border-end"><i className="isax isax-location5 me-2"></i>{displayCityName(hotel.address.city.value, t)}
                                                <Link target="_blank" to={`https://www.google.com/maps?q=${encodeURIComponent(address_)}`} className="link-primary  fw-medium ms-2">View Location</Link></p>
                                            <HotelDistanceFromCenter
                                                hotel={{
                                                    distance: selectedHotel?.distance,
                                                    provider: selectedHotel?.provider || provider,
                                                    latitude: hotel.address?.latitude ?? selectedHotel?.latitude,
                                                    longitude: hotel.address?.longitude ?? selectedHotel?.longitude,
                                                    address: hotel.address,
                                                }}
                                                className="fs-14 mb-2 me-3 pe-3 border-end"
                                            />
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">{hotel?.rating}</span>
                                                {/* <p className="fs-14"><Link to="#reviews">Review</Link></p> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <button
                                            type="button"
                                            onClick={handleShare}
                                            className="btn btn-outline-light btn-icon btn-sm d-flex align-items-center justify-content-center me-2"
                                            aria-label="Share hotel"
                                        >
                                            <i className="isax isax-share"></i>
                                        </button>
                                        {/* Save is hidden until the wishlist feature ships (feat/wishlist) — it did nothing, and `to="#"` stripped the query string. */}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                                    <div className="d-flex align-items-center flex-wrap">
                                        <p className="fs-14 me-2 mb-2"><i className="isax isax-tick-circle5 text-success me-2"></i>Fully refundable</p>
                                        <p className="fs-14 me-2 mb-2"><i className="isax isax-tick-circle5 text-success me-2"></i>Express check-in/out available</p>
                                        <p className="fs-14 mb-2"><i className="isax isax-tick-circle5 text-success me-2"></i>Minimum check-in age: 18</p>
                                    </div>
                                    <span className="badge badge-light text-gray-9 badge-md fs-13 fw-medium rounded-pill mb-2">Total {hotel.totalRooms} Rooms </span>
                                </div>
                                {/* <div className="border-bottom pb-4 mb-4">
                                <div className="">
                                    <div className="slider-wrap">
                                         <Slider {...sliderForSettings} ref={sliderForRef} className="service-carousel nav-center mb-4" >
                                            {hotel?.images?.length > 0 ? (
                                                hotel.images.map((img: string, index: number) => (
                                                    <div className="service-img" key={index}>
                                                        <img
                                                            src={img}
                                                            className="img-fluid"
                                                            alt={`Hotel image ${index + 1}`}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="service-img">
                                                    <img
                                                        src="/assets/img/hotels/hotel-large-01.jpg"
                                                        className="img-fluid"
                                                        alt="Fallback"
                                                    />
                                                </div>
                                            )}
                                        </Slider>

                                        <Link to="#" onClick={() => setOpen2(true)} className="btn btn-white btn-xs view-btn"><i className="isax isax-image me-1"></i>See All</Link>
                                    </div>
                                    <Slider {...sliderNavSettings} ref={sliderNavRef} className="slider-nav-thumbnails nav-center" >
                                  {hotel?.images?.length > 0 &&
                                            hotel.images.map((img: string, index: number) => (
                                                <div key={index}>
                                                    <img
                                                        src={img}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        style={{
                                                            height: "90px",
                                                            width: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </Slider>
                                </div>
                                <h5 className="mb-3 fs-18">Descriptions</h5>
                                <div>
                                    <p>Hotel Plaza Athenee is an excellent choice for travellers visiting Coimbatore, offering a budget friendly environment alongside many helpful amenities designed to enhance your stay. The rooms offer a flat screen TV and air
                                        conditioning
                                    </p>
                                </div>
                                <div className="read-more">
                                    <div className="more-text">
                                        <p>and getting online is possible, as free internet access is available, allowing you to rest and refresh with ease.
                                        </p>
                                    </div>
                                    <Link to="#" className="fs-14 fw-medium more-link  mb-2">Show More</Link>
                                </div>
                            </div> */}

                                <div className="border-bottom pb-4 mb-4">
                                    {(() => {
                                        // Adaptive photo grid: reshapes based on how many photos the hotel has,
                                        // so images render in smaller cells (sharper, never oversized/stretched).
                                        const imgs: string[] =
                                            hotel?.images?.length > 0 ? hotel.images : [HOTEL_IMAGE_FALLBACK];
                                        const count = imgs.length;

                                        // Open the existing full lightbox starting at the clicked photo.
                                        const openAt = (index: number) => {
                                            setGalleryIndex(index);
                                            setOpen2(true);
                                        };

                                        // How many tiles to render, and which grid shape to use.
                                        const visibleCount =
                                            count <= 2 ? count : count === 3 ? 3 : count === 4 ? 4 : 5;
                                        const gridClass =
                                            count === 1
                                                ? "hd-grid-1"
                                                : count === 2
                                                    ? "hd-grid-2"
                                                    : count === 3
                                                        ? "hd-grid-3"
                                                        : count === 4
                                                            ? "hd-grid-4"
                                                            : "hd-grid-many";

                                        return (
                                            <div className="hd-photo-grid-wrap">
                                                <style>{`
                                                    .hd-photo-grid-wrap { position: relative; }
                                                    .hd-photo-grid {
                                                        display: grid;
                                                        gap: 8px;
                                                        border-radius: 12px;
                                                        overflow: hidden;
                                                    }
                                                    .hd-photo-grid .hd-tile {
                                                        position: relative;
                                                        overflow: hidden;
                                                        cursor: pointer;
                                                        background: #eef0f2;
                                                    }
                                                    .hd-photo-grid .hd-tile img {
                                                        width: 100%;
                                                        height: 100%;
                                                        object-fit: cover;
                                                        object-position: center 40%;
                                                        display: block;
                                                        transition: transform .35s ease;
                                                    }
                                                    .hd-photo-grid .hd-tile:hover img { transform: scale(1.05); }
                                                    .hd-photo-grid .hd-more-overlay {
                                                        position: absolute;
                                                        inset: 0;
                                                        display: flex;
                                                        align-items: center;
                                                        justify-content: center;
                                                        background: rgba(0,0,0,0.45);
                                                        color: #fff;
                                                        font-size: 20px;
                                                        font-weight: 600;
                                                        letter-spacing: .5px;
                                                    }
                                                    /* Count-based layouts (desktop) */
                                                    .hd-grid-1 { grid-template-columns: 1fr; grid-auto-rows: 420px; }
                                                    .hd-grid-2 { grid-template-columns: 1fr 1fr; grid-auto-rows: 400px; }
                                                    .hd-grid-3 {
                                                        grid-template-columns: 2fr 1fr;
                                                        grid-template-rows: 1fr 1fr;
                                                        height: 420px;
                                                    }
                                                    .hd-grid-3 .hd-tile:first-child { grid-row: 1 / 3; }
                                                    .hd-grid-4 {
                                                        grid-template-columns: 1fr 1fr;
                                                        grid-template-rows: 1fr 1fr;
                                                        height: 420px;
                                                    }
                                                    .hd-grid-many {
                                                        grid-template-columns: 2fr 1fr 1fr;
                                                        grid-template-rows: 1fr 1fr;
                                                        height: 420px;
                                                    }
                                                    .hd-grid-many .hd-tile:first-child {
                                                        grid-column: 1 / 2;
                                                        grid-row: 1 / 3;
                                                    }
                                                    .hd-see-all-btn {
                                                        position: absolute;
                                                        bottom: 15px;
                                                        right: 15px;
                                                        z-index: 5;
                                                    }
                                                    /* Mobile: turn any layout into a swipeable strip */
                                                    @media (max-width: 767px) {
                                                        .hd-photo-grid {
                                                            display: flex !important;
                                                            overflow-x: auto;
                                                            height: auto !important;
                                                            grid-template-columns: none !important;
                                                            grid-template-rows: none !important;
                                                            scroll-snap-type: x mandatory;
                                                            -webkit-overflow-scrolling: touch;
                                                        }
                                                        .hd-photo-grid .hd-tile {
                                                            flex: 0 0 86%;
                                                            height: 230px;
                                                            grid-column: auto !important;
                                                            grid-row: auto !important;
                                                            scroll-snap-align: start;
                                                            border-radius: 10px;
                                                        }
                                                    }
                                                `}</style>

                                                <div className={`hd-photo-grid ${gridClass}`}>
                                                    {imgs.slice(0, visibleCount).map((img: string, index: number) => {
                                                        // On the last visible tile of a 5+ set, show "+N more".
                                                        const remaining = count - visibleCount;
                                                        const showMore =
                                                            gridClass === "hd-grid-many" &&
                                                            index === visibleCount - 1 &&
                                                            remaining > 0;
                                                        return (
                                                            <div
                                                                className="hd-tile"
                                                                key={index}
                                                                onClick={() => openAt(index)}
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Hotel photo ${index + 1}`}
                                                                    fetchPriority={index === 0 ? "high" : "auto"}
                                                                    onError={(e) => handleHotelImageError(e, index)}
                                                                />
                                                                {showMore && (
                                                                    <div className="hd-more-overlay">
                                                                        +{remaining} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <Link
                                                    to="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        openAt(0);
                                                    }}
                                                    className="btn btn-white btn-xs view-btn hd-see-all-btn"
                                                >
                                                    <i className="isax isax-image me-1"></i>See All
                                                </Link>
                                            </div>
                                        );
                                    })()}
                                </div>
                                {/* /Slider */}

                                {/* Highlights */}
                                <div className="border-bottom pb-4 mb-4">
                                    <h5 className="mb-3 fs-18">Highlights</h5>
                                    <div className="highlight-box">
                                        <p className="d-flex align-items-center"><i className="isax isax-star-1 text-orange"></i>Spacious Rooms: Comfortable accommodations with contemporary furnishings and high-quality bedding.</p>
                                    </div>
                                    <div className="highlight-box">
                                        <p className="d-flex align-items-center"><i className="isax isax-star-1 text-orange"></i>Destination Unlocked: Programs that encourage exploration of local culture and attractions.</p>
                                    </div>
                                    <div className="highlight-box">
                                        <p className="d-flex align-items-center"><i className="isax isax-star-1 text-orange"></i>Sophisticated Décor: Modern and artistic interiors with a touch of elegance.</p>
                                    </div>
                                </div>
                                {/* /Highlights */}

                                {/* Popular Amenities */}
                                <div className="border-bottom pb-2 mb-4">
                                    <h5 className="mb-3 fs-18">Popular Amenities</h5>
                                    <div className="row">
                                        <div className="row">
                                            {/* Column 1 */}
                                            <div className="col-sm-6">
                                                {firstHalf.map((item, index) => {
                                                    const iconClass = getAmenityIcon(item.amenity);

                                                    return (
                                                        <div key={index} className="d-flex align-items-center mb-3">
                                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                                <i className={`isax ${iconClass} fs-16`}></i>
                                                            </span>
                                                            <p>{item.label}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Column 2 */}
                                            <div className="col-sm-6">
                                                {secondHalf.map((item, index) => {
                                                    const iconClass = getAmenityIcon(item.amenity);

                                                    return (
                                                        <div key={index} className="d-flex align-items-center mb-3">
                                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                                <i className={`isax ${iconClass} fs-16`}></i>
                                                            </span>
                                                            <p>{item.label}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Popular Amenities */}

                                {/* Room types */}
                                {/* <div className="border-bottom pb-2 mb-4">
                                <h5 className="mb-3 fs-18">Room types</h5>
                                <div className="row">
                                    <div className="col-sm-6 col-lg-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-send-sqaure-2 fs-16"></i>
                                            </span>
                                            <p>Smoking rooms</p>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-building fs-16"></i>
                                            </span>
                                            <p>City View</p>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-diamonds fs-16"></i>
                                            </span>
                                            <p>Suite</p>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-buildings-2 fs-16"></i>
                                            </span>
                                            <p>Connecting Rooms</p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                                {/* /Room types */}

                                {/* Availability */}
                                <div className="border-bottom pb-2 mb-4" id="availability">
                                    <h5 className="mb-3 fs-18">Availability</h5>
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="banner-form">
                                                <form className="d-lg-flex">
                                                    <div className="d-flex form-info">
                                                        <div className="form-item">
                                                            <label className="form-label fs-14 text-default mb-1">Check In</label>
                                                            <DatePicker
                                                                className="form-control datetimepicker"
                                                                placeholder="dd/mm/yyyy"
                                                                value={checkIn}
                                                                onChange={(value) => {
                                                                    const next = applyHotelCheckInChange(value, checkOut);
                                                                    setCheckIn(next.checkIn);
                                                                    setCheckOut(next.checkOut);
                                                                }}
                                                                format="DD-MM-YYYY"
                                                                allowClear={false}
                                                                disabledDate={disableBeforeToday}
                                                            />
                                                            <p className="fs-12 mb-0">{checkIn ? checkIn.format("dddd") : ""}</p>
                                                        </div>
                                                        <div className="form-item">
                                                            <label className="form-label fs-14 text-default mb-1">Check Out</label>
                                                            <DatePicker
                                                                className="form-control datetimepicker"
                                                                placeholder="dd/mm/yyyy"
                                                                onChange={(value) => setCheckOut(applyHotelCheckOutChange(value, checkIn))}
                                                                value={checkOut}
                                                                format="DD-MM-YYYY"
                                                                allowClear={false}
                                                                disabledDate={disableHotelCheckOutDate(checkIn)}
                                                            />
                                                            <p className="fs-12 mb-0">{checkOut ? checkOut.format("dddd") : ""}</p>
                                                        </div>
                                                        <div className="form-item dropdown">
                                                            <div data-bs-toggle="dropdown" data-bs-auto-close="outside" role="menu">
                                                                <label className="form-label fs-14 text-default mb-1">Guests</label>
                                                                <h5>{guests?.adults} <span className="fw-normal fs-14">Persons</span></h5>
                                                            </div>
                                                            <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                                                <h5 className="mb-3">Select Travelers &  Class</h5>
                                                                <div className="mb-3 border br-10 info-item pb-1">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                <label className="form-label text-gray-9 mb-2">Rooms</label>
                                                                                <BannerCounter min={1} value={guests.rooms} onChange={(value) => setGuests((prev) => ({ ...prev, rooms: value }))} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-12">
                                                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                <label className="form-label text-gray-9 mb-2">Adults</label>
                                                                                <BannerCounter min={1} value={guests.adults} onChange={(value) => setGuests((prev) => ({ ...prev, adults: value }))} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-12">
                                                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                <label className="form-label text-gray-9 mb-2">Children <span className="text-default fw-normal">( 2-12 Yrs )</span></label>
                                                                                <BannerCounter
                                                                                    min={0}
                                                                                    value={guests.children}
                                                                                    onChange={(value) => {
                                                                                        setGuests((prev) => {
                                                                                            let newAges = [...(prev.childAges || [])];

                                                                                            if (value > prev.children) {
                                                                                                while (newAges.length < value) {
                                                                                                    newAges.push(5); // default age
                                                                                                }
                                                                                            } else {
                                                                                                newAges = newAges.slice(0, value);
                                                                                            }

                                                                                            return {
                                                                                                ...prev,
                                                                                                children: value,
                                                                                                childAges: newAges
                                                                                            };
                                                                                        });
                                                                                    }}
                                                                                />
                                                                            </div>

                                                                            {/* Child Age Selectors */}
                                                                            {guests.children > 0 && (
                                                                                <div className="mb-3">
                                                                                    <label className="form-label text-gray-9 mb-2">
                                                                                        Children Ages
                                                                                    </label>

                                                                                    <div className="d-flex flex-wrap gap-2">
                                                                                        {guests.childAges?.map((age, index) => (
                                                                                            <select
                                                                                                key={index}
                                                                                                className="form-select"
                                                                                                style={{ width: "120px" }}
                                                                                                value={age}
                                                                                                onChange={(e) => {
                                                                                                    const newAges = [...guests.childAges];
                                                                                                    newAges[index] = Number(e.target.value);

                                                                                                    setGuests((prev) => ({
                                                                                                        ...prev,
                                                                                                        childAges: newAges
                                                                                                    }));
                                                                                                }}
                                                                                            >
                                                                                                {Array.from({ length: 17 }, (_, i) => (
                                                                                                    <option key={i} value={i + 1}>
                                                                                                        {i + 1} yrs
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                        </div>
                                                                        <div className="col-md-12">
                                                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                                <label className="form-label text-gray-9 mb-2">Infants <span className="text-default fw-normal">( 0-12 Yrs )</span></label>
                                                                                <BannerCounter min={1} value={guests.infants} onChange={(value) => setGuests((prev) => ({ ...prev, infants: value }))} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3 border br-10 info-item pb-1">
                                                                    <h6 className="fs-16 fw-medium mb-2">Travellers</h6>
                                                                    <div className="d-flex align-items-center flex-wrap">
                                                                        <div className="form-check me-3 mb-3">
                                                                            <input className="form-check-input" type="radio" name="room" id="room1" defaultChecked />
                                                                            <label className="form-check-label" htmlFor="room1">
                                                                                Single
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-check me-3 mb-3">
                                                                            <input className="form-check-input" type="radio" name="room" id="room2" />
                                                                            <label className="form-check-label" htmlFor="room2">
                                                                                Double
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-check me-3 mb-3">
                                                                            <input className="form-check-input" type="radio" name="room" id="room3" />
                                                                            <label className="form-check-label" htmlFor="room3">
                                                                                Delux
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-check mb-3">
                                                                            <input className="form-check-input" type="radio" name="room" id="room4" />
                                                                            <label className="form-check-label" htmlFor="room4">
                                                                                Suite
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3 border br-10 info-item pb-1">
                                                                    <h6 className="fs-16 fw-medium mb-2">Property Type</h6>
                                                                    <div className="d-flex align-items-center flex-wrap">
                                                                        <div className="form-check me-3 mb-3">
                                                                            <input className="form-check-input" type="radio" name="property" id="property1" defaultChecked />
                                                                            <label className="form-check-label" htmlFor="property1">
                                                                                Villa
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-check me-3 mb-3">
                                                                            <input className="form-check-input" type="radio" name="property" id="property2" />
                                                                            <label className="form-check-label" htmlFor="property2">
                                                                                Condo
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-check me-3 mb-3">
                                                                            <input className="form-check-input" type="radio" name="property" id="property3" />
                                                                            <label className="form-check-label" htmlFor="property3">
                                                                                Cabin
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-check mb-3">
                                                                            <input className="form-check-input" type="radio" name="property" id="property4" />
                                                                            <label className="form-check-label" htmlFor="property4">
                                                                                Apartments
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex justify-content-end">
                                                                    <Link to="#" className="btn btn-light btn-sm me-2">Cancel</Link>
                                                                    <button type="button" className="btn btn-primary btn-sm">Apply</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* <div className="form-item dropdown">
                                                        <div data-bs-toggle="dropdown" data-bs-auto-close="outside" role="menu">
                                                            <label className="form-label fs-14 text-default mb-1">Price per Night</label>
                                                            <input type="text" className="form-control" defaultValue="$1000 - $15000" />
                                                        </div>
                                                        <div className="dropdown-menu dropdown-md p-0">
                                                            <ul>
                                                                <li className="border-bottom">
                                                                    <Link className="dropdown-item" to="#">
                                                                        <h6 className="fs-16 fw-medium">$500 - $2000</h6>
                                                                        <p>Upto 65% offers</p>
                                                                    </Link>
                                                                </li>
                                                                <li className="border-bottom">
                                                                    <Link className="dropdown-item" to="#">
                                                                        <h6 className="fs-16 fw-medium">Upto 65% offers</h6>
                                                                        <p>Upto 40% offers</p>
                                                                    </Link>
                                                                </li>
                                                                <li className="border-bottom">
                                                                    <Link className="dropdown-item" to="#">
                                                                        <h6 className="fs-16 fw-medium">$5000 - $8000</h6>
                                                                        <p>Upto 35% offers</p>
                                                                    </Link>
                                                                </li>
                                                                <li className="border-bottom">
                                                                    <Link className="dropdown-item" to="#">
                                                                        <h6 className="fs-16 fw-medium">$9000 - $11000</h6>
                                                                        <p>Upto 20% offers</p>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link className="dropdown-item" to="#">
                                                                        <h6 className="fs-16 fw-medium">$11000 - $15000</h6>
                                                                        <p>Upto 10% offers</p>
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div> */}
                                                    </div>
                                                    <button type="button" className="btn btn-primary search-btn rounded">Search</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hotel-list">
                                        {/* <div className="place-item mb-4">
                                        <div className="place-img">
                                            <div className="img-slider image-slide owl-carousel nav-center">
                                                <Slider {...imgslideroption}>
                                                    <div className="slide-images">
                                                        <Link to={routes.hotelDetails}>
                                                            <ImageWithBasePath src="/assets/img/hotels/hotel-08.jpg" className="img-fluid" alt="img" />
                                                        </Link>
                                                    </div>
                                                    <div className="slide-images">
                                                        <Link to={routes.hotelDetails}>
                                                            <ImageWithBasePath src="/assets/img/hotels/hotel-03.jpg" className="img-fluid" alt="img" />
                                                        </Link>
                                                    </div>
                                                </Slider>
                                            </div>
                                            <div className="fav-item" key={1} onClick={() => handleItemClick(1)}>
                                                <span className="badge bg-pink">Popular</span>
                                                <Link to="#" className={`fav-icon ${selectedItems[1] ? 'selected' : ''}`}>
                                                    <i className="isax isax-heart5"></i>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="place-content pb-1">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                <div className="overflow-hidden">
                                                    <h5 className="mb-2 d-inline-flex align-items-center text-truncate"><Link to={routes.hotelDetails}>Queen Room</Link><span className="badge badge-xs badge-success rounded-pill ms-2">19% Offer</span></h5>
                                                </div>
                                                <div className="d-flex align-items-center text-nowrap mb-2">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.3</span>
                                                    <p className="fs-14">(500 Reviews)</p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Sleeps 2</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">1 Queen Bed</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">City View </span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">15 m²</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Free WiFi</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Private Safe</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill mb-2">Free Self Parking</span>
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <p className="me-2 mb-2 d-inline-flex align-items-center"><i className="isax isax-tick-circle5 text-success me-2"></i>Refundable</p>
                                                <p className="mb-2 d-inline-flex align-items-center"><i className="isax isax-tick-circle5 text-success me-2"></i>Express check-in/out available</p>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                <h5 className="text-primary me-2 mb-3">$500 <span className="text-default text-decoration-line-through">$654</span> <span className="fs-14 fw-normal text-default">/ Night</span></h5>
                                                <div className="d-flex align-items-center">
                                                    <Link to="#" data-bs-toggle="modal" data-bs-target="#room-details" className="fs-14 link-primary  me-3 mb-3">View Room Details</Link>
                                                    <div className="btn btn-primary btn-md mb-3">
                                                        <div className="form-check d-flex align-items-center ps-0">
                                                            <input className="form-check-input ms-0 mt-0 border border-white" name="book" type="checkbox" id="book1" defaultChecked />
                                                            <label className="form-check-label fs-13 text-white ms-2" htmlFor="book1">Select Room</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="place-item mb-4">
                                        <div className="place-img">
                                            <Link to={routes.hotelDetails}>
                                                <ImageWithBasePath src="/assets/img/hotels/hotel-02.jpg" className="img-fluid" alt="img" />
                                            </Link>
                                            <div className="fav-item justify-content-end" key={2} onClick={() => handleItemClick(2)}>
                                                <Link to="#" className={`fav-icon ${selectedItems[2] ? 'selected' : ''}`}>
                                                    <i className="isax isax-heart5"></i>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="place-content pb-1">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                <div className="overflow-hidden">
                                                    <h5 className="mb-2 d-inline-flex align-items-center text-truncate"><Link to={routes.hotelDetails}>Double Room</Link></h5>
                                                </div>
                                                <div className="d-flex align-items-center text-nowrap mb-2">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.9</span>
                                                    <p className="fs-14">(380 Reviews)</p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <p className="me-2 mb-2 d-inline-flex align-items-center"><i className="isax isax-tick-circle5 text-success me-2"></i>Reserve now, pay later</p>
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap mb-2">
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Sleeps 6</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">2 King Beds</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Family Room</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">23 m²</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">2 Bathrooms</span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                <h5 className="text-primary me-2 mb-3">$700 <span className="fs-14 fw-normal text-default">/ Night</span></h5>
                                                <div className="d-flex align-items-center">
                                                    <Link to="#" data-bs-toggle="modal" data-bs-target="#room-details" className="fs-14 link-primary  me-3 mb-3">View Room Details</Link>
                                                    <div className="btn btn-primary btn-md mb-3">
                                                        <div className="form-check d-flex align-items-center ps-0">
                                                            <input className="form-check-input ms-0 mt-0 border border-white" name="book" type="checkbox" id="book2" />
                                                            <label className="form-check-label fs-13 text-white ms-2" htmlFor="book2">Select Room</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="place-item mb-4">
                                        <div className="place-img">
                                            <Link to={routes.hotelDetails}>
                                                <ImageWithBasePath src="/assets/img/hotels/hotel-03.jpg" className="img-fluid" alt="img" />
                                            </Link>
                                            <div className="fav-item justify-content-end" key={3} onClick={() => handleItemClick(3)}>
                                                <Link to="#" className={`fav-icon ${selectedItems[3] ? 'selected' : ''}`}>
                                                    <i className="isax isax-heart5"></i>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="place-content pb-1">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                <div className="overflow-hidden">
                                                    <h5 className="mb-2 d-inline-flex align-items-center text-truncate"><Link to={routes.hotelDetails}>Executive Suite 1Bedroom</Link></h5>
                                                </div>
                                                <div className="d-flex align-items-center text-nowrap mb-2">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.9</span>
                                                    <p className="fs-14">(380 Reviews)</p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <p className="me-2 mb-2 d-inline-flex align-items-center"><i className="isax isax-tick-circle5 text-success me-2"></i>Reserve now, pay later</p>
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap mb-2">
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Sleeps 3</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">1 Bed</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Family Room</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">35 m²</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Free WiFi</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Private Safe</span>
                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill mb-2">Free Parking</span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                <h5 className="text-primary me-2 mb-3">$450 <span className="fs-14 fw-normal text-default">/ Night</span></h5>
                                                <div className="d-flex align-items-center">
                                                    <Link to="#" data-bs-toggle="modal" data-bs-target="#room-details" className="fs-14 link-primary  me-3 mb-3">View Room Details</Link>
                                                    <div className="btn btn-primary btn-md mb-3">
                                                        <div className="form-check d-flex align-items-center ps-0">
                                                            <input className="form-check-input ms-0 mt-0 border border-white" name="book" type="checkbox" id="book3" />
                                                            <label className="form-check-label fs-13 text-white ms-2" htmlFor="book3">Select Room</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}

                                        {Rooms.length === 0 ? (
                                            <p>No rooms available for selected dates.</p>
                                        ) : (
                                            // Group by room type, then by bed/view variant so guests
                                            // aren't faced with a flat list of near-identical rate
                                            // plans. Each variant shows its cheapest rate up front and
                                            // collapses the rest (Booking.com / Expedia style).
                                            Object.entries(
                                                Rooms.reduce((acc, room, index) => {
                                                    const key = room.name || "Room";
                                                    (acc[key] = acc[key] || []).push({ ...room, _index: index });
                                                    return acc;
                                                }, {} as Record<string, any[]>)
                                            ).map(([typeName, group], gIndex) => (
                                                <RoomTypeCard
                                                    key={gIndex}
                                                    typeName={typeName}
                                                    group={group}
                                                    onSelect={handleSelectRoom}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>


                                {/* /Availability */}



                                {/* Services */}
                                {/* <div className="border-bottom pb-2 mb-4">
                                <h5 className="mb-3 fs-18">Services</h5>
                                <div className="row">
                                    <div className="col-md-6 col-lg-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>Concierge Services</p>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>Daily Housekeeping</p>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>Front Desk Services</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p> Check-In/Check-Out Assistance</p>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>On-Site Restaurants</p>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>In-Room Dining</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>Concierge Services</p>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>Valet Parking</p>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                <i className="isax isax-verify fs-16"></i>
                                            </span>
                                            <p>Baby Sitting</p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                                {/* /Services */}

                                {/* Gallery */}
                                <div className="border-bottom pt-4 pb-4 mb-4">
                                    <h5 className="mb-3 fs-18">Gallery</h5>
                                    <Lightbox
                                        open={open}
                                        close={() => setOpen(false)}
                                        slides={
                                            hotel?.images?.length > 0
                                                ? hotel.images.map((img: string) => ({ src: img }))
                                                : [{ src: "/assets/img/hotels/hotel-large-01.jpg" }]
                                        }
                                        plugins={[Counter, Zoom, Thumbnails, Slideshow]}
                                        counter={{ container: { style: { top: "10px", left: "10px" } } }}
                                    />
                                    <div className="row row-cols-lg-6 row-cols-sm-4 row-cols-2 g-2">
                                        {hotel.images.map((img) => {
                                            return (
                                                <div className="col">
                                                    <Link
                                                        className="galley-wrap"
                                                        to="#"
                                                        onClick={() => setOpen(true)}
                                                        style={{
                                                            display: "block",
                                                            height: "120px",
                                                            overflow: "hidden",
                                                            borderRadius: "10px"
                                                        }}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt="img"
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    </Link>
                                                </div>
                                            )
                                        })
                                        }
                                    </div>
                                </div>
                                {/* <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-02.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-03.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-04.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-05.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-06.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-07.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-08.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-09.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-10.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <Link className="galley-wrap" data-fancybox="gallery" to="#" onClick={() => setOpen(true)}>
                                            <ImageWithBasePath src="/assets/img/hotels/hotel-gallery-11.jpg" alt="img" />
                                        </Link>
                                    </div>
                                    <div className="col">
                                        <div className="galley-wrap more-gallery d-flex align-items-center justify-content-center">
                                            <Link data-fancybox="gallery" to="#" onClick={() => setOpen(true)} className="btn btn-white btn-xs"><i className="isax isax-image5 me-1"></i>See All</Link>
                                        </div>
                                    </div> */}

                                {/* /Gallery */}

                                {/* Hotel Rules */}
                                <div className="border-bottom pb-2 mb-4">
                                    <h5 className="mb-3 fs-18">Hotel Rules</h5>
                                    <div className="card shadow-none mb-3">
                                        <div className="card-body p-3 pb-0">
                                            <h6 className="fw-medium mb-3">Check-In / Check-Out Policy</h6>
                                            <div className="d-flex align-items-center">
                                                <div className="d-flex align-items-center me-4 mb-3">
                                                    <i className="isax isax-clock fs-24 text-gray-9"></i>
                                                    <div className="ms-2">
                                                        <p className="mb-1">Check In</p>
                                                        <h6>{hotel.checkinTime}</h6>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center mb-3">
                                                    <i className="isax isax-clock fs-24 text-gray-9"></i>
                                                    <div className="ms-2">
                                                        <p className="mb-1">Check Out</p>
                                                        <h6>{hotel.checkoutTime}</h6>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`policy-wrap p-3 pb-2 mb-3 ${isPolicy ? '' : 'expanded'}`}>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                            <h6 className="fw-medium mb-2">Guarantee Policy</h6>
                                            <Link to="#" onClick={() => setIsPolicy(!isPolicy)} className="fs-14 fw-medium  toggle-btn mb-2">{isPolicy ? 'Show Less' : 'Show More'}</Link>
                                        </div>
                                        <div className="policy-info pb-2" style={{ display: isPolicy ? 'block' : 'none' }}>
                                            <p className="mb-0">- A valid credit card will be required upon booking;</p>
                                            <p className="mb-0">- For credit card reservations, the same card(s) must be presented upon check in at the respective hotels;</p>
                                            <p className="mb-0">- Management reserves the right to cancel any reservations without notice if we are notified of any fraud or illegal activities associated with the full payments received.</p>
                                        </div>
                                    </div>
                                    <div className={`policy-wrap p-3 pb-2 mb-3 ${isPolicy2 ? '' : 'expanded'}`}>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                            <h6 className="fw-medium mb-2">Children Policy</h6>
                                            <Link to="#" onClick={() => setIsPolicy2(!isPolicy2)} className="fs-14 fw-medium  toggle-btn mb-2">{isPolicy2 ? 'Show Less' : 'Show More'}</Link>
                                        </div>
                                        <div className="policy-info pb-2 hide" style={{ display: isPolicy2 ? 'block' : 'none' }}>
                                            <p className="mb-0">- A valid credit card will be required upon booking;</p>
                                            <p className="mb-0">- For credit card reservations, the same card(s) must be presented upon check in at the respective hotels;</p>
                                            <p className="mb-0">- Management reserves the right to cancel any reservations without notice if we are notified of any fraud or illegal activities associated with the full payments received.</p>
                                        </div>
                                    </div>
                                    <div className={`policy-wrap p-3 pb-2 mb-3 ${isPolicy3 ? '' : 'expanded'}`}>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                            <h6 className="fw-medium mb-2">Cancellation/Amendment Policy</h6>
                                            <Link to="#" onClick={() => setIsPolicy3(!isPolicy3)} className="fs-14 fw-medium  toggle-btn mb-2">{isPolicy3 ? 'Show Less' : 'Show More'}</Link>
                                        </div>
                                        <div className="policy-info pb-2 hide" style={{ display: isPolicy3 ? 'block' : 'none' }}>
                                            <p className="mb-0">- A valid credit card will be required upon booking;</p>
                                            <p className="mb-0">- For credit card reservations, the same card(s) must be presented upon check in at the respective hotels;</p>
                                            <p className="mb-0">- Management reserves the right to cancel any reservations without notice if we are notified of any fraud or illegal activities associated with the full payments received.</p>
                                        </div>
                                    </div>
                                    <div className={`policy-wrap p-3 pb-2 mb-3 ${isPolicy4 ? '' : 'expanded'}`}>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                            <h6 className="fw-medium mb-2">Late check-out Policy</h6>
                                            <Link to="#" onClick={() => setIsPolicy4(!isPolicy4)} className="fs-14 fw-medium  toggle-btn mb-2">{isPolicy4 ? 'Show Less' : 'Show More'}</Link>
                                        </div>
                                        <div className="policy-info pb-2 hide" style={{ display: isPolicy4 ? 'block' : 'none' }}>
                                            <p className="mb-0">- A valid credit card will be required upon booking;</p>
                                            <p className="mb-0">- For credit card reservations, the same card(s) must be presented upon check in at the respective hotels;</p>
                                            <p className="mb-0">- Management reserves the right to cancel any reservations without notice if we are notified of any fraud or illegal activities associated with the full payments received.</p>
                                        </div>
                                    </div>
                                </div>
                                {/* /Hotel Rules */}

                                {/* Services */}
                                {/* <div className="border-bottom pb-2 mb-4">
                                <h5 className="mb-3 fs-18">Services</h5>
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Wheelchair accessible</p>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Visual alarms in hallways</p>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Wheelchair-accessible gym</p>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Elevator</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Braille/raised signage</p>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Wheelchair-accessible business center</p>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Wheelchair-accessible lounge</p>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-magic-star fs-14 me-2"></i>Wheelchair-accessible concierge desk</p>
                                    </div>
                                </div>
                            </div> */}
                                {/* /Services */}

                                {/* Frequently Asked Questions */}
                                <div className="border-bottom pb-3 mb-4">
                                    <h5 className="mb-3 fs-18">Frequently Asked Questions</h5>
                                    <div className="accordion faq-accordion" id="accordionFaq">
                                        <div className="accordion-item show mb-2">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button fw-medium" type="button" data-bs-toggle="collapse" data-bs-target="#faq-collapseOne" aria-controls="faq-collapseOne">
                                                    Does offer free cancellation for a full refund?
                                                </button>
                                            </h2>
                                            <div id="faq-collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">Does have fully refundable room rates available to book on our site. If you’ve booked a fully refundable room rate, this can be cancelled up to a few days before check-in depending on the property's cancellation policy. Just make sure to check this property's cancellation policy for the exact terms and conditions.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item mb-2">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-two" aria-controls="faq-two">
                                                    Is there a pool?
                                                </button>
                                            </h2>
                                            <div id="faq-two" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">Does have fully refundable room rates available to book on our site. If you’ve booked a fully refundable room rate, this can be cancelled up to a few days before check-in depending on the property's cancellation  policy. Just make sure to check this property's cancellation policy for the exact terms and conditions.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item mb-2">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-three" aria-controls="faq-three">
                                                    Are pets allowed?
                                                </button>
                                            </h2>
                                            <div id="faq-three" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">Does have fully refundable room rates available to book on our site. If you’ve booked a fully refundable room rate, this can be cancelled up to a few days before check-in depending on the property's cancellation  policy. Just make sure to check this property's cancellation policy for the exact terms and conditions.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item mb-2">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-four" aria-controls="faq-four">
                                                    Is airport shuttle service offered?
                                                </button>
                                            </h2>
                                            <div id="faq-four" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">Does have fully refundable room rates available to book on our site. If you’ve booked a fully refundable room rate, this can be cancelled up to a few days before check-in depending on the property's cancellation  policy. Just make sure to check this property's cancellation policy for the exact terms and conditions.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item mb-2">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-five" aria-controls="faq-five">
                                                    What are the check-in and check-out times?
                                                </button>
                                            </h2>
                                            <div id="faq-five" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                <div className="accordion-body">
                                                    <p className="mb-0">Does have fully refundable room rates available to book on our site. If you’ve booked a fully refundable room rate, this can be cancelled up to a few days before check-in depending on the property's cancellation policy. Just make sure to check this property's cancellation policy for the exact terms and conditions.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Frequently Asked Questions */}

                                {/* <Lightbox
                                open={open2}
                                close={() => setOpen2(false)}
                                slides={hotel?.images?.length > 0
                                    ? hotel.images.map((img: string) => ({ src: img }))
                                    : [{ src: "/assets/img/hotels/hotel-large-01.jpg" }]}
                            /> */}

                                <Lightbox
                                    open={open2}
                                    close={() => setOpen2(false)}
                                    index={galleryIndex}
                                    on={{ view: ({ index }) => setGalleryIndex(index) }}
                                    slides={
                                        hotel?.images?.length > 0
                                            ? hotel.images.map((img: string) => ({ src: img }))
                                            : [{ src: "/assets/img/hotels/hotel-large-01.jpg" }]
                                    }
                                    plugins={[Counter, Zoom, Thumbnails, Slideshow]}
                                    counter={{ container: { style: { top: "10px", left: "10px" } } }}
                                />
                            </div>
                            {/* /Hotel Details */}

                            {/* Sidebar Details */}
                            <div className="col-xl-4 ">
                                <StickyContent
                                    key={`${hotel?.address?.latitude}-${hotel?.address?.longitude}`}
                                    hotel={{
                                        ...hotel,
                                        distance: selectedHotel?.distance,
                                        provider: selectedHotel?.provider || provider,
                                    }}
                                />
                            </div>
                            {/* /Sidebar Details */}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default HotelDetails